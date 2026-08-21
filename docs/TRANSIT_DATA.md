# Transit Data Strategy

## Principles
- Official GTFS is the source of truth for TransJakarta/KRL.
- Data must include provenance (source, version, fetched_at).
- Do not fabricate transit network data.
- Use "unknown/unavailable" for missing data.

## GTFS Ingestion Pipeline

### Overview

```
1. Fetch    — download GTFS feed via CLI (`npm run transit:ingest`)
2. Parse    — CSV parser extracts typed GTFS records
3. Validate — GtfsValidator checks coordinates, times, ID references
4. Normalize— GtfsNormalizer maps GTFS fields to canonical entities
5. Upsert   — deterministic upsert within transaction
6. Version  — DatasetRegistry creates version, activates on success
```

### Ingestion CLI

```bash
npx ts-node-dev src/modules/transit/ingestion/cli/ingest.ts \
  --source transjakarta \
  --version v1.0.0 \
  --fetch-dir /path/to/extracted/gtfs \
  --url https://gtfs.transjakarta.co.id/files/file_gtfs.zip \
  --license "CC BY 4.0"
```

Options:
- `--source` (required): Data source identifier
- `--version` (required): Dataset version
- `--fetch-dir` (required): Path to extracted GTFS directory
- `--url`: Source feed URL
- `--license`: License identifier
- `--dry-run`: Validate without persisting

### Validation

- **Required files**: `agency.txt`, `routes.txt`, `stops.txt`, `trips.txt`, `stop_times.txt`, `calendar.txt`
- **Optional files**: `calendar_dates.txt`, `transfers.txt`, `shapes.txt`
- **Coordinate bounds**: Jabodetabek envelope (`lat -7.5 to -5.5`, `lon 106.0 to 107.8`)
- **Time format**: Accepts transit-day times exceeding `24:00:00`
- **Orphan detection**: Rejects routes/trips/stop_times referencing missing agencies/stops/trips
- **Duplicate detection**: Skips duplicate IDs without error

### Dataset Versioning & Safe Activation

1. Create new `DatasetVersion` (inactive)
2. Run validation + ingestion within transaction
3. If valid: activate new dataset, deactivate previous
4. If failed: new dataset stays inactive, old dataset remains active

### Supported GTFS Files

| File | Support | Notes |
|------|---------|-------|
| `agency.txt` | Required | Mapped to `Agency` |
| `routes.txt` | Required | Mapped to `Route` |
| `stops.txt` | Required | Mapped to `Stop` |
| `trips.txt` | Required | Mapped to `Trip` |
| `stop_times.txt` | Required | Mapped to `StopTime` |
| `calendar.txt` | Required | Mapped to `ServiceCalendar` |
| `calendar_dates.txt` | Optional | Future support |
| `transfers.txt` | Optional | Mapped to `Transfer` |
| `shapes.txt` | Optional | Future support |

## Source Datasets

| Operator | Source URL | License | Status |
|----------|------------|---------|--------|
| TransJakarta | https://gtfs.transjakarta.co.id/files/file_gtfs.zip | CC BY 4.0 | Planned |
| KAI Commuter | https://www.commuterline.id/ | Unknown | Manual reference |

## Reference Data Usage

Reference seed data from `TRANSUM-IN_Development_Handoff/foundation/data/transit_reference.json` is used for:
- Test fixtures
- Development seeds (`prisma/seed.ts`)
- Validation comparison against authoritative source data
