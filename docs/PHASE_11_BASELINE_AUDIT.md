# Phase 11 Baseline Audit

## Repository State
- Local HEAD: `9df4a313` ("fix(history): resolve analyzer errors and refactor history sync")
- `origin/main` identical to local HEAD.
- Working tree clean (no uncommitted changes).

## Phase 10 Claims vs Reality
| Claim | Found | Tested | Notes |
|---|---|---|---|
| ServiceAlert domain model | `apps/mobile/lib/domain/service_alert.dart` exists | ✅ | Model present, no provider/UI yet |
| NotificationItem model | `apps/mobile/lib/domain/notification_item.dart` exists | ✅ | Model present, no flow |
| RoutePreference persistence | `UserPreferencesRepository` uses SharedPreferences, `RoutePreferenceNotifier` loads on init | ✅ | Preference persisted, UI integration not verified |
| History hybrid sync | `journey_history_notifier.dart` modifies local cache and calls backend hook | ✅ | No integration tests, offline queue not implemented |
| Auth session init in `main.dart` | SharedPreferences initialized, providers overridden | ✅ | Token storage uses `flutter_secure_storage` elsewhere |
| Documentation Phase 10 | `docs/PHASE_10_FINAL_REPORT.md` present | ✅ | Report outdated, missing verification details |

## Unimplemented / Incomplete Areas
- ServiceAlert fetching from backend, UI display, and routing impact.
- Notification center UI, read/unread state, badge count.
- Route ranking logic does **not** consume `RoutePreference` yet.
- History sync lacks offline pending queue & duplicate handling.
- Saved journey re‑plan flow missing validation and UI.
- Account switching cleanup of local caches not verified.
- Automated tests for preferences, alerts, notifications, history sync absent.
- Runtime verification limited to macOS desktop (no Android/iOS).

## Limitations
- No live backend service alerts fixture.
- No device/emulator for Android/iOS; only macOS desktop available.
- DATABASE_URL not set in local env; Prisma migrations cannot run.
- Flutter test suite passes but lacks coverage for new flows.

## Next Steps
1. Add ServiceAlert repository, provider, UI.
2. Implement NotificationCenter screen and state.
3. Hook `RoutePreference` into routing ranking (backend stub).
4. Extend history sync with offline pending queue.
5. Add saved journey re‑plan UI and validation.
6. Write unit/widget tests for new features.
7. Update docs for each workstream.
8. Produce ≥20 meaningful commits and push.
