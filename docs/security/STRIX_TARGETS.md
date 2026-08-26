# TRANSUM-IN Security Targets & Scope

**Authorized for Testing:** TRANSUM-IN project only
**Environment:** Local/Staging (NOT Production)
**Date:** 2026-08-26

## Target Definitions

### Target 1: Backend Repository (White-Box)

**Type:** Local source code
**Path:** `/Users/justindwinata/Documents/TRANSUMIN/apps/backend`
**Scope:** Full NestJS backend, authentication, API layer
**Authorization:** Owned by project
**Excluded:** node_modules, build artifacts

**Security Focus:**
- Authentication (JWT, password hashing)
- Authorization (ownership checks, role-based access)
- API endpoints (IDOR, broken access control)
- Saved places/journeys (cross-user access)
- History (data isolation)
- Notifications (information disclosure)
- Rate limiting
- Input validation
- SQL injection (Prisma query patterns)
- SSRF (external data sources)

### Target 2: Mobile App (White-Box)

**Type:** Local Flutter source code
**Path:** `/Users/justindwinata/Documents/TRANSUMIN/apps/mobile`
**Scope:** Full Flutter app, API integration, storage
**Authorization:** Owned by project
**Excluded:** .dart_tool, build artifacts

**Security Focus:**
- Secure storage (flutter_secure_storage usage)
- Token storage (hardcoded paths, cache)
- API client (Dio configuration, certificate pinning)
- Local data (SharedPreferences security)
- Logging (sensitive data exposure)
- Deep links (URL scheme handling)
- Intent handling
- Debug/release build differences

### Target 3: Backend API (Black-Box)

**Type:** Live running API
**URL:** `http://localhost:3000` (development)
**Environment:** Local test instance
**Authorization:** Owned by project
**Test Credentials:** Deterministic test accounts (TBD)

**Security Focus:**
- Endpoint discovery and testing
- Authentication bypass attempts
- Authorization enforcement (IDOR)
- Rate limiting behavior
- Error messages (information disclosure)
- CORS configuration
- Header validation
- Response validation

### Target 4: OpenAPI Specification (if available)

**Type:** API contract
**Format:** OpenAPI 3.0 / Swagger
**Authorization:** Auto-generated from NestJS
**Scope:** Declared endpoints, parameters, auth requirements

**Security Focus:**
- Endpoint coverage verification
- Parameter validation requirements
- Authentication declarations
- Undocumented endpoints

## Critical Security Areas

### 1. Authentication & Authorization

**Current Implementation:**
- JWT tokens with configurable expiry
- Password hashing with bcryptjs
- JwtAuthGuard on protected routes
- Ownership checks in services (SavedPlacesService pattern)

**Security Concerns Identified:**
- JWT_SECRET fallback to hardcoded "dev-secret-change-me" in JwtAuthGuard
- Password hashing only in auth service (verify all users use this)
- Token refresh mechanism (verify presence/security)
- Session/logout handling (verify tokens are invalidated)

### 2. Data Isolation (Critical)

**User-Scoped Resources:**
- SavedPlace — verified ownership check in update/delete
- SavedJourney — TBD
- JourneyHistory — TBD
- Notifications — TBD
- UserPreferences — TBD

**Risk:** Cross-user data access (IDOR) via:
- Direct ID substitution (`GET /saved-places/user-id`)
- Predictable ID patterns (UUIDs mitigate, verify)
- Missing ownership filters in list operations
- Cascade delete vulnerabilities

### 3. API Input Validation

**Current:** class-validator + ValidationPipe with whitelist
**Risk:** Bypass via:
- Type coercion attacks
- Array/nested object manipulation
- Null/undefined handling
- Boundary conditions

### 4. External Data Integration

**GTFS Data Sources:**
- URL validation (SSRF risk)
- File size limits (DoS risk)
- Checksum verification
- Cache poisoning

### 5. Mobile API Integration

**Dio Client Security:**
- Certificate pinning (verify configured)
- Base URL hardcoding (development vs staging vs production)
- Request signing (if applicable)
- Token refresh mechanism

### 6. Sensitive Data Exposure

**Areas to Check:**
- Error messages (stack traces, internal paths)
- Logs (token logging, PII logging)
- Timestamps (information leakage)
- HTTP headers (server identification, X-Powered-By)
- Response timing (oracle attacks)

## Scan Budgets

| Scan Type | Budget | Duration | Purpose |
|-----------|--------|----------|---------|
| Quick (PR) | $10 | 5-10 min | Diff-scoped, fast feedback |
| Standard | $20 | 20-30 min | Full coverage, most findings |
| Deep | $50 | 1-2 hours | Comprehensive, business logic |

## Test Credentials (Isolated)

Create deterministic test accounts in safe environment:

| User | Email | Role | Purpose |
|------|-------|------|---------|
| SecurityAdmin | security-admin@example.test | Admin | Cross-account testing |
| SecurityUser1 | security-user@example.test | User | IDOR baseline |
| SecurityUser2 | security-user2@example.test | User | IDOR cross-test |
| SecurityGuest | security-guest@example.test | Guest | Unauthenticated baseline |

## Scanning Rules of Engagement

1. **Authorized Only:** Scan only owned targets and explicitly registered test instances
2. **No Production:** Never target production databases or live user infrastructure
3. **Isolated Environment:** Use separate PostgreSQL for security testing
4. **Test Data Only:** Use synthetic data, never real PII
5. **Cleanup:** Remove test artifacts after testing
6. **Documentation:** Log all scan runs with scope and findings
7. **Escalation:** Critical findings reviewed before remediation

## Excluded Assets

- Production infrastructure (no auth)
- Third-party services (no authorization)
- External APIs (not owned)
- User production accounts (PII)
- Real transit data (if from external sources)

---

**Scope Approved For:** White-box (code) + Black-box (local API) + OpenAPI (spec)
**NOT Approved For:** Production infrastructure, third-party services
**Next Step:** Prepare test environment and verify target accessibility
