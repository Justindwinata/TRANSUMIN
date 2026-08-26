import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_WINDOW_MS') ? config.get<number>('RATE_LIMIT_WINDOW_MS')! / 1000 : 900,
          limit: config.get<number>('RATE_LIMIT_MAX_REQUESTS') || 100,
        },
      ],
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