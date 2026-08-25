import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransitModule } from './modules/transit/transit.module';
import { UsersModule } from './modules/users/users.module';
import { PlacesModule } from './modules/places/places.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoutingModule } from './modules/routing/routing.module';
import { SavedPlacesModule } from './modules/saved-places/saved-places.module';
import { SavedJourneysModule } from './modules/saved-journeys/saved-journeys.module';
import { HistoryModule } from './modules/history/history.module';
import { ServiceAlertsModule } from './modules/service-alerts/service-alerts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TransitModule,
    UsersModule,
    PlacesModule,
    RoutingModule,
    SavedPlacesModule,
    SavedJourneysModule,
    HistoryModule,
    ServiceAlertsModule,
    NotificationsModule,
  ],
})
export class AppModule {}