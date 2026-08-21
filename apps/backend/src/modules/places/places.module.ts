import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { NominatimGeocodingService } from './nominatim-geocoding.service';

@Module({
  controllers: [PlacesController],
  providers: [NominatimGeocodingService],
  exports: [NominatimGeocodingService],
})
export class PlacesModule {}