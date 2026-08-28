# Phase 17 Baseline Audit

## Baseline
SHA: 08bb84c4d120702922c148cc70b0f80d967fd1a0

## Current Status (Verified)
- **TransJakarta**: Verified and Ingested (8,091 stops, 240 routes, 272 stations, 603 linked child stops)
- **Other Operators**: Source verified but no machine-readable GTFS available
- **Routing Engine**: Multimodal (walk + transit) with quality-gated transfers
- **Graph**: Active, built from real TransJakarta data
- **Realtime**: Architecture implemented, DisabledRealtimeProvider active

## Database State (Verified)
- agencies: 1
- routes: 240
- stops: 8,091
- stations: 272 (populated from GTFS location_type=1)
- trips: 700
- stop_times: 26,427
- service_calendars: 7
- transfers: 1,316 (quality-gated)
- shape_points: 242,485

## Transfer Quality (Verified)
- Maximum walking distance: 300m (0 violations)
- Minimum transfer time (proximity/shape): 300s (0 violations)
- Minimum transfer time (same-station): 180s (0 violations)

## Planned Actions
1. Station hierarchy from GTFS location_type=1 ✓
2. Transfer quality gates enforced ✓
3. Same-station transfers from station hierarchy ✓
3. Realtime architecture foundation ✓
4. Document results in final report ✓