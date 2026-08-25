import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { serviceAlertToDto } from './dto/service-alert.dto';
import { ServiceAlertQueryDto } from './dto/service-alert-query.dto';

@Injectable()
export class ServiceAlertsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getActiveAlerts(query?: ServiceAlertQueryDto) {
    const where: any = { status: 'active' };
    
    if (query?.operatorName) {
      where.operatorName = query.operatorName;
    }
    if (query?.affectedRoute) {
      where.affectedRoute = query.affectedRoute;
    }
    if (query?.affectedStop) {
      where.affectedStop = query.affectedStop;
    }
    if (query?.severity) {
      where.severity = query.severity;
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.source) {
      where.source = query.source;
    }

    const alerts = await this.prisma.serviceAlert.findMany({
      where,
      orderBy: { startsAt: 'desc' },
    });
    return alerts.map(serviceAlertToDto);
  }
}
