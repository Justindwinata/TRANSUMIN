import { PrismaClient } from '@prisma/client';
import { haversineDistance } from '../../routing/routing.constants';

export interface TransferGenerationOptions {
  maxWalkDistanceMeters?: number;
  minTransferTimeSeconds?: number;
  maxTransfersPerStop?: number;
  source?: string;
}

export class TransferGenerator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async generateTransfers(options: TransferGenerationOptions = {}): Promise<number> {
    const {
      maxWalkDistanceMeters = 300,
      minTransferTimeSeconds = 300,
      maxTransfersPerStop = 3,
      source = 'proximity',
    } = options;

    // First, remove any existing proximity/shape_proximity transfers that exceed limits
    const pruned = await this.pruneInvalidTransfers(maxWalkDistanceMeters, minTransferTimeSeconds);
    console.log(`Pruned ${pruned} invalid transfers`);

    const stops = await this.prisma.stop.findMany({
      select: {
        id: true,
        name: true,
        lat: true,
        lon: true,
        agencyId: true,
        agency: { select: { authority: true, name: true } },
      },
    });

    const stopsByOperator = new Map<string, typeof stops>();
    for (const stop of stops) {
      const operator = stop.agency?.authority ?? 'unknown';
      if (!stopsByOperator.has(operator)) {
        stopsByOperator.set(operator, []);
      }
      stopsByOperator.get(operator)!.push(stop);
    }

    const operators = Array.from(stopsByOperator.keys());
    if (operators.length < 2) {
      console.log('Only one operator found, skipping cross-operator transfers');
      return pruned;
    }

    let transferCount = 0;

    for (let i = 0; i < operators.length; i++) {
      for (let j = i + 1; j < operators.length; j++) {
        const op1Stops = stopsByOperator.get(operators[i])!;
        const op2Stops = stopsByOperator.get(operators[j])!;

        transferCount += await this.generateOperatorPairTransfers(
          operators[i],
          operators[j],
          op1Stops,
          op2Stops,
          { maxWalkDistanceMeters, minTransferTimeSeconds, maxTransfersPerStop, source },
        );
      }
    }

