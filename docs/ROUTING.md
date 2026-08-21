# Routing — TRANSUM-IN

## Phase 3 Status: Graph Foundation

Phase 3 delivers graph-ready data structures, NOT final route optimization.

## Graph Model

The transit graph is built from canonical entities:

```
Walking (first-mile)
  → TransitStop (boarding)
  → TransitTrip (board)
  → StopTime sequence (ride)
  → TransitStop (alight)
  → Transfer (walk to next stop/station)
  → Walk → TransitStop (boarding next route)
  ...
  → Walking (last-mile)
```

### Graph Nodes

- `TransitStop` — boarding/alighting point
- `TransitStation` — station complex (aggregates stops)

### Graph Edges

- **Boarding**: implicit time cost (waiting for trip)
- **Ride**: `StopTime` sequence provides arrival/departure times
- **Transfer**: `Transfer` table provides minimum transfer time
- **Walking**: straight-line distance (labelled) until pedestrian engine available

### Trip & Schedule Semantics

- Each `Trip` has a `ServiceCalendar` defining days of operation
- `StopTime` sequence per trip is strictly ordered
- GTFS times preserved as strings (may exceed 24:00:00 for post-midnight trips)
- `direction_id` distinguishes inbound/outbound

### Transfers

- Explicit transfers sourced from GTFS `transfers.txt`
- Transfer types: 0=recommended, 1=timed, 2=feet, 3=no_info_available
- `min_transfer_time` preserved where available
- **No fabricated transfers** — missing data = explicitly unknown

## Phase 4 Readiness

Phase 4 will implement:
- Direct journey routing (single-trip)
- Multimodal journey routing (walk + transit + transfer)
- Journey ranking by duration, transfers, walking distance
- Route alternatives
- Route response contract
- Flutter route-options UI

## Deferred (Future Phases)

- Real-time vehicle tracking
- Live arrival predictions
- Full turn-by-turn navigation
- All Jabodetabek operators
- Payment integration
