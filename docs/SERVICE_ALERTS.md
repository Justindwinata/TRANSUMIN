# Service Alerts

## Overview
Service alerts inform users of transit disruptions, delays, route changes, and scheduled maintenance. Alerts are fetched from backend and displayed contextually in journey planning and detail screens.

## Backend Implementation

### Prisma Model (`apps/backend/prisma/schema.prisma`)
```prisma
model ServiceAlert {
  id              String   @id @default(uuid())
  title           String
  description     String
  startsAt        DateTime @map("starts_at")
  endsAt          DateTime? @map("ends_at")
  severity        String   // info, minor, major, critical
  status          String   // active, resolved, scheduled
  operatorName    String?  @map("operator_name")
  affectedRoute   String?  @map("affected_route")
  affectedStop    String?  @map("affected_stop")
  createdAt       DateTime @default(now()) @map("created_at")
  @@map("service_alerts")
}
```

### API
- `GET /service-alerts` — Returns active alerts sorted by start time (most recent first)

### Module
- `ServiceAlertsModule` with `ServiceAlertsController` and `ServiceAlertsService`
- Registered in `AppModule`

## Mobile Implementation

### Domain (`lib/features/transit/domain/service_alert.dart`)
```dart
enum AlertSeverity { info, minor, major, critical }
enum AlertStatus { active, resolved, scheduled }

class ServiceAlert {
  final String id, title, description;
  final DateTime startsAt, endsAt?;
  final AlertSeverity severity;
  final AlertStatus status;
  final String? operatorName, affectedRouteShortName, affectedStopName;
  final bool isDevelopmentData;
  
  bool affectsRoute(String? routeShortName) => ...
}
```

### Repository (`lib/features/transit/data/service_alert_repository.dart`)
- Fetches from `GET /service-alerts` when online
- Falls back to `ServiceAlertFixtures.developmentAlerts()` when offline or on error
- Respects network status from `networkStatusProvider`

### UI
- **ServiceAlertScreen** (`/service-alerts`): Full list with severity colors
- **ServiceAlertWidget**: Reusable card showing title, description, severity
- **JourneyDetailScreen**: Shows only alerts affecting the selected route's segments

### Route Preference Integration
Backend `RoutingEngine` uses `OptimizationProfile` (FASTEST, FEWEST_TRANSFERS, LEAST_WALKING, SIMPLEST) to score and rank journeys. Mobile passes preference via `JourneyRequest.preference` → backend `RoutingRequestDto.preference`.

### Development Fixtures
Two labeled fixtures:
1. `[DEV] Demo: Penutupan Jalur sementara` — Major, active, TransJakarta route 1
2. `[DEV] Info: Penambahan jadwal` — Info, scheduled, KRL Commuter Line