    return pruned + transferCount;
  }

  async pruneInvalidTransfers(maxWalkDistanceMeters: number, minTransferTimeSeconds: number): Promise<number> {
    let deletedCount = 0;

    // Delete transfers that exceed max walk distance
    const deletedDistance = await this.prisma.transfer.deleteMany({
      where: {
        walkDistance: { gt: maxWalkDistanceMeters },
        source: { in: ['proximity', 'shape_proximity', 'same_station'] },
      },
    });
    deletedCount += deletedDistance.count;

    // Delete transfers with minTransferTime below minimum (for generated transfers)
    // Use a lower threshold for same_station (180s = 3 minutes)
    const deletedTimeProximity = await this.prisma.transfer.deleteMany({
      where: {
        minTransferTime: { lt: minTransferTimeSeconds },
        source: { in: ['proximity', 'shape_proximity'] },
      },
    });
    deletedCount += deletedTimeProximity.count;

    const deletedTimeSameStation = await this.prisma.transfer.deleteMany({
      where: {
        minTransferTime: { lt: 180 },
        source: 'same_station',
      },
    });
    deletedCount += deletedTimeSameStation.count;

    return deletedCount;
  }

  private async generateOperatorPairTransfers(
    fromOperator: string,
    toOperator: string,
    fromStops: Array<{ id: string; name: string; lat: number; lon: number; agencyId: string }>,
    toStops: Array<{ id: string; name: string; lat: number; lon: number; agencyId: string }>,
    options: TransferGenerationOptions,
  ): Promise<number> {
    const { maxWalkDistanceMeters = 300, minTransferTimeSeconds = 300, maxTransfersPerStop = 3, source = 'proximity' } = options;
    let count = 0;

    for (const fromStop of fromStops) {
      const candidates: Array<{ stop: typeof toStops[0]; distance: number }> = [];

      for (const toStop of toStops) {
        const distance = haversineDistance(fromStop.lat, fromStop.lon, toStop.lat, toStop.lon);
        if (distance <= maxWalkDistanceMeters) {
          candidates.push({ stop: toStop, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);

      for (const { stop: toStop, distance } of candidates.slice(0, maxTransfersPerStop)) {
        const walkDuration = Math.round(distance / 1.4);
        const totalTransferTime = Math.max(minTransferTimeSeconds, walkDuration + 120);

        // Check if transfer already exists (either direction)
        const existing = await this.prisma.transfer.findFirst({
          where: {
            OR: [
              { fromStopId: fromStop.id, toStopId: toStop.id },
              { fromStopId: toStop.id, toStopId: fromStop.id },
            ],
          },
        });

        if (existing) continue;

        await this.prisma.transfer.create({
          data: {
            fromStopId: fromStop.id,
            toStopId: toStop.id,
            transferType: 2,
            minTransferTime: totalTransferTime,
            fromOperator,
            toOperator,
            walkDistance: distance,
            estimatedDuration: totalTransferTime,
            source: source ?? 'proximity',
            confidence: Math.max(0.5, 1.0 - distance / maxWalkDistanceMeters),
          },
        });

        await this.prisma.transfer.create({
          data: {
            fromStopId: toStop.id,
            toStopId: fromStop.id,
            transferType: 2,
            minTransferTime: totalTransferTime,
            fromOperator: toOperator,
            toOperator: fromOperator,
            walkDistance: distance,
            estimatedDuration: totalTransferTime,
            source: source ?? 'proximity',
            confidence: Math.max(0.5, 1.0 - distance / maxWalkDistanceMeters),
          },
        });

        count += 2;
      }
    }

    console.log(`Generated ${count} cross-operator transfers between ${fromOperator} and ${toOperator}`);
    return count;
  }

  async generateIntraOperatorTransfersFromShape(maxWalkDistanceMeters: number = 300): Promise<number> {
    const shapes = await this.prisma.shapePoint.findMany({
      select: { shapeId: true, ptLat: true, ptLon: true, ptSequence: true },
      orderBy: [{ shapeId: 'asc' }, { ptSequence: 'asc' }],
    });

    const shapeStops = new Map<string, Array<{ shapeId: string; lat: number; lon: number }>>();
    for (const sp of shapes) {
      if (!shapeStops.has(sp.shapeId)) shapeStops.set(sp.shapeId, []);
      shapeStops.get(sp.shapeId)!.push({ shapeId: sp.shapeId, lat: sp.ptLat, lon: sp.ptLon });
    }

    let count = 0;

    for (const [shapeId, points] of shapeStops) {
      const stops = await this.prisma.stop.findMany({
        where: { OR: points.map(p => ({ lat: p.lat, lon: p.lon })) },
        select: { id: true, name: true, lat: true, lon: true, agencyId: true },
      });

      if (stops.length < 2) continue;

      for (let i = 0; i < stops.length; i++) {
        for (let j = i + 1; j < stops.length; j++) {
          const dist = haversineDistance(stops[i].lat, stops[i].lon, stops[j].lat, stops[j].lon);
          if (dist > maxWalkDistanceMeters) continue;

          const existing = await this.prisma.transfer.findFirst({
            where: {
              OR: [
                { fromStopId: stops[i].id, toStopId: stops[j].id },
                { fromStopId: stops[j].id, toStopId: stops[i].id },
              ],
            },
          });

          if (existing) continue;

          const walkDuration = Math.round(dist / 1.4);
          const totalTime = Math.max(300, walkDuration + 60);

          await this.prisma.transfer.create({
            data: {
              fromStopId: stops[i].id,
              toStopId: stops[j].id,
              transferType: 2,
              minTransferTime: totalTime,
              fromOperator: stops[i].agencyId,
              toOperator: stops[j].agencyId,
              walkDistance: dist,
              estimatedDuration: totalTime,
              source: 'shape_proximity',
              confidence: 0.8,
            },
          });

          await this.prisma.transfer.create({
            data: {
              fromStopId: stops[j].id,
              toStopId: stops[i].id,
              transferType: 2,
              minTransferTime: totalTime,
              fromOperator: stops[j].agencyId,
              toOperator: stops[i].agencyId,
              walkDistance: dist,
              estimatedDuration: totalTime,
              source: 'shape_proximity',
              confidence: 0.8,
            },
          });

          count += 2;
        }
      }
    }

    return count;
  }

  async generateSameStationTransfers(): Promise<number> {
    // Create transfers between stops that share the same parent station
    const stations = await this.prisma.station.findMany({
      include: { stops: { select: { id: true, name: true, lat: true, lon: true, agencyId: true } } },
    });

    let count = 0;

    for (const station of stations) {
      const stops = station.stops;
      if (stops.length < 2) continue;

      for (let i = 0; i < stops.length; i++) {
        for (let j = i + 1; j < stops.length; j++) {
          const existing = await this.prisma.transfer.findFirst({
            where: {
              OR: [
                { fromStopId: stops[i].id, toStopId: stops[j].id },
                { fromStopId: stops[j].id, toStopId: stops[i].id },
              ],
            },
          });

          if (existing) continue;

          // Same-station transfer: walking distance is small, transfer time based on station layout
          const dist = haversineDistance(stops[i].lat, stops[i].lon, stops[j].lat, stops[j].lon);
          const walkDuration = Math.round(dist / 1.4);
          const totalTime = Math.max(180, walkDuration + 60); // Same station: minimum 3 minutes

          await this.prisma.transfer.create({
            data: {
              fromStopId: stops[i].id,
              toStopId: stops[j].id,
              transferType: 0, // Recommended/preferred
              minTransferTime: totalTime,
              fromOperator: stops[i].agencyId,
              toOperator: stops[j].agencyId,
              walkDistance: dist,
              estimatedDuration: totalTime,
              source: 'same_station',
              confidence: 1.0,
            },
          });

          await this.prisma.transfer.create({
            data: {
              fromStopId: stops[j].id,
              toStopId: stops[i].id,
              transferType: 0,
              minTransferTime: totalTime,
              fromOperator: stops[j].agencyId,
              toOperator: stops[i].agencyId,
              walkDistance: dist,
              estimatedDuration: totalTime,
              source: 'same_station',
              confidence: 1.0,
            },
          });

          count += 2;
        }
      }
    }

    return count;
  }
}
