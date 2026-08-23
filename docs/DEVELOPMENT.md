# Development Notes

## Backend Verification Commands
```bash
cd apps/backend
npx prisma validate
npm run build
npm run test
```

Current verified result:
- Prisma schema valid
- Backend build passes
- Backend tests: 83/83 passing

## Mobile Verification Commands
```bash
cd apps/mobile
flutter analyze
flutter test
flutter devices
```

Current verified result:
- Flutter analyze: warnings only, no errors
- Flutter tests: all passing
- Devices: macOS, Chrome detected

## Runtime Verification Attempt
- `flutter run -d chrome` fails due to `dart:io Platform` usage in `AppConfig.apiBaseUrl`.
- `flutter build macos --debug` fails because local machine lacks full Xcode / `xcodebuild`.

## Suggested Next Steps
1. Replace `dart:io Platform` with `kIsWeb` + conditional imports for web-safe configuration.
2. Install Android SDK cmdline tools and accept licenses.
3. Install full Xcode + CocoaPods for macOS/iOS builds.
4. Reintroduce stable widget/integration tests for RouteOptionsScreen.
