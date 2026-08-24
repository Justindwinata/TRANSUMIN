# History Sync

## Overview
Hybrid history architecture: backend PostgreSQL is primary source of truth; local SharedPreferences cache provides offline responsiveness and immediate UI updates.

## Data Flow

### Create Journey History
1. User searches route → `HomeScreen._searchRoute()` creates `JourneyHistoryEntry`
2. `JourneyHistoryNotifier.addEntry()` updates local state immediately
3. Local persistence saves to SharedPreferences under key `journey_history:{userId}`
4. `_syncBackend()` fires async to POST to backend (stubbed, ready for real endpoint)

### Load History
- App start: `JourneyHistoryNotifier.load()` reads from local cache
- `load()` then triggers `_syncWithBackend()` (currently no-op, placeholder for future pull)

### Account Isolation
- `HistoryPersistence` keyed by `userId`: `journey_history:{userId}` or `journey_history:anon`
- `historyPersistenceProvider` (FutureProvider) watches `authProvider.userId`
- On logout (`userId == null`): `JourneyHistoryNotifier.clear()` clears local cache
- On login: new user's FutureProvider resolves with their keyed persistence

### Limits & Deduplication
- Max 50 entries (`JourneyHistoryNotifier.maxEntries`)
- Duplicate origin+dest pairs replaced by newest

### Persistence Schema
```dart
JourneyHistoryEntry {
  id, originName, destName,
  originLat?, originLon?, destLat?, destLon?,
  summary?, searchedAt
}
```
JSON-serialized in SharedPreferences.

## Backend API (Planned)
- `POST /history` — Create entry (authenticated, user-scoped)
- `GET /history?limit=` — List user's history
- `DELETE /history/:id` — Remove one
- `DELETE /history` — Clear all

## Current Status
- Local cache: ✅ Implemented with account isolation
- Backend sync: 🔄 Stubbed in `AuthNotifier.saveHistoryToBackend()`
- Offline queue: ❌ Not implemented (entries created offline only exist locally until next sync)