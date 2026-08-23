# TRANSUM-IN Authentication & Authorization

## Lifecycle

### 1. Registration / Login
1. User submits credentials to backend `POST /auth/register` or `POST /auth/login`.
2. Backend returns JWT access token + user metadata.
3. `AuthNotifier.login(userId, email, accessToken)` persists credentials to `flutter_secure_storage` and updates Riverpod state.

### 2. App Restart
1. `TransumInApp.initState()` post-frame callback calls `AuthNotifier.initialize()`.
2. `initialize()` reads token/userId/email from secure storage.
3. If all three are present, state transitions to `isAuthenticated = true`.
4. App navigates to HomeScreen.

### 3. Token Expiry / 401 Response
1. Any Dio request that returns HTTP 401 is intercepted by `AuthInterceptor.onError`.
2. `onUnauthorized` callback fires, calling `AuthNotifier.logout()`.
3. Secure storage is cleared (`clearAll()`).
4. Auth state resets to `isAuthenticated = false`.
5. Riverpod provider rebuilds the app to show login.

### 4. Logout
1. User taps logout from SettingsScreen.
2. `AuthNotifier.logout()` clears all secure storage entries.
3. Auth state resets to default.
4. User is returned to login screen.

## Security Properties

- **No tokens in SharedPreferences.** All credentials live in `flutter_secure_storage` (platform keystore).
- **JWT never logged.** `LogInterceptor` is configured with `requestHeader: false` and `responseHeader: false`.
- **No client-side identity trust.** All backend endpoints derive `userId` from JWT subject, never from request body.
- **401 forced logout.** All auth errors clear credentials immediately.
- **Storage exception safe.** If secure storage read throws, app initializes to unauthenticated state without crash.

## Authorization on Backend

- Every authenticated endpoint is guarded by `@UseGuards(JwtAuthGuard)`.
- `@Request() req` provides `req.user.id` which is used as the `userId` filter.
- Owner-only resources (`saved_places`, `saved_journeys`, `journey_history`) throw `ForbiddenException` when a user accesses another user's record.
- Backend returns 401 for missing/invalid tokens and 403 for cross-user access.

## Riverpod Auth Provider

```dart
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(secureStorageProvider));
});
```

State shape: `{ isAuthenticated, userId, email, accessToken, isLoading }`.
