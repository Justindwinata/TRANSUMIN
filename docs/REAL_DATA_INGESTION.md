# Real Data Ingestion Workflow

## Overview
TRANSUM-IN now supports ingestion of official GTFS Static datasets from verified transit operators.

## Supported Sources

### TransJakarta
- **Status:** Verified and Ingested
- **Source:** PPID Transjakarta (https://ppid.transjakarta.co.id/informasi/berkala/gtfs)
- **License:** CC BY 4.0
- **Format:** GTFS Static (ZIP)
- **Update Frequency:** As published by operator
- **Coverage:** 240 routes, 8,091 stops, 700 trips

## Ingestion Process

### 1. Download GTFS Data
```bash
curl -o data/gtfs/transjakarta/gtfs.zip https://ppid.transjakarta.co.id/informasi/berkala/gtfs
unzip -o data/gtfs/transjakarta/gtfs.zip -d data/gtfs/transjakarta/
```

### 2. Validate GTFS Structure
```bash
npx tsx src/modules/transit/ingestion/cli/ingest.ts \
  --source transjakarta \
  --version $(date +%Y%m%d) \
  --fetch-dir ./data/gtfs/transjakarta \
  --url https://ppid.transjakarta.co.id/informasi/berkala/gtfs \
  --license "CC BY 4.0" \
  --dry-run
```

### 3. Ingest into Database
```bash
npx tsx src/modules/transit/ingestion/cli/ingest.ts \
  --source transjakarta \
  --version $(date +%Y%m%d) \
  --fetch-dir ./data/gtfs/transjakarta \
  --url https://ppid.transjakarta.co.id/informasi/berkala/gtfs \
  --license "CC BY 4.0"
```

### 4. Refresh Command
```bash
npx tsx src/modules/transit/ingestion/cli/refresh.ts
```

## Data Quality
- Validation: All records validated against GTFS specification
- Duplicates: Detected and excluded
- Orphans: Detected and reported
- Coordinates: Validated for Jabodetabek bounds
- Times: Validated (supports >24:00:00 for calendar wrapping)

## Database State
- Active dataset marked and tracked
- Previous datasets preserved (rollback capability)
- Provenance metadata stored
- Artifact checksums verified

## Graph Building
- Graph built from active dataset
- 8,091 nodes (stops)
- 25,727 ride edges
- 14 transfer edges
- 7,823 connected nodes
- 268 isolated nodes (edge case stops)

## Routing
Real routing tested on actual TransJakarta network. Example journey:
- 18 Office Park → ACC Simatupang: 20 min, direct (11 stops)
- ABA → Al Barkah: 44 min, direct (23 stops)
