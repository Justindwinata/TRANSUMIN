import { PrismaClient } from '@prisma/client';
import { RoutingEngine } from '../src/modules/routing/routing.service';
import { OptimizationProfile } from '../src/modules/routing/routing.types';

jest.mock('@prisma/client', () => {
  const stops = [
    { id: 'S1', name: 'Stasiun UI', lat: -6.363, lon: 106.828, agencyId: 'krl' },
    { id: 'S2', name: 'Stasiun Manggarai', lat: -6.197, lon: 106.852, agencyId: 'krl' },
    { id: 'S3', name: 'Monumen Nasional', lat: -6.175, lon: 106.823, agencyId: 'tj' },
  ];

  const calendar = [
    {
      serviceId: 'svc-weekday',
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
      saturday: false, sunday: false,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    },
  ];

  const trip = {
    id: 'trip-1',
    routeId: 'r1',
    serviceId: 'svc-weekday',
    directionId: 0,
    headsign: 'Bogor',
    route: {
      shortName: 'KRL',
      longName: 'KRL Commuter Line Bogor',
      color: '000000',
      serviceType: 'KRL',
      agency: { name: 'KAI Commuter' },
    },
    stopTimes: [
      { stopId: 'S1', stopSequence: 1, arrivalTime: '08:00:00', departureTime: '08:00:00', stopName: 'Stasiun UI', stopLat: -6.363, stopLon: 106.828 },
      { stopId: 'S2', stopSequence: 2, arrivalTime: '08:25:00', departureTime: '08:25:00', stopName: 'Stasiun Manggarai', stopLat: -6.197, stopLon: 106.852 },
    ],
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      stop: { findMany: jest.fn().mockResolvedValue(stops) },
      trip: {
        findMany: jest.fn().mockResolvedValue([trip]),
        findUnique: jest.fn().mockResolvedValue(trip),
      },
      serviceCalendar: { findMany: jest.fn().mockResolvedValue(calendar) },
      $disconnect: jest.fn(),
    })),
  };
});

describe('Routing response contract', () => {
  let engine: RoutingEngine;

  beforeEach(() => {
    const prisma = new PrismaClient();
    engine = new RoutingEngine(prisma);
  });

  it('should return journey with origin/destination coordinates', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828, name: 'UI' },
      destination: { latitude: -6.197, longitude: 106.852, name: 'Manggarai' },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.origin.latitude).toBe(-6.363);
    expect(journey.origin.longitude).toBe(106.828);
    expect(journey.destination.latitude).toBe(-6.197);
    expect(journey.destination.longitude).toBe(106.852);
    expect(journey.origin.name).toBe('UI');
    expect(journey.destination.name).toBe('Manggarai');
  });

  it('should return journey summary with transferCount', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.summary.transferCount).toBeGreaterThanOrEqual(0);
    expect(typeof journey.summary.transferCount).toBe('number');
  });

  it('should return journey summary with walkingDistanceMeters', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.summary.walkingDistanceMeters).toBeGreaterThanOrEqual(0);
    expect(typeof journey.summary.walkingDistanceMeters).toBe('number');
  });

  it('should return segments with type and instruction', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(Array.isArray(journey.segments)).toBe(true);

    for (const segment of journey.segments) {
      expect(segment.type).toBeDefined();
      expect(typeof segment.instruction).toBe('string');
      expect(typeof segment.fromName).toBe('string');
      expect(typeof segment.toName).toBe('string');
      expect(typeof segment.durationSeconds).toBe('number');
    }
  });

  it('should return transit segments with route and agency info', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    const transitSegments = journey.segments.filter((s: any) => s.type === 'TRANSIT');

    for (const seg of transitSegments) {
      expect(seg.routeShortName || seg.routeLongName).toBeDefined();
      expect(seg.departureTime).toBeDefined();
      expect(seg.arrivalTime).toBeDefined();
      expect(seg.intermediateStopsCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return journey with fareText', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.summary.fareText).toBeDefined();
    expect(typeof journey.summary.fareText).toBe('string');
  });

  it('should return journey with departure and arrival times', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(result.journeys.length).toBeGreaterThan(0);
    const journey = result.journeys[0];
    expect(journey.departureTime).toBeDefined();
    expect(journey.arrivalTime).toBeDefined();
    expect(journey.summary.totalDurationSeconds).toBeGreaterThan(0);
  });

  it('should return journeys array in response', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.363, longitude: 106.828 },
      destination: { latitude: -6.197, longitude: 106.852 },
      departureTime: '2024-08-19T07:50:00',
      preference: OptimizationProfile.FASTEST,
    });

    expect(Array.isArray(result.journeys)).toBe(true);
  });
});
