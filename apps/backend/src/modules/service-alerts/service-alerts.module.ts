import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ServiceAlertsService } from './service-alerts.service';
import { ServiceAlertsController } from './service-alerts.controller';

@Module({
  imports: [PrismaModule],
  providers: [ServiceAlertsService],
  controllers: [ServiceAlertsController],
})
export class ServiceAlertsModule {}
