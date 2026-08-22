# TRANSUM-IN Architecture Overview

## System Context

TRANSUM-IN is a multimodal transit journey planner for Jakarta, Indonesia. The system helps users find optimal routes across multiple transit operators (TransJakarta BRT, KRL Commuter Line, MRT, LRT) and walking.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│         Flutter Mobile App (iOS/Android)        │
│  ┌──────────────────────────────────────────┐  │
│  │   UI Layer (Screens, Widgets)           │  │
│  │  - HomeScreen (origin/destination)      │  │
│  │  - RouteOptionsScreen (alternatives)    │  │
│  │  - JourneyDetailScreen (step-by-step)   │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │   State Management (Riverpod)           │  │
│  │  - journeyProvider (search state)       │  │
│  │  - routeOptionsProvider (results)       │  │
│  │  - placeSearchProvider (geocoding)      │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │   Domain/Presentation Layer             │  │
│  │  - Journey models                       │  │
│  │  - Instruction mapper                   │  │
│  │  - Map model                            │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │   Data Layer (Repositories)             │  │
│  │  - RoutingRepository                    │  │
│  │  - GeocodingRepository                  │  │
│  │  - TransitRepository                    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           ↕ HTTP (Dio)
┌─────────────────────────────────────────────────┐
│   NestJS Backend (Node.js)                      │
│  ┌──────────────────────────────────────────┐  │
│  │   Controllers                           │  │
│  │  - POST /routing/plan                   │  │
│  │  - GET /places/search                   │  │
│  │  - GET /transit/nearby                  │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │   Services                              │  │
│  │  - RoutingEngine (multimodal planner)   │  │
│  │  - GeocodingService (geocoding)         │  │
│  │  - TransitService (GTFS data)           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │   Data Access Layer (Prisma)            │  │
│  │  - Trips, Routes, Stops, StopTimes     │  │
│  │  - ServiceCalendar, Transfers           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
           ↕ SQL
┌─────────────────────────────────────────────────┐
│   PostgreSQL Database                           │
│  - GTFS tables (stops, routes, trips, etc.)    │
│  - Service calendar data                       │
│  - Transfer information                        │
│  - Real-time extensions (future)               │
└─────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (Flutter)

**Layers**:
1. **UI Layer**: Material Design screens, widgets, navigation
2. **State Management**: Riverpod providers (immutable state, side effects)
3. **Presentation**: Domain-to-UI mapping (instructions, map models)
4. **Domain**: Strongly typed models (Journey, RouteAlternative, JourneySegment)
5. **Data**: Repositories (HTTP clients, data access)

**Key Patterns**:
- ConsumerWidget/ConsumerStatefulWidget for state access
- StateNotifier for mutable state (e.g., RouteOptionsNotifier)
- Provider for immutable state (e.g., journeyProvider)
- Separation of concerns: UI doesn't know about HTTP

### Backend (NestJS)

**Layers**:
1. **Controllers**: HTTP endpoints, request validation, response formatting
2. **Services**: Business logic (routing engine, geocoding)
3. **Data Access**: Prisma ORM, GTFS queries
4. **Domain**: TypeScript interfaces (Journey, Segment, RouteAlternative)
5. **Constants**: Routing weights, walk speed, geometry utilities

**Key Patterns**:
- Dependency injection (NestJS built-in)
- Service pattern for data access
- DTOs for request/response contracts
- Middleware for logging, error handling

### Database (PostgreSQL + Prisma)

**Schema**:
- **stops**: Transit stop/station data (GTFS)
- **routes**: Transit routes (GTFS)
- **trips**: Individual service trips (GTFS)
- **stop_times**: Stop-trip pairs with timing (GTFS)
- **service_calendars**: Service day definitions (GTFS)
- **transfers**: Transfer rules between stops
- **agencies**: Transit operators (GTFS)

**Indexes**: Stop ID, route ID, service ID for fast queries

## Data Flow: Search to Detail

```
USER INPUT
├─ Origin (place search or current location)
├─ Destination (place search)
└─ Optional: departure time

    ↓

FRONTEND STATE (journeyProvider)
├─ Stores origin, destination
├─ Validates completeness
└─ Triggers search when both set

    ↓

ROUTING REQUEST (JourneyRequest)
├─ origin: { lat, lon, name }
├─ destination: { lat, lon, name }
├─ departureTime: ISO 8601 (optional)
└─ preference: fastest | fewestTransfers | leastWalking | simplest

    ↓

BACKEND ROUTING ENGINE
├─ Find nearby transit stops (1.5 km radius)
├─ Query active services for request date
├─ Find direct journeys (single transit)
├─ Find transfer journeys (multiple transits)
├─ Rank alternatives by preference
└─ Return top 6 journeys

    ↓

ROUTING RESPONSE (RoutingResponseDto)
├─ journeys: Journey[]
│  ├─ id, origin, destination
│  ├─ departureTime, arrivalTime
│  ├─ summary: { duration, transfers, walking, fare }
│  ├─ primaryRankingBadge: "Tercepat" | "Minim Transit" | etc.
│  └─ segments: JourneySegment[]
│     ├─ type: WALK | TRANSIT | TRANSFER | WAIT
│     ├─ instruction: Human-readable text
│     ├─ fromName, toName
│     ├─ coordinates (lat/lon)
│     └─ Transit metadata (route, agency, stops)
└─ count, requestedAt

    ↓

FRONTEND STATE (routeOptionsProvider)
├─ Status: idle | searching | loading | success | noRoute | error
├─ Stores routes: RouteAlternative[]
├─ Request versioning (prevents stale responses)
└─ Error handling

    ↓

UI RENDERING (RouteOptionsScreen)
├─ Show loading spinner or route cards
├─ Each card: duration, times, modes, badges
├─ User selects route

    ↓

JOURNEY DETAIL SCREEN
├─ Display full route on map
├─ Generate step-by-step instructions
│  └─ JourneyInstructionMapper converts segments → instructions
├─ Timeline with icons and descriptions
└─ Summary statistics

    ↓

MAP VISUALIZATION
├─ Create markers: origin, destination, stops, transfers
├─ Create lines: walking (dashed), transit (colored), transfer
├─ Center and zoom to fit all markers
└─ FlutterMap rendering
```

