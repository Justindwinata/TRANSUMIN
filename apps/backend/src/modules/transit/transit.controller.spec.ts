import { Test, TestingModule } from '@nestjs/testing';
import { TransitController } from './transit.controller';
import { TransitService } from './transit.service';

describe('TransitController', () => {
  let controller: TransitController;
  let service: TransitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransitController],
      providers: [
        {
          provide: TransitService,
          useValue: {
            getOperators: jest.fn().mockResolvedValue([
              { id: '1', name: 'KAI Commuter', shortName: 'KRL', website: 'https://commuterline.id' },
            ]),
            getRoutes: jest.fn().mockResolvedValue([
              { id: 'route-1', shortName: 'R1', longName: 'Route 1', routeType: 'rail', serviceType: 'KRL' },
            ]),
            getRouteById: jest.fn().mockResolvedValue({
              id: 'route-1',
              shortName: 'R1',
              longName: 'Route 1',
              routeType: 'rail',
              serviceType: 'KRL',
              agency: { name: 'KAI Commuter' },
            }),
            getStops: jest.fn().mockResolvedValue([
              { id: 'stop-1', name: 'Stop 1', lat: -6.2, lon: 106.8 },
            ]),
            getStopById: jest.fn().mockResolvedValue({
              id: 'stop-1',
              name: 'Stop 1',
              lat: -6.2,
              lon: 106.8,
            }),
            getStations: jest.fn().mockResolvedValue([
              { id: 'station-1', name: 'Jakarta Kota', lat: -6.175, lon: 106.827, operator: 'KAI' },
            ]),
            getStationById: jest.fn().mockResolvedValue({
              id: 'station-1',
              name: 'Jakarta Kota',
              lat: -6.175,
              lon: 106.827,
            }),
            getNearbyTransit: jest.fn().mockResolvedValue({
              stops: [{ id: 'stop-1', name: 'Stop 1', lat: -6.2, lon: 106.8, distance: 0.5, type: 'stop' }],
              stations: [{ id: 'station-1', name: 'Jakarta Kota', lat: -6.175, lon: 106.827, distance: 0.8, type: 'station' }],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<TransitController>(TransitController);
    service = module.get<TransitService>(TransitService);
  });

  it('should get operators', async () => {
    const result = await controller.getOperators();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('KAI Commuter');
  });

  it('should get routes', async () => {
    const result = await controller.getRoutes();
    expect(result).toHaveLength(1);
    expect(result[0].shortName).toBe('R1');
  });

  it('should get route by id', async () => {
    const result = await controller.getRouteById('route-1');
    expect(result?.id).toBe('route-1');
  });

  it('should get stops', async () => {
    const result = await controller.getStops();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Stop 1');
  });

  it('should get stop by id', async () => {
    const result = await controller.getStopById('stop-1');
    expect(result?.id).toBe('stop-1');
  });

  it('should get stations', async () => {
    const result = await controller.getStations();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jakarta Kota');
  });

  it('should get station by id', async () => {
    const result = await controller.getStationById('station-1');
    expect(result?.id).toBe('station-1');
  });

  it('should get nearby transit', async () => {
    const result = await controller.getNearbyTransit('-6.2', '106.8', '1');
    expect(result.stops).toHaveLength(1);
    expect(result.stations).toHaveLength(1);
  });
});