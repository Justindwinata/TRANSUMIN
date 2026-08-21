import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(() => {
    healthController = new HealthController(
      { $queryRaw: jest.fn() } as any,
      { get: jest.fn() } as any,
    );
  });

  it('should return health status', async () => {
    const result = await healthController.check();
    expect(result).toHaveProperty('api', 'ok');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('env');
  });
});
