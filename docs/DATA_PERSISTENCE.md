# TRANSUM-IN Data Persistence Architecture

## Persistence Layers

### 1. PostgreSQL (via Prisma ORM)
**Purpose:** Primary user-owned persistent data, server-side source of truth.

| Table | Owner | Purpose |
|---|---|---|
| `users` | System | Account identity |
| `auth_identities` | System | OAuth/email identity links |
| `saved_places` | User | Bookmarked locations |
| `saved_journeys` | User | Saved route requests for replan |
| `journey_history` | User | Recent route searches |
| `data_sources` | System | GTFS feed metadata |
| `dataset_versions` | System | Transit dataset versions |
| `agencies` | System | Transit agencies (TransJakarta, KRL, etc) |
| `routes` | System | Transit routes |
| `stations` | System | BRT stations / transfer points |
| `stops` | System | Individual stops |
| `trips` | System | GTFS trip records |
| `stop_times` | System | Schedule stop times |
| `service_calendars` | System | Calendar / day-of-week service |
| `transfers` | System | Transfer rules between stops |

**Ownership enforcement:** All user-owned tables have `user_id` FK with `onDelete: Cascade`.
Controllers resolve `userId` from authenticated JWT identity, never trusting client-provided values.

### 2. flutter_secure_storage
**Purpose:** Authentication credentials only.

| Key | Value |
|---|---|
| `auth_token` | JWT access token |
| `user_id` | Authenticated user ID |
| `user_email` | Authenticated user email |

**Why secure storage:** Tokens must not be in shared preferences; secure storage uses platform keystores (Keychain on iOS, EncryptedSharedPreferences on Android, etc).

### 3. SharedPreferences
**Purpose:** Lightweight local UI preferences and last-known local cache.

Currently used for:
- History persistence cache (LocalHistoryPersistence layer)

### 4. In-memory Riverpod state
**Purpose:** Runtime state only. Not persisted.

- Routing alternatives
- Auth state (mirrored from secure storage)
- Saved resources providers (hydrated from API)
- Network status

## Ownership Map

| Data | Owner | Syncs From |
|---|---|---|
| JWT token | Secure storage | Login API response |
| User profile | Riverpod + secure storage | AuthProvider |
| Saved places | PostgreSQL | SavedPlacesRepository |
| Saved journeys | PostgreSQL | SavedJourneysRepository |
| Journey history | PostgreSQL (server) + SharedPreferences (local cache) | HistoryRepository |
| Routing results | Riverpod only | Routing API |
| Recent local searches | SharedPreferences | HistoryPersistence |

## Failure Recovery

- **Auth token lost:** User must log in again. App state clears via `AuthProvider.logout()`.
- **API unreachable:** App shows cached data + offline indicator; routing fails gracefully.
- **Database unavailable:** User-owned operations fail with clear error; local SharedPreferences cache continues to work for offline history.
