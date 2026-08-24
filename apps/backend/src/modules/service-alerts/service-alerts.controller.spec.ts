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
            getActiveAlerts: jest.fn().mockResolvedValue([
              {
                id: 'sa-1',
                title: 'Test Alert',
                description: 'Test description',
                startsAt: '2024-01-01T00:00:00.000Z',
                endsAt: null,
                severity: 'major',
                status: 'active',
                operatorName: 'TransJakarta',
                affectedRoute: '1',
                affectedStop: 'Stop A',
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            ]),
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
    const result = await controller.getActiveAlerts();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Alert');
  });
});
