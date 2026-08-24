import { Controller, Get } from '@nestjs/common';
import { ServiceAlertsService } from './service-alerts.service';

@Controller('service-alerts')
export class ServiceAlertsController {
  constructor(private readonly serviceAlertsService: ServiceAlertsService) {}

  @Get()
  async getActiveAlerts() {
    return this.serviceAlertsService.getActiveAlerts();
  }
}
