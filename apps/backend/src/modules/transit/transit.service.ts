import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TransitService {
  constructor(private readonly prisma: PrismaClient) {}

  async getOperators() {
    return this.prisma.agency.findMany({
      select: { id: true, name: true, shortName: true, website: true },
    });
  }

  async getRoutes(agencyId?: string) {
    return this.prisma.route.findMany({
      where: agencyId ? { agencyId } : {},
      include: { agency: { select: { name: true } } },
    });
  }

  async getRouteById(routeId: string) {
    return this.prisma.route.findUnique({
      where: { id: routeId },
      include: { agency: true, trips: { take: 5 } },
    });
  }

  async getStops(agencyId?: string) {
    return this.prisma.stop.findMany({
      where: agencyId ? { agencyId } : {},
      select: { id: true, name: true, lat: true, lon: true, agencyId: true },
    });
  }

  async getStopById(stopId: string) {
    return this.prisma.stop.findUnique({
      where: { id: stopId },
      include: { stopTimes: { take: 10 } },
    });
  }

  async getStations() {
    return this.prisma.station.findMany({
      select: { id: true, name: true, lat: true, lon: true, operator: true },
    });
  }

  async getStationById(stationId: string) {
    return this.prisma.station.findUnique({
      where: { id: stationId },
      include: { stops: { take: 20 } },
    });
  }

  async getNearbyTransit(lat: number, lon: number, radiusKm: number = 1) {
    // Geodesic distance approximation: 1 degree ≈ 111 km
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const [stops, stations] = await Promise.all([
      this.prisma.stop.findMany({
        where: {
          lat: { gte: lat - latDelta, lte: lat + latDelta },
          lon: { gte: lon - lonDelta, lte: lon + lonDelta },
        },
        select: { id: true, name: true, lat: true, lon: true, agencyId: true },
        take: 20,
      }),
      this.prisma.station.findMany({
        where: {
          lat: { gte: lat - latDelta, lte: lat + latDelta },
          lon: { gte: lon - lonDelta, lte: lon + lonDelta },
        },
        select: { id: true, name: true, lat: true, lon: true, operator: true },
        take: 20,
      }),
    ]);

    return {
      stops: stops.map(s => ({
        ...s,
        distance: this.haversineDistance(lat, lon, s.lat, s.lon),
        type: 'stop',
      })),
      stations: stations.map(s => ({
        ...s,
        distance: this.haversineDistance(lat, lon, s.lat, s.lon),
        type: 'station',
      })),
    };
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
