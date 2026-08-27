# Phase 15 Baseline Audit

**Date:** 2026-08-27  
**Baseline SHA:** f130b28839b2d2450aaaa0d108858b81a814d9e4

## Git State

```
Branch: main
Remote tracking: 0 ahead, 0 behind origin/main
Working tree: clean except .agents/, .claude/, skills-lock.json (tooling artifacts)
```

## Database State

All transit data tables empty:

| Table | Count |
|-------|-------|
| dataSource | 0 |
| datasetVersion | 0 |
| agency | 0 |
| route | 0 |
| station | 0 |
| stop | 0 |
| trip | 0 |
| stopTime | 0 |
| serviceCalendar | 0 |
| transfer | 0 |

## Actual Coverage

- **TransJakarta:** 0 routes, 0 trips, 0 stops
- **KAI Commuter:** 0 routes, 0 trips, 0 stations
- **MRT/LRT/Airport Rail:** no data
- **All operators:** 0% coverage

## Current Architecture

### Ingestion Pipeline

Located: `apps/backend/src/modules/transit/ingestion/`

- **GtfsIngestionPipeline** (`gtfs.ingestion.ts`)
  - Accepts local GTFS directory
  - Parses CSV files
  - Validates records
  - Normalizes to DB schema
  - Registers with DatasetRegistry
  - Supports dry-run mode
  - Tracks rejection counts (orphans, invalid coords, duplicate IDs, invalid times)

- **DatasetRegistry** (`dataset.registry.ts`)
  - Registers data sources
  - Creates dataset versions with provenance (checksum, retrievedAt, validatedAt)
  - Tracks record counts
  - Implements safe activation (deactivates old before activating new)
  - Maintains validation result status

- **GtfsValidator** (`validators/gtfs.validator.ts`)
  - Validates coordinates within Jabodetabek bounds: lat [-7.5, -5.5], lon [106.0, 107.8]
  - Validates GTFS times (supports >24:00:00)
  - Validates agency, route, stop, trip, stop_time, calendar, transfer
  - Collects errors vs warnings

- **CsvParser** (`parsers/csv.parser.ts`)
  - Parses CSV from file or string
  - Handles CRLF/LF
  - Returns typed records

- **Normalizers** (`normalizers/gtfs.normalizer.ts`)
  - IdHasher: deterministic hashing (source-entity-id pattern)
  - Normalize each entity type to database schema
  - Preserve GTFS time semantics (>24:00:00)

- **TransitGraph** (`graph/transit.graph.ts`)
  - GraphNode (stop/station with coords)
  - GraphEdge (ride/transfer/walk)
  - TransitGraphEdge (ride edges with arrival/departure times)
  - fromStopTimes() converts GTFS stop_times to ride edges
  - fromTransfers() converts GTFS transfers to transfer edges

### Data Model (Prisma)

Schema: `apps/backend/prisma/schema.prisma`

- **DataSource:** id, name, url, license, sourceType, sourceStatus, timestamps
- **DatasetVersion:** sourceId, version, isActive, checksum, record counts, validation result, status
- **Agency:** id, name, shortName, authority, website
- **Route:** id, agencyId, shortName, longName, routeType, serviceType, color
- **Stop:** id, agencyId, name, lat, lon, stationId (nullable)
- **Station:** id, name, lat, lon, operator
- **Trip:** id, routeId, serviceId, directionId, headsign
- **StopTime:** (tripId, stopSequence) composite key, arrivalTime, departureTime, stopId
- **ServiceCalendar:** serviceId, mon-sun booleans, startDate, endDate
- **Transfer:** id, fromStopId, toStopId, transferType, minTransferTime

### CLI Tools

- **ingest.ts:** `--source --version --fetch-dir --url --license --dry-run`
- **list-datasets.ts:** lists all dataset versions with activation status

### Testing

- `test/ingestion.spec.ts` (168 lines)
  - Mocks Prisma
  - Tests valid GTFS ingestion with fixtures
  - Tests dry-run mode
  - Tests optional files (transfers.txt missing)
  - Tests orphan detection
  - Tests CsvParser, GtfsValidator, normalizeStopTime
  - Uses fixtures: `test/fixtures/transjakarta/`, `transjakarta_no_transfers/`, `bad_orphan/`

- `test/dataset.registry.spec.ts` (203 lines)
  - Tests DatasetRegistry lifecycle
  - Tests provenance metadata
  - Tests activation/deactivation
  - Tests record count updates

### Fixtures

Located: `test/fixtures/transjakarta/`

Sample GTFS feed (REFERENCE DATA, NOT REAL):

- 2 routes (TJ-1, TJ-3)
- 4 stops (Monumen Nasional, Masjid Agung, Bundaran HI, Blok M)
- 3 trips
- 11 stop_times
- 1 service (DAILY)
- 2 transfers

All coordinates within Jabodetabek bounds. Valid GTFS structure.

## Current Source Inventory

**Configured but not fetched:**

From fixture README: `https://gtfs.transjakarta.co.id/files/file_gtfs.zip` referenced but not verified/accessible.

**No other sources** are currently integrated or configured.

## Data Gaps

- No live/official GTFS from TransJakarta
- No live/official GTFS from KAI Commuter
- No live/official GTFS from MRT Jakarta
- No live/official GTFS from LRT Jakarta
- No live/official GTFS from LRT Jabodebek
- No live/official GTFS from JakLingko/Mikrotrans
- No live/official GTFS from airport rail
- No routing engine can function without data
- Ingestion architecture exists but no real source is connected

## Routing Engine

Located: `apps/backend/src/modules/routing/`

- **RoutingEngine** (568 lines) implements multimodal routing
- Requires active dataset with populated stops, trips, stop_times, routes, service calendars
- **Currently returns 0 journeys** (no data in database)
- Can plan direct and transfer journeys
- Scores by fastest/fewest transfers/least walking/simplest
- Uses haversine distance for walk times
- Validates service calendar for date/day-of-week

## Phase 14 Claim vs Reality

Phase 14 reportedly created:

- 35 commits ✓
- 170 backend tests ✓
- 126 Flutter tests (not audited)
- DatasetRegistry ✓
- GTFS validation ✓
- Safe activation ✓
- Graph validation (exists but untested with real data)

But **actual database coverage = 0%**.

Conclusion: Architecture is sound, fixtures work, but no real operational data source has been integrated or tested.

## Next Steps (Phase 15)

1. Research and verify official/public transit data sources
2. Classify each source (verified/usable, restricted, unavailable, etc.)
3. Implement source adapters
4. Ingest at least one verified source
5. Validate dataset lifecycle
6. Test routing with real data
7. Ensure >=20 meaningful commits
8. Push to origin/main
