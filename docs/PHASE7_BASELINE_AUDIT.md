# Phase 7 Baseline Audit

## Baseline Commit
`5bf65aa` (Phase 5) → `1f9e285` (Phase 6 final)

## Repository State at Phase 6 Completion

### Backend (NestJS)
- Auth module: `/auth/register`, `/auth/login` (JWT-based)
- Users module: User CRUD, password hashing (bcrypt)
- Transit module: GTFS ingestion, routes, stops, trips, calendars, transfers
- Routing module: POST `/routing/plan` (multimodal engine)
- Places module: geocoding endpoints
- Prisma schema: User, AuthIdentity, SavedPlace, SavedJourney models exist
- No auth guards implemented yet (guards folder empty)
- No SavedPlace/SavedJourney/TripHistory modules implemented
- Test suite: 52 tests passing (44 Phase routing + 8 contract)

### Mobile (Flutter)
- Auth provider: `authProvider` (in-memory only, no persistence)
- Routing: complete state machine + screens (Phase 6)
- No SavedPlaces provider connected to backend
- No SavedJourneys provider connected to backend
- RecentSearchNotifier exists but in-memory only
- No profile/settings/history screens
- Navigation: basic MaterialPageRoute navigation
- API: `ApiClient` without auth headers
- No environment-aware API configuration (hardcoded localhost:3000)
- No network timeout configuration
- No secure token storage

### Discrepancies from Phase 6 Report
1. Report said 20 commits; actual is 19 on local + remote in sync at `1f9e285`
2. Auth guards not implemented in backend
3. SavedPlaces/SavedJourneys models exist in Prisma but no API endpoints
4. Mobile auth provider has no persistence
5. No profile/settings UI implemented
6. No history persistence

## Phase 7 Baseline Commit: 1f9e285

## Key Decisions
- Backend: Implement auth guards using JWT strategy
- Backend: Create SavedPlaces, SavedJourneys, TripHistory modules
- Mobile: Integrate Riverpod with backend via authenticated API
- Mobile: Add local persistence for history (shared_preferences)
- Mobile: Add secure token storage for auth
- Mobile: Environment-aware API config

## Files to Create
- Backend: `modules/saved-places/`, `modules/saved-journeys/`, `modules/history/`
- Backend: `core/auth/` guards, strategies
- Mobile: Provider updates, repository additions
- Mobile: Profile, History, PlacePicker screens
- Mobile: Local storage helpers

## Files to Modify
- Backend: `app.module.ts` (add new modules)
- Backend: `prisma/schema.prisma` (add indexes if needed)
- Mobile: `api_providers.dart` (auth headers, timeout)
- Mobile: `home_screen.dart` (saved places, history)
- Mobile: `main.dart` (auth-aware startup)
