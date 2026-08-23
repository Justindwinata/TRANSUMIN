# TRANSUM-IN Data Persistence Architecture

## Overview

This document describes the data persistence architecture for the TRANSUM-IN mobile application, including secure credential storage, local data persistence, and synchronization strategies.

## Secure Credential Storage

### Implementation
- **Library**: `flutter_secure_storage` v9.2.2
- **Storage Location**:
  - iOS: Keychain
  - Android: EncryptedSharedPreferences (AES-256)
- **Keys Stored**:
  - `auth_token`: JWT access token
  - `user_id`: User identifier
  - `user_email`: User email for display

### Security Properties
- Tokens never stored in SharedPreferences/plaintext
- Encrypted at rest using platform-native encryption
- Automatic cleanup on logout via `clearAll()`
- No sensitive data in logs or debug output

### Authentication Flow
1. App startup → `AuthNotifier.initialize()` called
2. Reads token/userId/email from secure storage
3. If all present → sets authenticated state
4. Login → stores token/userId/email to secure storage
5. Logout → clears all secure storage keys

### API Integration
- `AuthInterceptor` automatically attaches `Authorization: Bearer <token>` header
- Token retrieved from `AuthNotifier.state.accessToken`
- 401 responses trigger logout (handled by API layer)

## Local Data Persistence

### SharedPreferences
Used for non-sensitive, user-specific data that survives app restarts:

| Key | Content | TTL |
|-----|---------|-----|
| `journey_history` | List of `JourneyHistoryEntry` (max 50) | Indefinite |
| `app_preferences` | Theme, language, routing preferences | Indefinite |
| `recent_searches` | Recent place searches (via provider) | Indefinite |

### Journey History Structure
```json
{
  "id": "timestamp_ms",
  "originName": "String",
  "destName": "String",
  "originLat": "String",
  "originLon": "String",
  "destLat": "String",
  "destLon": "String",
  "summary": "String",
  "searchedAt": "ISO8601"
}
```

### Persistence Strategy
- **Local-first**: Immediate UI update, background sync
- **Max entries**: 50 per user (configurable)
- **Deduplication**: Same origin+dest = update timestamp
- **Clear all**: User-initiated only

## Saved Places

### Backend Storage
- PostgreSQL table `saved_places`
- Fields: `id`, `user_id`, `name`, `address`, `lat`, `lon`, `created_at`
- Cascade delete on user deletion
- Index on `user_id` for fast lookup

### Flutter State
- `SavedPlacesNotifier` with `SavedPlacesRepository`
- CRUD operations with optimistic UI updates
- Automatic reload on auth state change

### Data Model
```dart
class SavedPlace {
  final String id;
  final String userId;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final DateTime createdAt;
}
```

## Saved Journeys

### Backend Storage
- PostgreSQL table `saved_journeys`
- Fields: `id`, `user_id`, `origin_name`, `dest_name`, `payload_json`, `created_at`
- `payload_json` stores complete `JourneyRequest` for replan

### Replan Flow
1. User selects saved journey → `SavedJourneyReplanScreen`
2. Payload parsed → `JourneyRequest` reconstructed
3. RouteOptionsNotifier searches fresh routes
4. User sees fresh alternatives with current schedules

### Data Model
```dart
class SavedJourney {
  final String id;
  final String userId;
  final String originName;
  final String destName;
  final String payloadJson;  // JSON-serialized JourneyRequest
  final String? label;       // User-defined label
  final DateTime createdAt;
}
```

## Journey History

### Backend
- Table: `journey_history`
- Fields: `id`, `user_id`, `origin_name`, `dest_name`, `summary_json`, `created_at`
- Auto-cleanup: Max 50 entries per user (oldest deleted)

### Flutter
- `JourneyHistoryNotifier` with `JourneyHistoryState`
- Local-first with `HistoryPersistence` (SharedPreferences)
- Max 50 entries, deduplicated by origin+dest
- Auto-sync to backend when online

### Data Model
```dart
class JourneyHistoryEntry {
  final String id;
  final String originName;
  final String destName;
  final String? originLat;
  final String? originLon;
  final String? destLat;
  final String? destLon;
  final String? summary;
  final DateTime searchedAt;
}
```

## Synchronization Strategy

### Principles
- **Local-first**: UI never blocks on network
- **Eventual consistency**: Background sync within 30s
- **Conflict resolution**: Server wins for server-owned data; local wins for UI state
- **Offline queue**: Mutations queued, synced when online

### Sync Triggers
- App foreground (after 5min)
- Explicit user pull-to-refresh
- Network state change (offline → online)
- Periodic (every 15min when active)

### Conflict Resolution
| Data Type | Strategy |
|-----------|----------|
| Saved Places | Server wins (source of truth) |
| Saved Journeys | Server wins |
| History | Merge by ID, keep both if different |
| Preferences | Last write wins |

## Schema Versioning

### Prisma Migrations
- Versioned in `prisma/migrations/`
- Applied via `prisma migrate deploy`
- Backward compatible when possible

### Current Version
- Migration: `20260822173959_init_all_models`
- Includes: `JourneyHistory` table

## Security Considerations

### At Rest
- Credentials: Platform secure storage (Keychain/Keystore)
- Local data: SharedPreferences (not encrypted, non-sensitive)
- Database: PostgreSQL with TLS

### In Transit
- HTTPS enforced (production)
- JWT in Authorization header
- No credentials in URLs

### Access Control
- Row-level security via `user_id` foreign keys
- JWT validated on every request
- Ownership checked on all mutating operations

## Disaster Recovery

### Backup
- PostgreSQL: Daily automated backups
- Point-in-time recovery (PITR) enabled
- Retention: 30 days

### Recovery Procedures
1. Restore DB from latest backup
2. Run pending migrations
3. Verify schema consistency
4. Smoke test critical paths

## Data Retention

| Data Type | Retention | Deletion Trigger |
|-----------|-----------|------------------|
| Auth tokens | Session + 30 days | Logout / expiry |
| Saved places | Indefinite | User deletion |
| Saved journeys | Indefinite | User deletion |
| History | 50 entries max | Auto-cleanup |
| Preferences | Indefinite | User deletion |
| API logs | 30 days | Rotation |

## Migration Checklist

When adding new persisted data:
1. Add Prisma model + migration
2. Update backend service + controller
3. Add Flutter repository + provider
- Update API client if new endpoints
- Add widget tests
- Update documentation
- Add integration test scenario