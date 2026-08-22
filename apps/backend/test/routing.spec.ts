import { PrismaClient } from '@prisma/client';
import { RoutingEngine, GeodesicWalkProvider } from '../src/modules/routing/routing.service';
import { OptimizationProfile } from '../src/modules/routing/routing.types';
import { haversineDistance, parseGtfsTimeToSeconds, WALK_SPEED_MPS } from '../src/modules/routing/routing.constants';

jest.mock('@prisma/client', () => {
  const stops = [
    { id: 'S1', name: 'Stasiun UI', lat: -6.363, lon: 106.828, agencyId: 'krl' },
    { id: 'S2', name: 'Stasiun Manggarai', lat: -6.197, lon: 106.852, agencyId: 'krl' },
    { id: 'S3', name: 'Monumen Nasional', lat: -6.175, lon: 106.823, agencyId: 'tj' },
    { id: 'S4', name: 'Blok M', lat: -6.244, lon: 106.800, agencyId: 'tj' },
  ];

  const calendar = [
    { serviceId: 'svc-weekday', monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
    { serviceId: 'svc-weekend', monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true, sunday: true, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
  ];

  const tripKrl = {
    id: 'trip-krl-01', routeId: 'r1', serviceId: 'svc-weekday', directionId: 0, headsign: 'Jakarta Kota',
    route: { shortName: 'KRL', longName: 'KRL Commuter Line Bogor', color: '000000', serviceType: 'KRL', agency: { name: 'KAI Commuter' } },
    stopTimes: [
      { stopId: 'S1', stopSequence: 1, arrivalTime: '08:00:00', departureTime: '08:00:00', stopName: 'Stasiun UI', stopLat: -6.363, stopLon: 106.828 },
      { stopId: 'S2', stopSequence: 2, arrivalTime: '08:25:00', departureTime: '08:25:00', stopName: 'Stasiun Manggarai', stopLat: -6.197, stopLon: 106.852 },
    ],
  };
  const tripTj1 = {
    id: 'trip-tj-01', routeId: 'r2', serviceId: 'svc-weekday', directionId: 0, headsign: 'Kota',
    route: { shortName: '1', longName: 'TransJakarta BRT Line 1', color: 'FF0000', serviceType: 'TRANSJAKARTA_BRT', agency: { name: 'TransJakarta' } },
    stopTimes: [
      { stopId: 'S2', stopSequence: 1, arrivalTime: '09:00:00', departureTime: '09:00:00', stopName: 'Stasiun Manggarai', stopLat: -6.197, stopLon: 106.852 },
      { stopId: 'S3', stopSequence: 2, arrivalTime: '09:15:00', departureTime: '09:15:00', stopName: 'Monumen Nasional', stopLat: -6.175, stopLon: 106.823 },
    ],
  };
  const tripTj2 = {
    id: 'trip-tj-02', routeId: 'r3', serviceId: 'svc-weekday', directionId: 0, headsign: 'Blok M',
    route: { shortName: '3', longName: 'TransJakarta BRT Line 3', color: 'FF0000', serviceType: 'TRANSJAKARTA_BRT', agency: { name: 'TransJakarta' } },
    stopTimes: [
      { stopId: 'S3', stopSequence: 1, arrivalTime: '10:00:00', departureTime: '10:00:00', stopName: 'Monumen Nasional', stopLat: -6.175, stopLon: 106.823 },
      { stopId: 'S4', stopSequence: 2, arrivalTime: '10:12:00', departureTime: '10:12:00', stopName: 'Blok M', stopLat: -6.244, stopLon: 106.800 },
    ],
  };

  const trips = [tripKrl, tripTj1, tripTj2];

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      stop: { findMany: jest.fn().mockResolvedValue(stops) },
      trip: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.stopTimes?.some?.stopId) {
            const stopId = where.stopTimes.some.stopId;
            return Promise.resolve(trips.filter(t => t.stopTimes.some(st => st.stopId === stopId)));
          }
          return Promise.resolve(trips);
        }),
        findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
          return Promise.resolve(trips.find(t => t.id === id) ?? null);
        }),
      },
      serviceCalendar: { findMany: jest.fn().mockResolvedValue(calendar) },
      $disconnect: jest.fn(),
    })),
  };
});

describe('RoutingEngine', () => {
  let engine: RoutingEngine;

  beforeEach(() => {
    const prisma = new PrismaClient();
    engine = new RoutingEngine(prisma);
  });

  it('should return direct journey for KRL S1->S2', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828, name: 'UI' },
      destination: { latitude: -6.197, longitude: 106.852, name: 'Manggarai' },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.id).toContain('trip-krl-01');
    expect(journey.summary.transferCount).toBe(0);
    expect(journey.segments.some(s => s.type === 'TRANSIT')).toBe(true);
    expect(journey.segments.some(s => s.type === 'WALK')).toBe(true);
  });

  it('should return transfer journey for KRL->TransJakarta S1->S3', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828, name: 'UI' },
      destination: { latitude: -6.175, longitude: 106.823, name: 'Monas' },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
  });

  it('should respect service calendar - weekend request', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828, name: 'UI' },
      destination: { latitude: -6.197, longitude: 106.852, name: 'Manggarai' },
      departureTime: '2024-08-17T08:00:00', // Saturday
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBe(0);
  });

  it('should return no journeys for origin outside walk radius', async () => {
    const result = await engine.plan({
      origin: { latitude: -7.5, longitude: 105.5, name: 'Far away' },
      destination: { latitude: -6.175, longitude: 106.823, name: 'Monas' },
      departureTime: '2024-08-19T08:00:00Z',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys).toEqual([]);
  });

  it('should validate haversineDistance calculation', () => {
    const d = haversineDistance(-6.2, 106.8, -6.201, 106.801);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(5000);
  });

  it('should calculate walk duration using WALK_SPEED_MPS', () => {
    const distance = 1000;
    const duration = Math.round(distance / WALK_SPEED_MPS);
    expect(duration).toBe(714);
  });

  it('should parse GTFS times exceeding 24:00', () => {
    expect(parseGtfsTimeToSeconds('25:30:00')).toBe(91800);
    expect(parseGtfsTimeToSeconds('00:00:00')).toBe(0);
    expect(parseGtfsTimeToSeconds('01:00:00')).toBe(3600);
  });
});

describe('RoutingEngine ranking', () => {
  let engine: RoutingEngine;

  beforeEach(() => {
    const prisma = new PrismaClient();
    engine = new RoutingEngine(prisma);
  });

  it('should rank by fastest preference', async () => {
    const fastest = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });
    if (fastest.journeys.length > 1) {
      expect(fastest.journeys[0].summary.totalDurationSeconds)
        .toBeLessThanOrEqual(fastest.journeys[1].summary.totalDurationSeconds);
    }
  });

  it('should return journey summary with fare = Tarif tidak tersedia', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
    });
    if (result.journeys.length > 0) {
      expect(result.journeys[0].summary.fareText).toBe('Tarif tidak tersedia');
    }
  });

  it('should add primary badge to top-ranked journey', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });
    if (result.journeys.length > 0) {
      expect(result.journeys[0].primaryRankingBadge).toBe('Tercepat');
    }
  });
});
