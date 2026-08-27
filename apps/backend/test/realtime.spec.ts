import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeManager } from '../src/modules/transit/realtime/realtime.manager';
import { RealtimeSourceStatus, RealtimeVehiclePosition } from '../src/modules/transit/realtime/realtime.types';

describe('RealtimeManager', () => {
  let manager: RealtimeManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeManager],
    }).compile();

    manager = module.get<RealtimeManager>(RealtimeManager);
  });

  it('should be defined', () => {
    expect(manager).toBeDefined();
  });

  it('should return disabled provider by default', () => {
    const provider = manager.getProvider('disabled');
    expect(provider).toBeDefined();
    expect(provider.name).toBe('disabled');
    expect(provider.status).toBe(RealtimeSourceStatus.UNAVAILABLE);
    expect(provider.isHealthy()).toBe(false);
  });

  it('should return empty arrays when no active providers', async () => {
    const positions = await manager.getVehiclePositions();
    const updates = await manager.getTripUpdates();
    const alerts = await manager.getServiceAlerts();

    expect(positions).toEqual([]);
    expect(updates).toEqual([]);
    expect(alerts).toEqual([]);
  });

  it('should track provider system status', () => {
    const status = manager.getSystemStatus();
    expect(status).toBeDefined();
    expect(status.providers).toHaveLength(1);
    expect(status.providers[0].name).toBe('disabled');
    expect(status.providers[0].status).toBe(RealtimeSourceStatus.UNAVAILABLE);
  });
});

describe('RealtimeProvider abstraction', () => {
  const mockProvider = {
    name: 'test',
    status: RealtimeSourceStatus.ACTIVE,
    lastUpdate: new Date(),
    isHealthy: () => true,
    getVehiclePositions: jest.fn().mockResolvedValue([]),
    getTripUpdates: jest.fn().mockResolvedValue([]),
    getServiceAlerts: jest.fn().mockResolvedValue([]),
  };

  it('should allow registering custom providers', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeManager],
    }).compile();

    const manager = module.get<RealtimeManager>(RealtimeManager);
    manager.registerProvider(mockProvider as any);

    const provider = manager.getProvider('test');
    expect(provider).toBe(mockProvider);
    expect(manager.getActiveProviders()).toContain(mockProvider);
  });
});

describe('RealtimeVehiclePosition type', () => {
  it('should create valid vehicle position', () => {
    const position: RealtimeVehiclePosition = {
      vehicleId: 'veh-001',
      tripId: 'trip-001',
      routeId: 'route-001',
      latitude: -6.2,
      longitude: 106.8,
      timestamp: new Date(),
      source: 'test',
    };

    expect(position.vehicleId).toBe('veh-001');
    expect(position.latitude).toBe(-6.2);
    expect(position.longitude).toBe(106.8);
  });
});