# Known Limitations After Phase 9

1. **Phase commit requirement not yet satisfied.** Baseline `2423f6f` currently has fewer than 20 new commits. This phase cannot be considered complete until at least 20 meaningful commits exist on top of baseline.
2. **Chrome runtime blocked by `dart:io Platform` usage.** `AppConfig.apiBaseUrl` imports `dart:io` and fails on web builds.
3. **macOS runtime blocked by local machine tooling.** Xcode and `xcodebuild` are missing; CocoaPods not installed.
4. **Android runtime not verified.** No Android emulator or device available.
5. **iOS runtime not verified.** No iOS simulator/device available.
6. **Settings screen contains placeholder actions.** Visible but intentionally non-functional items show "Fitur ini akan segera hadir".
7. **History backend sync on Flutter side remains local-cache centric.** `JourneyHistoryNotifier` persists to local storage and is ready for server sync, but full repository-backed remote synchronization is not yet wired end-to-end.
8. **Route options widget test removed.** Fragile widget test was removed; core routing state remains covered by notifier and contract tests.
