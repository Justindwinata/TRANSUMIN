import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TransitService } from './transit.service';
import { TransitController } from './transit.controller';

@Module({
  imports: [PrismaModule],
  providers: [TransitService],
  controllers: [TransitController],
})
export class TransitModule {}