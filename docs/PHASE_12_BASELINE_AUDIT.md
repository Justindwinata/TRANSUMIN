# Phase 12 Baseline Audit

## Actual Repository State
- HEAD: `556dd1c748f74b3d9c6e7a43d36726e40703deb8`
- origin/main: `556dd1c748f74b3d9c6e7a43d36726e40703deb8` (in sync)
- Working tree: clean
- Discrepancy vs Phase 11 report: none — Phase 11 baseline matches actual HEAD

## Audit by Workstream

### Workstream A — History Synchronization
| Claim | Reality |
|---|---|
| History API exists | `HistoryController` + `HistoryService` implemented with `POST/GET/DELETE` |
| Prisma `JourneyHistory` model exists | `apps/backend/prisma/schema.prisma` line 187 |
| Mobile `JourneyHistoryNotifier` exists | Yes |
| `saveHistoryToBackend` is real | **STUB**: empty body after `userId != null` check in `auth_provider.dart:79-80` |
| Account isolation enforced | Local cache keyed by userId; backend API user-scoped via JWT |
| `HistoryService` ownership check on get/remove | Yes (`userId !== userId` 403) |
| `HistoryService.create` enforces 50-entry cap | Yes (deletes oldest beyond 50) |
| Dedupe rule aligned (originName + destName) | Backend: **NOT enforced** (creates duplicate rows). Mobile: enforced via `addEntry` filter |
| Bulk sync endpoint exists | No. Mobile sends full list each call but backend has no `POST /history/sync` |
| List endpoint returns full fields including createdAt | Yes |

### Workstream B — Offline Action Queue
| Claim | Reality |
|---|---|
| Offline fallback for service alerts | Yes (fixtures on error) |
| Offline history queue | **MISSING**: writes happen directly via stub `saveHistoryToBackend` |
| Offline action persistence | **MISSING**: no `OfflineAction` model, no queue provider |
| Idempotency story for non-idempotent ops | **MISSING** |
| Connectivity restoration handler | `NetworkMonitor` exists but no consumer wires a queue drain to it |

### Workstream C — Notifications
| Claim | Reality |
|---|---|
| Notification center persists to SharedPreferences | Yes |
| Notifications generated from backend events | **NO**: `NotificationRepository.add()` exists but nothing in app calls it for real events |
| Backend `Notification` model | **MISSING**: no Prisma model, no controller |
| Read/unread state | Yes |
| Account isolation | Shared key `notifications` (single key, not per-user) — **GAP** |
| Backend-driven events | **MISSING** |

### Workstream D — Service Alerts
| Claim | Reality |
|---|---|
| Backend `GET /service-alerts` | Yes |
| Mobile repo with offline fallback | Yes |
| Provenance tracking | **PARTIAL**: `isDevelopmentData` flag on alert |
| Filtering by operator/route/stop/severity/status on backend | **PARTIAL**: DTO exposes fields; service does not filter — returns all active |
| Data source metadata (live vs dev vs fixture) | **MISSING**: `source` field absent |
| Backend test | One controller test exists |
| Mobile repo test | **MISSING** |
| Mobile UI test | **MISSING** |
| Journey-detail relevance matching | Yes — filters by `affectedRouteShortName` |

### Workstream E — Lifecycle / Account Switching
| Claim | Reality |
|---|---|
| Auth `initialize()` restores session from secure storage | Yes |
| 401 → logout hookup | Yes (`AuthInterceptor.onUnauthorized`) |
| `logout()` clears secure storage | Yes |
| History cache cleared on logout | Yes (listener in `journeyHistoryProvider`) |
| Notifications cleared on logout | **MISSING**: notifications key is global, not per-user |
| Preference reset on logout | **MISSING**: preferences persist for next user |
| Queued actions isolated on logout | **N/A**: no queue exists |
| Saved places cleared on logout | **MISSING**: saved places repo uses auth token from auth state; query is uncached client-side |
| Lifecycle integration tests | Partial (`auth_lifecycle_test.dart`) |

### Workstream F — Runtime Verification
- Phase 11 reported macOS + Web verified
- No Android/iOS hardware available
- No automated browser automation in Phase 11

### Workstream G — Tests
- Flutter: 113 passed (baseline)
- Backend: 111 passed (baseline)
- Coverage gaps: no service alert mobile tests, no notification tests, no offline queue tests, no history sync integration test

### Workstream H — Documentation
- Phase 11 produced workstream docs
- Phase 12 workstreams require new docs

## Phase 12 Implementation Priorities
1. Real `HistoryApi` client + replace stub in `AuthNotifier.saveHistoryToBackend`
2. `OfflineQueue` with persisted `OfflineAction`, account-scoped, drain on connectivity
3. Backend `Notification` model + `GET /notifications` + `POST /notifications/:id/read`
4. Mobile: account-scoped notifications key, event hook from history sync failures / service alerts
5. Service alert provenance + filter tests
6. Logout cleanup hook for notifications, preferences, queue
7. New tests for each subsystem
8. Docs

## Phase 12 Constraints
- No fake "production" service alert data — keep fixtures labeled
- Use deterministic idempotency for queue (idempotency key per action)
- Account isolation is non-negotiable
