import { Test, TestingModule } from '@nestjs/testing';
import { ServiceAlertsController } from './service-alerts.controller';
import { ServiceAlertsService } from './service-alerts.service';

describe('ServiceAlertsController', () => {
  let controller: ServiceAlertsController;
  let service: ServiceAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceAlertsController],
      providers: [
        {
          provide: ServiceAlertsService,
          useValue: {
            getActiveAlerts: jest.fn().mockImplementation((query) => {
              const mockData = [
                {
                  id: 'sa-1',
                  title: 'Test Alert',
                  description: 'Test description',
                  startsAt: '2024-01-01T00:00:00.000Z',
                  endsAt: null,
                  severity: 'high',
                  status: 'active',
                  source: 'official',
                  operatorName: 'TransJakarta',
                  affectedRoute: '1',
                  affectedStop: 'Stop A',
                  createdAt: '2024-01-01T00:00:00.000Z',
                },
              ];
              if (query?.operatorName && query.operatorName !== 'TransJakarta') {
                return Promise.resolve([]);
              }
              return Promise.resolve(mockData);
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ServiceAlertsController>(ServiceAlertsController);
    service = module.get<ServiceAlertsService>(ServiceAlertsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return active alerts', async () => {
    const result = await controller.getActiveAlerts({});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Alert');
    expect(result[0].source).toBe('official');
  });

  it('should pass query parameters to service', async () => {
    const result = await controller.getActiveAlerts({ operatorName: 'Other' });
    expect(result).toHaveLength(0);
    expect(service.getActiveAlerts).toHaveBeenCalledWith({ operatorName: 'Other' });
  });
});
