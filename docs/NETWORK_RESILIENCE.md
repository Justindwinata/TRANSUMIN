# TRANSUM-IN Network Resilience

## Interceptors

### 1. AuthInterceptor
- Injects `Authorization: Bearer <token>` from `AuthProvider` state.
- Handles 401 → auto logout.
- Does NOT log headers.

### 2. RetryInterceptor
**Policy:**
- **Max retries:** 3
- **Base delay:** 1 second (exponential backoff: 1s, 2s, 4s)
- **Retryable status codes:** 408, 429, 500, 502, 503, 504
- **Retryable exception types:** ConnectionTimeout, ReceiveTimeout, SendTimeout, ConnectionError

**Safety:**
- Only retries **idempotent** requests: `GET`, `HEAD`, `OPTIONS`, or requests with header `X-Retry-Safe: true`.
- **POST** (e.g. `/routing/plan`, `/auth/login`, `/saved-places`) is **never** auto-retried.
- User must manually retry via "Coba Lagi" button on error screens.

### 3. Connectivity Monitor (`connectivity_plus`)
- Exposes `networkStatusProvider` with `isOnline` boolean.
- App shows bottom banner when offline.
- All API calls check online state via `NetworkStatus` before firing (in repositories).

## Request Behavior Matrix

| Operation | Method | Auto-retries | Offline behavior |
|---|---|---|---|
| Search routes | POST /routing/plan | ❌ | Error screen with retry button |
| Saved places list | GET /saved-places | ✅ (idempotent) | Cached offline mode |
| Saved journeys list | GET /saved-journeys | ✅ | Cached offline mode |
| Journey history list | GET /history | ✅ | Cached offline mode |
| Create saved place | POST /saved-places | ❌ | Error + retry button |
| Save journey | POST /saved-journeys | ❌ | Error + retry button |
| Login | POST /auth/login | ❌ | Error + retry button |

## Error UI

- **401 Unauthorized:** Force logout → login screen.
- **Network error (offline):** "Tidak Ada Koneksi" banner + retry button.
- **Server 5xx:** "Terjadi Masalah" with retry button.
- **Validation 400/422:** "Terjadi Masalah" with field errors.

## Testing

Unit tests cover:
- Retryable status codes identification.
- Exponential backoff calculation.
- Safe method gating.