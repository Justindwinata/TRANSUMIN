import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { RoutingEngine } from './routing.service';
import { RoutingController } from './routing.controller';
import { GeodesicWalkProvider } from './routing.constants';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    RoutingEngine,
    { provide: 'WalkProvider', useFactory: () => new GeodesicWalkProvider() },
  ],
  controllers: [RoutingController],
  exports: [RoutingEngine],
})
export class RoutingModule {}
