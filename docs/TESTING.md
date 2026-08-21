# Testing

## Backend

### Running Tests

```bash
cd apps/backend
npm test
```

### Test Structure

- **Unit**: `src/modules/**/*.spec.ts` — tests services and controllers with mocked dependencies
- **Integration**: `test/*.spec.ts` — tests ingestion pipeline with fixture GTFS data
- **Fixtures**: `test/fixtures/` — sample GTFS feeds for deterministic testing

### Test Coverage

| Area | Tests |
|------|-------|
| Transit controller | operators, routes, stops, stations, nearby |
| GTFS ingestion pipeline | valid GTFS, dry-run mode, orphan detection, optional files |
| CSV parser | parsing, missing file handling |
| GtfsValidator | coordinate bounds, transit-day times |
| GtfsNormalizer | GTFS time preservation |
| DatasetRegistry | dataset lifecycle methods |

### Transit Ingestion Test Fixtures

Located in `apps/backend/test/fixtures/`:
- `transjakarta/` — valid GTFS feed with routes, stops, trips, calendars, transfers
- `transjakarta_no_transfers/` — valid feed without transfers.txt (optional)
- `bad_orphan/` — feed with orphan reference (route→missing agency, stop_time→missing stop)

### Test Data

```bash
npm test -- --testNamePattern="GtfsIngestionPipeline"
```

## Mobile (Flutter)

Flutter tests are defined in `apps/mobile/test/`. Physical device verification requires `flutter` SDK and an emulator. Run:

```bash
cd apps/mobile
flutter test
flutter analyze
```

### Flutter Changes in Phase 3

- `lib/features/transit/domain/models.dart` — transit domain models (TransitOperator, TransitRoute, TransitStop, TransitStation, NearbyTransitResult)
- `lib/features/transit/data/transit_repository.dart` — API repository with `getNearbyTransit`
- `lib/features/transit/state/nearby_transit_notifier.dart` — Riverpod state with loading/error/success states
- `lib/features/transit/ui/nearby_transit_widget.dart` — UI widget displaying nearby stops and stations

### Transit API Integration

Mobile app uses `ApiClient.get('/transit/nearby', ...)` to fetch nearby transit. Results are normalized into typed domain models.
