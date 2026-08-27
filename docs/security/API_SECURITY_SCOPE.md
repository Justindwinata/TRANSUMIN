# TRANSUM-IN API Security Scope — Phase 2

**Date:** 2026-08-27
**Phase:** Security Phase 2
**Purpose:** Define authorized API targets and security testing scope for Strix

## Authorized Targets

### Target 1: Local Development API

**URL:** `http://localhost:3000`
**Environment:** Local development (PostgreSQL local)
**Authorization:** Self-owned, unrestricted testing permitted
**Status:** Must be running during black-box scans

### Target 2: Source Repository

**Path:** `/Users/justindwinata/Documents/TRANSUMIN`
**Type:** Local Git repository (white-box)
**Authorization:** Self-owned
**Scope:** Backend (NestJS), Mobile (Flutter), shared infrastructure

### Target 3: GitHub Repository

**URL:** `https://github.com/Justindwinata/TRANSUMIN`
**Type:** Public repository (white-box via Strix GitHub integration)
**Authorization:** Self-owned
**Scope:** Full codebase analysis

## API Endpoints to Test

### Authentication Endpoints
- `POST /auth/register` — User registration
- `POST /auth/login` — User login
- `POST /auth/logout` — User logout
- `GET /auth/me` — Current user info

### User-Scoped Endpoints (Protected by JwtAuthGuard)
- `GET /saved-places` — List user's saved places
- `POST /saved-places` — Create saved place
- `PATCH /saved-places/:id` — Update saved place
- `DELETE /saved-places/:id` — Delete saved place
- `GET /saved-journeys` — List user's saved journeys
- `POST /saved-journeys` — Create saved journey
- `PATCH /saved-journeys/:id` — Update saved journey
- `DELETE /saved-journeys/:id` — Delete saved journey
- `GET /history` — List user's journey history
- `POST /history` — Add to history
- `DELETE /history/:id` — Delete history entry
- `GET /notifications` — List user's notifications
- `POST /notifications/mark-as-read` — Mark notification as read

### Public Endpoints
- `GET /health` — Health check
- `POST /routing/plan` — Route planning (unauthenticated)

## Security Test Priorities

### HIGH Priority (Authorization/IDOR)
1. **Cross-User Resource Access** — Can User A access User B's saved places, journeys, history?
2. **Ownership Verification** — Are ownership checks enforced on all user-scoped endpoints?
3. **BOLA/IDOR** — Direct object reference exploitation attempts
4. **Privilege Escalation** — Can normal user perform admin operations?

### HIGH Priority (Authentication)
1. **Missing Authentication** — Unauthenticated access to protected endpoints
2. **Invalid JWT** — Malformed, expired, or invalid tokens
3. **Token Forgery** — Signing with wrong key
4. **Session Fixation** — Session hijacking attempts

### MEDIUM Priority (Input Validation)
1. **SQL Injection** — Malicious query strings
2. **Parameter Tampering** — Invalid data types, boundary conditions
3. **SSRF** — Server-side request forgery via user input

### MEDIUM Priority (Rate Limiting)
1. **Brute Force** — Rapid login attempts
2. **DoS** — Resource exhaustion via repeated requests

### MEDIUM Priority (API Specification)
1. **Undocumented Endpoints** — Endpoints not in OpenAPI spec
2. **Specification Drift** — API behavior vs. documented contract

### LOW Priority (Information Disclosure)
1. **Error Messages** — Stack traces, internal paths
2. **Headers** — Server identification

## Test Data & Credentials

### Test Users (Non-Production)
```
User 1:
  Email: security-test-user-1@example.test
  Password: SecureTestPass123

User 2:
  Email: security-test-user-2@example.test
  Password: SecureTestPass456
```

### Test Locations
```
Origin: Bundaran HI (-6.2088, 106.8456)
Destination: Blok M (-6.2443, 106.7999)
```

## Strix Scan Configuration (Managed Cloud)

### White-Box Scan
- **Target:** Repository URL
- **Type:** Source code analysis
- **Focus:** Authentication, authorization, IDOR, injection, secrets
- **Budget:** $20 (standard scan)
- **Duration:** ~30 minutes

### Black-Box Scan
- **Target:** `http://localhost:3000`
- **Type:** API security testing
- **Focus:** Endpoint authorization, BOLA/IDOR, rate limiting, validation
- **Test Users:** 2 test accounts (User 1 & User 2)
- **Budget:** $25 (API-specific)
- **Duration:** ~45 minutes

### Combined Scan
- **Target 1:** Repository
- **Target 2:** Local API
- **Focus:** Correlation between code vulnerabilities and runtime exploitation
- **Budget:** $50 (combined)
- **Duration:** ~60 minutes

## Exclusions (NOT Authorized for Testing)

- ❌ Production infrastructure
- ❌ Real user data
- ❌ Third-party APIs (TransJakarta, MRT, KRL, etc.)
- ❌ External services
- ❌ Other organizations' infrastructure

## Rules of Engagement

1. **Local Environment Only** — Do not test against external/production
2. **Authenticated Attacks** — Use test accounts, not real credentials
3. **Non-Destructive** — Do not modify data beyond test scope
4. **No Data Exfiltration** — Do not extract user/transit data
5. **Cleanup** — Remove test artifacts after scanning
6. **Documentation** — Record all scan runs, findings, remediations
7. **Escalation** — Critical findings reviewed before remediation

## API Security Scope Map

```
Authentication Layer
├── Registration (email, password strength, validation)
├── Login (credential verification, JWT issuance)
├── Logout (token invalidation)
└── Session (expiry, refresh, revocation)

Authorization Layer
├── JWT verification (signature, expiry, claims)
├── User identity extraction (sub, email)
├── Resource ownership (user_id match)
└── Endpoint access control (@UseGuards)

Data Access Layer
├── SavedPlaces (list, create, read, update, delete)
├── SavedJourneys (list, create, read, update, delete)
├── History (list, create, read, delete)
├── Notifications (list, mark-as-read)
└── Service Alerts (list, acknowledge)

Input Validation Layer
├── Email format validation
├── Password strength (min 8, upper, lower, number)
├── Coordinate bounds (-90 to 90 lat, -180 to 180 lon)
├── String length limits
└── Type coercion attacks

Rate Limiting Layer
├── Global throttler (100 req/15min)
├── Per-endpoint overrides (if any)
└── Error response (429 Too Many Requests)

Response Security Layer
├── No stack traces (error filter)
├── No sensitive field exposure (password hash, etc.)
├── No server identification (X-Powered-By removed)
└── Security headers present (CSP, HSTS, X-Frame-Options)

Business Logic Layer
├── Routing algorithm correctness
├── Journey preference optimization
├── Transfer logic
└── Transit data accuracy
```

## Expected Phase 2 Outcomes

1. ✅ Strix white-box scan completed
2. ✅ Strix black-box API scan completed
3. ✅ Findings collected and triaged
4. ✅ Validated vulnerabilities identified
5. ✅ Proof-of-concept confirmations
6. ✅ Remediations applied where needed
7. ✅ Re-scans verify fixes
8. ✅ Security baseline updated
9. ✅ ≥30 meaningful Phase 2 commits
10. ✅ Final Phase 2 report with evidence

---

**Scope Authorized:** ✅ Local development environment only
**External Testing:** ❌ Not authorized
**Production Access:** ❌ Not authorized
**Real User Data:** ❌ Not authorized
