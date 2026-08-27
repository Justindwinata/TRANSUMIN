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

  async generateCrossOperatorTransfers(options: TransferGenerationOptions = {}): Promise<number> {
    const {
      maxWalkDistanceMeters = 300,
      minTransferTimeSeconds = 300,
      maxTransfersPerStop = 3,
      source = 'proximity',
    } = options;

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
      return 0;
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

    return transferCount;
  }

  private async generateOperatorPairTransfers(
    fromOperator: string,
    toOperator: string,
    fromStops: Array<{ id: string; name: string; lat: number; lon: number; agencyId: string }>,
    toStops: Array<{ id: string; name: string; lat: number; lon: number; agencyId: string }>,
    options: TransferGenerationOptions,
  ): Promise<number> {
    const maxWalk = options.maxWalkDistanceMeters ?? 500;
    const minTransfer = options.minTransferTimeSeconds ?? 180;
    const maxTransfers = options.maxTransfersPerStop ?? 5;
    const source = options.source;
    let count = 0;

    for (const fromStop of fromStops) {
      const candidates: Array<{ stop: typeof toStops[0]; distance: number }> = [];

      for (const toStop of toStops) {
        const distance = haversineDistance(fromStop.lat, fromStop.lon, toStop.lat, toStop.lon);
        if (distance <= maxWalk) {
          candidates.push({ stop: toStop, distance });
        }
      }

      candidates.sort((a, b) => a.distance - b.distance);

      for (const { stop: toStop, distance } of candidates.slice(0, maxTransfers)) {
        const walkDuration = Math.round(distance / 1.4);
        const totalTransferTime = Math.max(minTransfer, walkDuration + 120);

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
            confidence: Math.max(0.5, 1.0 - distance / maxWalk),
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
            confidence: Math.max(0.5, 1.0 - distance / maxWalk),
          },
        });

        count += 2;
      }
    }

    console.log(`Generated ${count} cross-operator transfers between ${fromOperator} and ${toOperator}`);
    return count;
  }

  async generateIntraOperatorTransfersFromShape(): Promise<number> {
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
          if (dist > 500) continue;

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
}
