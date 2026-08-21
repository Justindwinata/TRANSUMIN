# Data Source Governance

## Principle

Official transit data is the product's factual foundation. UI mock data is not the source of truth. Production route/schedule/fare claims must be traceable to a data source.

## Source Registry

Each data source is registered in the `DataSource` canonical table.

### Level A — Official Operator

| Operator | Feed URL | License | GTFS |
|----------|----------|---------|------|
| TransJakarta | https://transjakarta.co.id/rute | CC BY 4.0 | https://gtfs.transjakarta.co.id/files/file_gtfs.zip |
| KAI Commuter | https://www.commuterline.id/ | Proprietary | Not available as GTFS |

### Level B — Aggregators

Used for discovery only, with provenance marked.

## Audit Fields

Every canonical transit record preserves:
- `sourceUrl` — original feed URL
- `source` — source name (e.g., `transjakarta`)
- `source_version` — dataset version
- `fetched_at` — when data was retrieved
- `validated_at` — when validation ran

## Validation Checklist

- Duplicate IDs (skip, increment counter)
- Missing required fields
- Coordinates within Jabodetabek bounds (`lat -7.5 to -5.5`, `lon 106.0 to 107.8`)
- Route references resolve to existing agencies
- Trips reference valid routes
- StopTimes reference valid stops and trips
- Stop sequence strictly increases per trip
- Schedule times are valid GTFS format (may exceed 24:00:00)
- Transfer references resolve to existing stops
- Agency attribution present

## Ingestion Policy

1. New dataset fetched → stored as inactive `DatasetVersion`
2. Validation + normalization runs in a transaction
3. If validation passes → old dataset deactivated, new dataset activated
4. If validation fails → new dataset stays inactive, old dataset remains active
