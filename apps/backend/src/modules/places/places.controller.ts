import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { NominatimGeocodingService } from './nominatim-geocoding.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly geocoder: NominatimGeocodingService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 2) {
      throw new HttpException('Query too short', HttpStatus.BAD_REQUEST);
    }

    try {
      const results = await this.geocoder.forwardSearch(query);
      return { query, results };
    } catch (err) {
      throw new HttpException(
        'Geocoding service unavailable',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Get('reverse')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      throw new HttpException('Invalid coordinates', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.geocoder.reverseGeocode(parsedLat, parsedLon);
      return { coordinates: { lat: parsedLat, lon: parsedLon }, result };
    } catch (err) {
      throw new HttpException(
        'Reverse geocoding failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