## State Management Strategy

### Riverpod Providers

```dart
// Immutable state providers
final journeyProvider = StateNotifierProvider<JourneyNotifier, JourneyState>
  - origin: JourneyLocation?
  - destination: JourneyLocation?
  - isComplete: bool

// Mutable state with side effects
final routeOptionsProvider = StateNotifierProvider<RouteOptionsNotifier, RouteOptionsState>
  - status: RoutingStatus (idle | searching | loading | success | noRoute | error)
  - routes: RouteAlternative[]
  - failure: RoutingFailure?
  - requestId: String (version tracking)

// Data providers
final routingRepositoryProvider = Provider<RoutingRepository>
final placeSearchProvider = StateNotifierProvider<PlaceSearchNotifier, PlaceSearchState>
final locationProvider = StateNotifierProvider<LocationNotifier, LocationState>
```

### Request Identity Protection

```
Request 1: ID = "123456789"
  ↓ HTTP in progress
    User changes origin
    ↓
Request 2: ID = "123456790"
  ↓ HTTP in progress
    Response 1 arrives (stale, ignored due to ID mismatch)
    Response 2 arrives (current, ID matches, state updates)
```

## Error Handling Strategy

```
Exception
  ├─ Network error (socket, timeout, connection)
  │   └─ Status: error, message: "Tidak Ada Koneksi", isNetworkError: true
  ├─ API error (400, 500, etc.)
  │   └─ Status: error, message: exception text, isNetworkError: false
  ├─ Empty result ([] journeys)
  │   └─ Status: noRoute
  ├─ Parse error (malformed JSON)
  │   └─ Status: error, message: parse error text
  └─ Missing data (null fields in model)
      └─ Handled gracefully, defaults applied
```

## Extensibility Points

### Add New Transit Operator

1. Ingest GTFS data for operator
2. Create agency record
3. Update TransitMode enum in models
4. Update badge color scheme in design system
5. Update transit mode icon/label mapping

### Add Real-time Data

1. Add real_time_updates table to schema
2. Create real-time provider service
3. Update routing engine to incorporate delays
4. Add notification system
5. Update UI to show delay badges

### Add Pedestrian Routing

1. Replace GeodesicWalkProvider with pedestrian API client
2. Query actual walking paths instead of straight lines
3. Update map visualization to show actual paths
4. Remove "approximation" semantic from map model

### Add Fare Integration

1. Create fare calculation service
2. Query operator fare APIs or database
3. Update Journey.summary.fareText
4. Display estimated fares in UI

## Performance Considerations

### Frontend

- **State**: Riverpod caching prevents redundant API calls
- **Rendering**: ConsumerWidget rebuilds only when watched provider changes
- **Maps**: Lazy tile loading, limit markers/polylines
- **Lists**: use ListView.builder for large route lists

### Backend

- **Queries**: Indexed searches on stop ID, route ID, service ID
- **Caching**: Service calendar loaded once per request
- **Algorithm**: Greedy best-first search (not Dijkstra full graph)
- **Limits**: Max 6 journeys returned, max 5 origins/destinations considered

### Database

- **Indexes**: stop_id, route_id, service_id
- **Connection pooling**: Managed by Prisma
- **Query time**: <100ms for typical searches

## Security Considerations

- **Input validation**: Coordinates checked for Jakarta bounds
- **Rate limiting**: To be implemented in Phase 7
- **No authentication**: Current phase, future hardening needed
- **Error messages**: No sensitive data exposed
- **Data**: No PII stored or transmitted beyond user input

## Testing Strategy

See docs/TESTING.md for comprehensive test coverage.

## Deployment Architecture

**Development**:
- Backend: localhost:3000
- Mobile: local emulator
- Database: local PostgreSQL

**Production** (Phase 7+):
- Backend: Containerized NestJS (Docker)
- Mobile: App Store / Play Store
- Database: Managed PostgreSQL (Cloud provider)
- CDN: Static assets
- Monitoring: Error tracking, performance monitoring

## Future Enhancements

1. **Real-time Transit**: Live vehicle tracking, delays
2. **Multi-language**: Indonesian, English, others
3. **Accessibility**: Voice guidance, screen reader support
4. **Offline Maps**: Offline routing with cached GTFS
5. **Fare Integration**: Dynamic fare calculation
6. **User Accounts**: Saved routes, history, preferences
7. **Analytics**: Trip statistics, popular routes
8. **Alerts**: Service disruptions, crowding
9. **Bicycle Integration**: Bike-sharing, bike lanes
10. **Ride-hailing**: Uber/Grab integration

---

This architecture is designed for clarity, testability, and extensibility. Each layer has clear responsibilities. State management is predictable. Data flows are transparent. Future additions can be made without major refactoring.
