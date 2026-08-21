# Transit Data Strategy

## Principles
- Official GTFS is the source of truth for TransJakarta/KRL.
- Data must include provenance (source, version, fetched_at).
- Do not fabricate transit network data.
- Use "unknown/unavailable" for missing data.

## Initial Data Setup
- Bootstrap with reference data in `foundation/data/transit_reference.json`.
- Future phase: automated pipeline for GTFS ingestion.
- Validation: ensure stop sequencing is strictly ordered, coordinates are within Jabodetabek bounds, and trip references are valid.
