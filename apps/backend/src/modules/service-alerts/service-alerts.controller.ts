import { Controller, Get, Query } from '@nestjs/common';
import { ServiceAlertsService } from './service-alerts.service';
import { ServiceAlertQueryDto } from './dto/service-alert-query.dto';

@Controller('service-alerts')
export class ServiceAlertsController {
  constructor(private readonly serviceAlertsService: ServiceAlertsService) {}

  @Get()
  async getActiveAlerts(@Query() query: ServiceAlertQueryDto) {
    return this.serviceAlertsService.getActiveAlerts(query);
  }
}
