import { Controller, Get, Query, Param } from '@nestjs/common';
import { TransitService } from './transit.service';

@Controller('transit')
export class TransitController {
  constructor(private readonly transitService: TransitService) {}

  @Get('operators')
  async getOperators() {
    return this.transitService.getOperators();
  }

  @Get('routes')
  async getRoutes(@Query('agencyId') agencyId?: string) {
    return this.transitService.getRoutes(agencyId);
  }

  @Get('routes/:id')
  async getRouteById(@Param('id') id: string) {
    return this.transitService.getRouteById(id);
  }

  @Get('stops')
  async getStops(@Query('agencyId') agencyId?: string) {
    return this.transitService.getStops(agencyId);
  }

  @Get('stops/:id')
  async getStopById(@Param('id') id: string) {
    return this.transitService.getStopById(id);
  }

  @Get('stations')
  async getStations() {
    return this.transitService.getStations();
  }

  @Get('stations/:id')
  async getStationById(@Param('id') id: string) {
    return this.transitService.getStationById(id);
  }

  @Get('nearby')
  async getNearbyTransit(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    return this.transitService.getNearbyTransit(
      parseFloat(lat),
      parseFloat(lon),
      radius ? parseFloat(radius) : 1,
    );
  }
}
