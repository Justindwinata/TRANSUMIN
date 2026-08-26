# Phase 14 Baseline Audit

## Current State

**HEAD:** `25a0226224284d1d5510765696656d655458da70` (after Phase 13)
**Branch:** main, synchronized with origin/main

**Phase 13 Summary:**
- 24 meaningful commits
- Backend: 129 tests passing
- Flutter: 126 tests passing
- Flutter analyze: clean

**Known Limitations from Phase 13:**
1. Live transit feed not fully established
2. Service-alert live data not guaranteed
3. Official data coverage limited
4. Android/iOS runtime verification unavailable
5. Freshness relies on static dataset metadata
6. Not every Jabodetabek operator may be represented

## Phase 14 Baseline

### Database State

**Current Seed Data (from prisma/seed.ts):**
- Agencies:
  1. TransJakarta (transjakarta)
  2. KAI Commuter (kai-commuter)

- Stations:
  1. Stasiun Jakarta Kota (KAI)
  2. Stasiun Monumen Nasional (TransJakarta)

- Stops:
  1. Monumen Nasional (TransJakarta)
  2. Stasiun Jakarta Kota (KAI)

**Observation:** Seed data is minimal reference data only. No actual GTFS ingestion has been performed.

### GTFS Ingestion Architecture

**Current State:**
- `GtfsIngestionPipeline` exists in `src/modules/transit/ingestion/gtfs.ingestion.ts`
- Supports:
  - agency.txt, routes.txt, stops.txt
  - trips.txt, stop_times.txt
  - calendar.txt, transfers.txt
- Includes validation
- Includes normalizers
- Includes graph building

**Limitations:**
- No automatic fetch mechanism
- Requires manual file presence
- No staging/rollback for failed datasets
- No checksum validation
- No automatic dataset activation

### Dataset Provenance (from Phase 13)

**Added to Prisma:**
- DataSource: checksum, retrievedAt, validatedAt, effectiveFrom/To, sourceType, sourceStatus, licenseUrl
- DatasetVersion: retrievedAt, validatedAt

**Observation:** Schema enhanced but no actual data has been ingested with provenance.

### Data Freshness (from Phase 13)

**Flutter Model Added:**
- Freshness states: fresh/recent/stale/unknown/unavailable
- Thresholds: 24h, 7d, 30d
- Indonesian labels and messages
- `isFreshEnoughForRouting()` check

**Observation:** Model exists but not yet connected to backend data lifecycle.

### Service Alerts (from Phase 13)

**Provenance Added:**
- Source field: live/official/fixture/development
- UI displays source labels in Indonesian

**Observation:** UI enhanced but no actual live service alerts integration.

## Current Transit Coverage

### Verified Operators (from seed + tests):

**TransJakarta**
- Mode: Bus rapid transit
- Routes: 0 in database (seed has no routes)
- Stops: 1 (Monumen Nasional)
- Status: Seed reference only

**KAI Commuter (KRL)**
- Mode: Rail
- Routes: 0 in database (seed has no routes)
- Stops: 1 (Stasiun Jakarta Kota)
- Status: Seed reference only

**Mikrotrans / JakLingko**
- No data in database or seed

**MRT / LRT / Airport Rail**
- No data in database or seed

### Data Sources (from ingestion code):

**GTFS Ingestion Pipeline:**
- Reads: agency.txt, routes.txt, stops.txt, trips.txt, stop_times.txt, calendar.txt, transfers.txt
- Normalizes: agencies, routes, stops, trips, stopTimes, calendars, transfers
- Validates: coordinate validity, time format, duplicate IDs, orphan references
- Builds: TransitGraph

**Current Data:**
- No official source configured
- No automatic fetch mechanism
- Ingestion requires manual file delivery

## Critical Gaps Identified

### 1. No Actual Transit Data Ingested
**Issue:** Only seed reference data exists. No GTFS dataset has been ingested.

**Impact:** Routing engine has no real transit data to work with. All routes are currently based on minimal seed fixtures.

**Priority:** HIGH

### 2. No Automatic Fetch Mechanism
**Issue:** Ingestion requires manual file delivery.

**Impact:** Cannot maintain data freshness without manual intervention.

**Priority:** HIGH

### 3. No Safe Activation Logic
**Issue:** Failed datasets may replace active datasets.

**Impact:** Broken upstream data could break routing functionality.

**Priority:** HIGH

### 4. No Live Data Sources Configured
**Issue:** No official GTFS URLs configured for automatic fetching.

**Impact:** System is offline-capable but not live-capable.

**Priority:** MEDIUM

