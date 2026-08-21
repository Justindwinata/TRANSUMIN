import { PlacesController } from './places.controller';
import { NominatimGeocodingService } from './nominatim-geocoding.service';

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: NominatimGeocodingService;

  beforeEach(() => {
    service = {
      forwardSearch: jest.fn(),
      reverseGeocode: jest.fn(),
    } as any;
    controller = new PlacesController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return empty results for short query', async () => {
    await expect(controller.search('a')).rejects.toThrow();
  });

  it('should return results for valid query', async () => {
    (service.forwardSearch as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Jakarta', latitude: -6.2, longitude: 106.8, type: 'generic', source: 'osm' },
    ]);
    const result = await controller.search('Jakarta');
    expect(result.results).toHaveLength(1);
  });

  it('should reverse geocode coordinates', async () => {
    (service.reverseGeocode as jest.Mock).mockResolvedValue({
      id: '1', name: 'Test', latitude: -6.2, longitude: 106.8, type: 'generic', source: 'osm',
    });
    const result = await controller.reverseGeocode('-6.2', '106.8');
    expect(result.result).toBeDefined();
  });
});
