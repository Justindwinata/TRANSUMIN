# Phase 15: Data Ingestion Operations Guide

## Quick Start

### List Available Datasets
```bash
npm run transit:list
```

### Ingest Reference TransJakarta Data
```bash
npm run transit:ingest -- \
  --source transjakarta \
  --version v1.0.0 \
  --fetch-dir test/fixtures/transjakarta \
  --url "reference://transjakarta" \
  --license "CC BY 4.0"
```

### Dry-Run (Validate Without Persisting)
```bash
npm run transit:ingest -- \
  --source transjakarta \
  --version v1.0.0 \
  --fetch-dir test/fixtures/transjakarta \
  --dry-run
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│   Transit Data Source (Official/Public) │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   SourceAdapter (GTFS/API/etc)          │
│  • GtfsStaticSource                     │
│  • ReferenceSource                      │
│  • Future: APIAdapter, RTAdapter        │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   ArtifactStore (Raw + Metadata)        │
│  • Immutable storage                    │
│  • SHA256 verification                  │
│  • Provenance tracking                  │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   CsvParser + GtfsValidator             │
│  • Parsing (quoted, CRLF, etc.)         │
│  • Validation (coords, times, refs)     │
│  • Normalization + Hashing              │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   DatasetRegistry                       │
│  • Version creation + metadata          │
│  • Safe activation (last-known-good)    │
│  • Validation result tracking           │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   TransitGraph Build                    │
│  • Nodes: stops/stations                │
│  • Edges: ride/transfer/walk            │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   Routing Engine (Ready for Real Data)  │
│  • Multimodal planning                  │
│  • Service calendar validation          │
└─────────────────────────────────────────┘
```

## Data Quality

Each ingestion produces:
- Total records ingested
- Records accepted vs rejected
- Rejection rate %
- Coverage by entity type
- Validation issue counts
- Human-readable summary

Example output:
```
Ingested 668/668 records (0.0% rejected). Routes: 2, Stops: 4, Trips: 3, StopTimes: 10
```

## Security

Source validation enforces:
- HTTPS only
- Domain whitelist (configurable)
- File size limits (500MB default)
- MIME type validation (zip, csv, json)
- Archive path traversal prevention
- URL format validation

## Dataset Lifecycle

```
Created (status: downloaded)
  ↓
Validated (status: validated, validation_result: passed/failed)
  ↓
Activated (is_active: true) OR Failed (status: failed, is_active: false)
```

Failed datasets never replace active data. Last known good is preserved.

## Troubleshooting

### "Source not found" error
Ensure source is registered first:
```bash
DatasetRegistry.registerDataSource(metadata)
```

### Validation failures
Check:
- Orphan references (trip_id refs missing route_id)
- Invalid coordinates (outside Jabodetabek bounds)
- Invalid times (malformed HH:MM:SS)
- Duplicate IDs

Run with `--dry-run` to validate without persisting.

### File not found
Ensure `--fetch-dir` points to directory with GTFS CSV files:
- agency.txt (required)
- routes.txt (required)
- stops.txt (required)
- trips.txt (required)
- stop_times.txt (required)
- calendar.txt (required)
- transfers.txt (optional)
- shapes.txt (optional)
- calendar_dates.txt (optional)

## Phase 16 Integration

When official sources become available:

1. Create operator-specific adapter
2. Implement fetch() method
3. Validate source URL
4. Run ingestion pipeline
5. Monitor data quality metrics
6. Activate if validation passes

All existing infrastructure supports this workflow automatically.