### 5. Freshness Not Connected to Backend
**Issue:** Freshness model exists in Flutter but not exposed by backend.

**Impact:** Mobile cannot make routing decisions based on data currency.

**Priority:** MEDIUM

### 6. Service Alerts Still Fixture-Based
**Issue:** No official service alert feed integration.

**Impact:** Users may not receive live disruption information.

**Priority:** MEDIUM

## Phase 14 Workstreams Priority

### Workstream A — Transit Coverage Audit
**Status:** Complete (this audit)
**Deliverable:** docs/PHASE_14_TRANSIT_COVERAGE.md
**Status:** ✓

### Workstream B — Official Source Discovery
**Priority:** HIGH
**Required:** Identify actual GTFS feeds for TransJakarta, KRL, etc.
**Risk:** Some operators may not have public GTFS feeds.

### Workstream C — Real Data Fetch Pipeline
**Priority:** HIGH
**Action:** Extend ingestion CLI with fetch capability
**Approach:** Add fetch stage before validation

### Workstream D — Dataset Versioning
**Priority:** HIGH
**Status:** Schema enhanced in Phase 13
**Next:** Implement version metadata persistence

### Workstream E — Safe Dataset Activation
**Priority:** HIGH
**Required:** Implement transactional activation
**Test:** Verify failed dataset cannot replace active dataset

### Workstream F — GTFS Validation
**Priority:** MEDIUM
**Status:** Basic validation exists
**Action:** Extend to cover all edge cases

### Workstream G — Data Quality Report
**Priority:** MEDIUM
**Action:** Extend ingestion report structure
**Deliverable:** docs/DATA_QUALITY.md

### Workstream H — Transit Graph Rebuild
**Priority:** MEDIUM
**Action:** Ensure graph builds from active dataset version
**Test:** Graph validation after activation

### Workstream I — Routing Regression
**Priority:** MEDIUM
**Action:** Create realistic journey scenarios
**Deliverable:** docs/ROUTING_REGRESSION_SCENARIOS.md

### Workstream J — Routing Invariants
**Priority:** MEDIUM
**Action:** Add temporal integrity checks

### Workstream K — Backend Freshness
**Priority:** MEDIUM
**Action:** Connect freshness to DatasetVersion

### Workstream L — Service Alert Sources
**Priority:** MEDIUM
**Action:** Audit for official feeds; document plan

### Workstream M — API Contracts
**Priority:** LOW
**Action:** Add metadata endpoints

### Workstream N — Mobile Trust UX
**Priority:** MEDIUM
**Action:** Connect Flutter to backend freshness

### Workstream O — Runtime Verification
**Priority:** LOW (no Android/iOS available)

### Workstream P — CI Validation
**Priority:** MEDIUM
**Action:** Add ingestion validation tests to CI

### Workstream Q — Testing
**Priority:** MEDIUM
**Action:** Add integration tests for full pipeline

## Estimated Commit Count

**Target:** 20+ commits

**Planned:**
1. audit: add Phase 14 baseline audit (this)
2. feat(data): add official source discovery
3. feat(fetch): add automatic GTFS fetch capability
4. feat(data): persist dataset provenance metadata
5. feat(version): strengthen dataset versioning
6. feat(activation): implement safe activation logic
7. feat(validation): add GTFS validation tests
8. feat(graph): verify graph rebuild lifecycle
9. feat(graph): add graph validation tests
10. test(routing): add routing regression scenarios
11. feat(routing): add routing invariants
12. feat(freshness): connect backend freshness
13. feat(alerts): add service alert source strategy
14. feat(api): add metadata endpoints
15. feat(ui): connect mobile trust UX
16. docs: add data sources documentation
17. docs: add coverage audit
18. docs: add data quality report
19. docs: add regression scenarios
20. docs: finalize Phase 14 report

## Immediate Next Steps

1. Identify actual GTFS feed URLs for TransJakarta and KRL
2. Implement fetch capability in ingestion pipeline
3. Implement safe dataset activation
4. Add integration tests for full pipeline

## Risk Assessment

**High Risk:**
- Operators may not provide public GTFS feeds (requires manual data collection)
- No official service alert feeds may be available

**Medium Risk:**
- Data validation complexity may introduce bugs
- Graph build complexity may break with edge cases

**Low Risk:**
- UI changes are isolated to trust indicators
- Backend changes follow existing patterns

## Recommendation

Proceed with Phase 14, prioritizing:
1. GTFS fetch capability
2. Safe activation logic
3. Actual data ingestion

Begin with official GTFS source discovery before implementing fetch.
