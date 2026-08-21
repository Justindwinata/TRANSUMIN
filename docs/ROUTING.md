# Routing Engine Specification

## Phase 1 Foundation
The routing engine is not fully implemented in Phase 1. However, the data structures and API contracts are established.

## Journey Model
```
Journey
  - id: UUID
  - origin: Coordinate
  - destination: Coordinate
  - departureTime: DateTime
  - arrivalTime: DateTime
  - duration: number (seconds)
  - walkingDistance: number (meters)
  - transferCount: number
  - fare: number or null
  - ranking: "FASTEST" | "LEAST_WALKING" | "LEAST_TRANSFERS" | "SIMPLEST" | "CHEAPEST"
  - segments: JourneySegment[]
```

## Segment Types
- WALK: Walking leg with distance and duration.
- TRANSIT: Transit leg with service, boarding stop, and alighting stop.
- TRANSFER: Transfer between stops with walk distance.
- WAIT: Waiting time at a stop.

## Algorithm Direction (Phase 3+)
- Time-dependent Dijkstra for initial MVP.
- RAPTOR or Connection Scan Algorithm for optimization.
- Transfer inference from proximity and schedule alignment.
