# Dataset Activation and Lifecycle

## Overview
TRANSUM-IN manages multiple transit datasets with safe activation, versioning, and rollback capabilities.

## Dataset States

### Downloaded
Raw GTFS data fetched from source, stored with checksum.

### Validating
Data passed through GTFS validation pipeline.

### Validated
All GTFS records validated; orphans and invalid records identified.

### Failed
Validation failed; dataset marked as failed, active dataset unchanged.

### Active
Dataset is currently used for routing and graph building.

### Superseded
Previous active dataset replaced by new active dataset.

## Activation Process

1. **New dataset ingested** → state: downloaded
2. **Validation runs** → state: validating
3. **If valid** → state: validated
4. **Graph built** → state: active (previous active → superseded)
5. **If validation fails** → state: failed (previous active unchanged)

## Safety Guarantees

- Only one active dataset at a time
- Failed datasets never become active
- Previous active dataset preserved for rollback
- Activation is atomic (transaction)
- Checksum verification on all artifacts

## Current Status

**Active Dataset:** TransJakarta (2026-08-27)
- Routes: 240
- Stops: 8,091
- Trips: 700
- Stop Times: 26,427
- Calendars: 7
- Transfers: 14
- Shapes: 242,485
- Status: Active
- License: CC BY 4.0

## Rollback

If new dataset becomes active but causes issues:

```bash
npx tsx src/modules/transit/ingestion/cli/activate-dataset.ts <previous-dataset-id>
```

Graph is automatically rebuilt from the activated dataset.
