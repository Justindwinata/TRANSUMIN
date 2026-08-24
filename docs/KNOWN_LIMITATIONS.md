# Known Limitations After Phase 11

## Runtime Target Limitations (Phase 11 Verified on macOS Desktop / Flutter Web)
- [x] macOS desktop: App builds, initializes auth, routes, renders home, searches, shows history, notifications
- [x] Flutter Web (Chrome): Same flows verified via web build
- [ ] Android: No emulator/device available; untested
- [ ] iOS: No simulator/device available; untested

## Feature Completion Status

### ✅ IMPLEMENTED & TESTED
- **Service Alerts**: Backend API + Prisma model + mobile fetch + journey detail integration + dev fixtures
- **Notifications**: Local persisted (SharedPreferences), read/unread, mark all read, badge in shell, profile navigation
- **Route Preferences**: Persisted + Settings selector + passed to backend ranking + client fallback ranker
- **History Account Isolation**: Local cache keyed by userId, cleared on logout, no cross-user leak
- **Saved Journey Replan**: Payload validation, malformed handling, UI flow from saved list → replan → route options
- **Auth Account Switching**: Logout clears history/notifications/preferences; login isolates

### ⚠️ PARTIAL / STUBBED
- **History Backend Sync**: `AuthNotifier.saveHistoryToBackend()` is stub; local-only persistence
- **Offline Queue**: No request queuing; offline journeys stay local only
- **Push Notifications**: Not implemented; in-app center only
- **Live Service Alerts**: Dev fixtures only; no real transit feed ingestion

### 🔄 NOT VERIFIED (require device/emulator)
- GPS/Location permissions flow
- Deep link handling from notifications
- Background fetch / app lifecycle on mobile OS
- SecureStorage behavior on iOS keychain / Android Keystore

## Test Results
- Flutter: **113 tests passed** (flutter analyze: clean)
- Backend: **111 tests passed** (16 suites, jest)

## Build & Static Analysis
- `flutter analyze`: clean (only pre-existing deprecation warnings)
- `dart format --set-exit-if-changed .`: clean
- `npx tsc --noEmit` (backend): clean
- Backend build: `npm run build` succeeds

## Database
- Prisma schema valid
- `DATABASE_URL` not set locally; migrations not run in this env
- CI/CD must provide valid Postgres URL for migrations