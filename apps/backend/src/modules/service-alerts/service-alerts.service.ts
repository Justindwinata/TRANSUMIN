import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { serviceAlertToDto } from './dto/service-alert.dto';

@Injectable()
export class ServiceAlertsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getActiveAlerts() {
    const alerts = await this.prisma.serviceAlert.findMany({
      where: {
        status: 'active',
      },
      orderBy: { startsAt: 'desc' },
    });
    return alerts.map(serviceAlertToDto);
  }
}
