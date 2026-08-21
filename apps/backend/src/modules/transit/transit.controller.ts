import { Controller, Get } from '@nestjs/common';
import { TransitService } from './transit.service';

@Controller('transit')
export class TransitController {
  constructor(private readonly transitService: TransitService) {}

  @Get('routes')
  async getRoutes() {
    return this.transitService.getRoutes();
  }
}
