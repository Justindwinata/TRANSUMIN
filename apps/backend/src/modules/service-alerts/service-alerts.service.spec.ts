import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAlertsService } from './service-alerts.service';
import { PrismaClient } from '@prisma/client';

describe('ServiceAlertsService', () => {
  let service: ServiceAlertsService;
  let prisma: PrismaClient;

  const mockAlerts = [
    {
      id: 'sa-1',
      title: 'Alert 1',
      description: 'Desc 1',
      startsAt: new Date('2024-01-01'),
      endsAt: null,
      severity: 'high',
      status: 'active',
      source: 'live',
      operatorName: 'TransJakarta',
      affectedRoute: '1',
      affectedStop: null,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'sa-2',
      title: 'Alert 2',
      description: 'Desc 2',
      startsAt: new Date('2024-01-02'),
      endsAt: null,
      severity: 'low',
      status: 'active',
      source: 'fixture',
      operatorName: 'KCI',
      affectedRoute: 'Red Line',
      affectedStop: 'Manggarai',
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceAlertsService,
        {
          provide: PrismaClient,
          useValue: {
            serviceAlert: {
              findMany: jest.fn().mockImplementation(({ where }) => {
                return Promise.resolve(
                  mockAlerts.filter((a) => {
                    if (where.operatorName && a.operatorName !== where.operatorName) return false;
                    if (where.affectedRoute && a.affectedRoute !== where.affectedRoute) return false;
                    if (where.severity && a.severity !== where.severity) return false;
                    if (where.source && a.source !== where.source) return false;
                    return true;
                  }),
                );
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ServiceAlertsService>(ServiceAlertsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should return all active alerts when no query is provided', async () => {
    const result = await service.getActiveAlerts();
    expect(result).toHaveLength(2);
  });

  it('should filter alerts by operatorName', async () => {
    const result = await service.getActiveAlerts({ operatorName: 'TransJakarta' });
    expect(result).toHaveLength(1);
    expect(result[0].operatorName).toBe('TransJakarta');
  });

  it('should filter alerts by source provenance', async () => {
    const result = await service.getActiveAlerts({ source: 'live' });
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('live');
  });

  it('should filter alerts by severity', async () => {
    const result = await service.getActiveAlerts({ severity: 'low' });
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('low');
  });
});
