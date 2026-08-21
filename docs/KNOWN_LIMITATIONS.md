# Known Limitations

## Phase 3 (Current)

- No iOS/Android emulator or simulator available; Flutter `flutter_map` and `geolocator` packages added to pubspec.yaml but **NOT device-verified**.
- TransJakarta GTFS feed ingestion tested via mock fixtures; live feed fetch requires a running PostgreSQL instance.
- Pedestrian routing engine not implemented; nearby transit distances use geodesic (haversine) distance only.
- Shape geometry (`shapes.txt`) parsing and storage foundation is defined but not yet fully implemented for map rendering.
- `calendar_dates.txt` (service exceptions) defined in schema but not yet normalized in ingestion pipeline.
- Real-time vehicle tracking and live arrival predictions are deferred to future phases.
- Route ranking and multimodal pathfinding are Phase 4 scope, not Phase 3.

## Phase 1 (Legacy)

- Backend requires a live PostgreSQL server; environment bootstrap is not yet automated.
- OAuth (Google/Facebook) flows are architectural placeholders — actual credentials and adapter wiring pending.
- Routing engine was not implemented in Phase 1 (addressed in Phase 3).
- Map provider abstracted but no specific SDK wired in Phase 1 (flutter_map added in Phase 3).

## Phase 2 (Resolvable)

- `flutter_map` package added to `pubspec.yaml` but tile rendering requires simulator for runtime validation.
- `geolocator` package added to `pubspec.yaml` but location services require simulator/device validation.
- Nominatim proxy remains unauthenticated — development only.
- Recent search remains mobile-only in-memory.
