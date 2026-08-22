jest.mock('@prisma/client', () => {
  // Calendar test fixtures
  const stops = [
    { id: 'stop-a', name: 'Stop A', lat: -6.2, lon: 106.8, agencyId: 'op-a' },
    { id: 'stop-b', name: 'Stop B', lat: -6.21, lon: 106.81, agencyId: 'op-a' },
  ];

  // Vary calendar configurations per test
  const calendar = [
    // Weekday only (Jan 2024)
    {
      serviceId: 'weekday-only',
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
      saturday: false, sunday: false,
      startDate: new Date('2024-01-01T00:00:00'), endDate: new Date('2024-12-31T23:59:59'),
    },
    // Weekend only
    {
      serviceId: 'weekend-only',
      monday: false, tuesday: false, wednesday: false, thursday: false, friday: false,
      saturday: true, sunday: true,
      startDate: new Date('2024-01-01T00:00:00'), endDate: new Date('2024-12-31T23:59:59'),
    },
    // Short window: only mid-March
    {
      serviceId: 'march-only',
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
      saturday: true, sunday: true,
      startDate: new Date('2024-03-15T00:00:00'), endDate: new Date('2024-03-20T23:59:59'),
    },
  ];

  const tripWeekday = {
    id: 'trip-weekday', routeId: 'r1', serviceId: 'weekday-only', directionId: 0, headsign: 'A to B',
    route: { shortName: 'W1', longName: 'Weekday Service', color: null, serviceType: 'bus', agency: { name: 'Op A' } },
    stopTimes: [
      { stopId: 'stop-a', stopSequence: 1, arrivalTime: '08:00:00', departureTime: '08:00:00', stopName: 'Stop A', stopLat: -6.2, stopLon: 106.8 },
      { stopId: 'stop-b', stopSequence: 2, arrivalTime: '08:15:00', departureTime: '08:15:00', stopName: 'Stop B', stopLat: -6.21, stopLon: 106.81 },
    ],
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      stop: { findMany: jest.fn().mockResolvedValue(stops) },
      trip: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          let result = [tripWeekday];
          if (where?.serviceId?.in) {
            result = result.filter(t => where.serviceId.in.includes(t.serviceId));
          }
          if (where?.stopTimes?.some?.stopId) {
            const stopIdFilter = where.stopTimes.some.stopId;
            if (typeof stopIdFilter === 'string') {
              result = result.filter(t => t.stopTimes.some((st: any) => st.stopId === stopIdFilter));
            } else if (stopIdFilter?.in) {
              result = result.filter(t => t.stopTimes.some((st: any) => stopIdFilter.in.includes(st.stopId)));
            }
          }
          return Promise.resolve(result);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(where?.id === tripWeekday.id ? tripWeekday : null);
        }),
      },
      serviceCalendar: {
        findMany: jest.fn().mockImplementation(({ where }: any) => {
          let result = calendar;
          if (where?.startDate?.lte) {
            result = result.filter((c: any) => c.startDate <= where.startDate.lte);
          }
          if (where?.endDate?.gte) {
            result = result.filter((c: any) => c.endDate >= where.endDate.gte);
          }
          return Promise.resolve(result);
        }),
      },
      $disconnect: jest.fn(),
    })),
  };
});

import { PrismaClient } from '@prisma/client';
import { RoutingEngine } from '../src/modules/routing/routing.service';
import { OptimizationProfile } from '../src/modules/routing/routing.types';

describe('Calendar edge cases', () => {
  let engine: RoutingEngine;

  beforeEach(() => {
    const prisma = new PrismaClient();
    engine = new RoutingEngine(prisma);
  });

  it('weekday service: Monday request yields journey', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.2, longitude: 106.8 },
      destination: { latitude: -6.21, longitude: 106.81 },
      departureTime: '2024-08-19T07:50:00', // Monday
      preference: OptimizationProfile.FASTEST,
    });
    expect(result.journeys.length).toBeGreaterThan(0);
  });

  it('weekday service: Sunday request yields no journeys', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.2, longitude: 106.8 },
      destination: { latitude: -6.21, longitude: 106.81 },
      departureTime: '2024-08-18T07:50:00', // Sunday
      preference: OptimizationProfile.FASTEST,
    });
    expect(result.journeys.length).toBe(0);
  });

  it('calendar before start date: yields no journey', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.2, longitude: 106.8 },
      destination: { latitude: -6.21, longitude: 106.81 },
      departureTime: '2023-12-31T07:50:00', // Before any start date in test
      preference: OptimizationProfile.FASTEST,
    });
    expect(result.journeys.length).toBe(0);
  });

  it('calendar after end date: yields no journey', async () => {
    const result = await engine.plan({
      origin: { latitude: -6.2, longitude: 106.8 },
      destination: { latitude: -6.21, longitude: 106.81 },
      departureTime: '2025-01-01T07:50:00', // After all end dates
      preference: OptimizationProfile.FASTEST,
    });
    expect(result.journeys.length).toBe(0);
  });
});
