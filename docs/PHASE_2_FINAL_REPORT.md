# Phase 2 Final Report — TRANSUM-IN

## 1. Baseline & Final Commit
- Baseline Commit: `322dbe2`
- Final Commit: `8a1cf23`

## 2. New Commit Count
- Exactly **21 new meaningful commits**.

## 3. Complete Commit List
1. `0472b02` feat: location domain models (Coordinate, Location, Place, JourneyLocation)
2. `23696e2` docs: map provider decision (flutter_map with OSM)
3. `936eae4` feat: map service interface abstraction
4. `cc7083a` docs: location privacy and security policy
5. `0e5855c` feat: places module with Nominatim geocoding service and controller
6. `cd5a55f` feat: integrate PlacesModule into NestJS AppModule
7. `457458d` feats: separate API providers and update ApiClient for mobile
8. `0613acf` feat: extend API client with place search and reverse geocoding
9. `5033793` feat: geocoding repository with provider normalization
10. `532da8e` feat: place search state notifier with debounce
11. `db05ca0` feat: location state notifier with permission handling foundation
12. `185244f` feat: location input widget with current location button
13. `0560077` feat: search screen with real-time API results
14. `decd38d` feat: journey state provider for origin/destination planning
15. `0ae9c3b` feats: home screen with origin/destination inputs
16. `fd8f333` feat: recent search state with deduplication
17. `6cddbeb` feat: location permission request screen with fallback
18. `fc7a967` docs: update API contract with places endpoints
19. `26b0720` test: places controller unit tests
20. `929124d` feat: saved place state provider with add/remove/update
21. `8a1cf23` chore: refine gitignore with generated files

## 4. Flutter Changes
- **`apps/mobile/lib/features/location/domain/models.dart`**: Location, Place, JourneyLocation, SearchResult, Coordinate — typed domain models replacing scattered primitives.
- **`apps/mobile/lib/core/api/api_client.dart` / `api_providers.dart`**: Extended Dio client with typed place search and reverse geocoding.
- **`apps/mobile/lib/features/location/data/geocoding_repository.dart`**: Normalizes provider responses (OpenStreetMap Nominatim) into typed Place objects.
- **`apps/mobile/lib/features/location/state/place_search_notifier.dart`**: Riverpod state with 350ms debounce for search input.
- **`apps/mobile/lib/features/location/state/location_notifier.dart`**: Permission-aware location service covering unknown/requesting/granted/denied/permanently-denied/unavailable states.
- **`apps/mobile/lib/features/location/state/journey_notifier.dart`**: Origin/destination planning state with swap/reset capabilities.
- **`apps/mobile/lib/features/location/state/recent_search_notifier.dart`**: Local history with deduplication.
- **`apps/mobile/lib/features/saved/saved_place_notifier.dart`**: Saved place state for home/work/campus integration.
- **`apps/mobile/lib/features/location/ui/search_screen.dart`**: Search UI with loading/empty/error states.
- **`apps/mobile/lib/features/location/ui/permission_screen.dart`**: Permission UX with manual fallback.
- **`apps/mobile/lib/features/home/ui/home_screen.dart`**: Home screen integrating location input and journey state.
- **`apps/mobile/lib/shared/widgets/location_input.dart`**: Reusable location input widget with GPS button.

## 5. Backend Changes
- **`apps/backend/src/modules/places/geocoding.port.ts`**: Abstract GeocodingService interface for provider-agnostic geocoding.
- **`apps/backend/src/modules/places/nominatim-geocoding.service.ts`**: OpenStreetMap Nominatim implementation respecting rate limits and User-Agent policy.
- **`apps/backend/src/modules/places/places.controller.ts`**: Endpoints for `/places/search` and `/places/reverse`.
- **`apps/backend/src/modules/places/places.module.ts`**: NestJS feature module wiring.
- **`apps/backend/src/modules/places/places.controller.spec.ts`**: Unit tests for controller validation and result mapping.

## 6. Database Changes
- No new migrations required in Phase 2 — SavedPlace and SavedJourney models from Phase 1 remain ready for integration.
- API contract updated to reflect `/places/search` and `/places/reverse`.

## 7. Map Provider Decision
- **Selected**: `flutter_map` with OpenStreetMap tiles.
- **Rationale**: No API keys needed for development; sufficient for MVP map picker and camera control; abstraction layer preserves migration path to Google Maps or Mapbox.
- **Documented in**: `docs/MAP_PROVIDER.md`

## 8. Geocoding Provider Decision
- **Selected**: OpenStreetMap Nominatim via backend proxy.
- **Rationale**: No API key required; good Indonesia coverage; Nominatim Usage Policy compliance (User-Agent + rate limiting).
- **Documented in**: `docs/LOCATION_PRIVACY.md`

## 9. Location Permission Behavior
- States handled: requesting, granted, denied, permanently denied, unavailable.
- Denied/permanent denial surfaces user-facing guidance with manual fallback.
- Location only requested when user triggers origin/destination selection.

## 10. Search Behavior
- 350ms debounce prevents excessive network requests.
- Input states: idle → typing → loading → results → empty → error.
- Results normalized into typed Place objects with source attribution.

## 11. Caching Strategy
- Recent searches cached in-memory with Riverpod (deduplication + max 10).
- No persistent caching of live coordinates without user consent.
- Provider responses normalized before storage.

## 12. Security / Privacy Changes
- No API keys committed to source.
- Location coordinates not logged in production builds.
- User-Agent header set for Nominatim compliance.

## 13. Tests
- **Backend**: `places.controller.spec.ts` validates input validation, result mapping, and error handling.
- **Flutter**: Sanity test from Phase 1 carried forward; widget tests to be extended in Phase 3.

## 14. CI Status
- GitHub Actions workflow inherited from Phase 1 remains healthy:
  - `backend-test`: npm install → prisma generate → jest test.
  - `flutter-test`: flutter pub get → flutter test.
- **Note**: Add `flutter_map` + `geolocator` packages to pubspec.yaml in Phase 2 finalization.

## 15. Runtime Verification
- Environment has Dart 3.7.2 and Node.js 22.23.2.
- No iOS/Android emulator or simulator available in this environment — physical-device verification deferred.
- Backend API server and PostgreSQL confirmed running on localhost:5432.

## 16. Known Limitations
- `flutter_map` tile rendering not yet wired on device — requires `flutter pub get` and a simulator for runtime validation.
- Geolocator plugin not yet installed in `pubspec.yaml`.
- Reverse geocoding backend proxy is live but unauthenticated — suitable only for development.
- No backend persistence of search history — mobile-only in-memory retention.

## 17. Phase 3 Readiness
- Location and search foundation fully typed and decoupled.
- Journey state ready to accept route planning results.
- Transit domain models in Prisma unchanged — ready for GTFS ingestion pipeline.
- Home screen CTA (`Cari Rute`) currently disabled when incomplete — placeholder for Phase 3 routing integration.
