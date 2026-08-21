# TRANSUM-IN — Data Source & Governance

## 1. Principle

Transit data is the product's factual foundation.

UI mock data is not the source of truth.

Production route/schedule/fare claims must be traceable to a data source.

## 2. Primary source hierarchy

### Level A — official operator/authority

Preferred.

**TransJakarta**
- Route directory: https://transjakarta.co.id/rute
- BRT routes: https://transjakarta.co.id/layanan/brt
- Official GTFS feed endpoint: https://gtfs.transjakarta.co.id/files/file_gtfs.zip

**KAI Commuter**
- Main service information: https://www.commuterline.id/
- KRL route map / guide: https://commuterline.id/files/download/documents/Pedoman-Naik-KRL-KAI-Commuter_compressed.pdf

**JakLingko**
- Jakarta Government overview: https://www.jakarta.go.id/jaklingko
- Use this for integration terminology; do not assume it is the route-level operator for every service.

### Level B — trusted transport/public-data aggregators

Use only for discovery, comparison, or gap-filling when official sources are unavailable, and mark the provenance.

Examples:

- Transitland feed registry
- TUMI Datahub
- validated open-data repositories

They are not automatically authoritative for current operational truth.

## 3. Current-data rule

Every ingest job SHOULD capture:

- source URL;
- HTTP retrieval time;
- feed/version identifier if available;
- checksum;
- row counts;
- schema validation result;
- date coverage;
- effective period.

## 4. Route-change rule

Service may be temporarily changed due to:

- events;
- road closures;
- emergencies;
- maintenance;
- demonstrations;
- weather;
- public holidays.

Therefore route availability MUST have an effective validity window.

Official TransJakarta notices demonstrate that temporary route diversions occur and users may be instructed to check the latest information.

Example:
https://transjakarta.co.id/news/transjakarta-kerahkan-100-bus-dan-lakukan-penyesuaian-rute-dukung-pasar-rakyat-di-monas

## 5. Data classification

### Reference data

Used to design and seed the application.

### Operational data

Current validated service data.

### Live data

Only used when a source actually provides live updates.

### Mock data

Generated for tests or UI previews.

The application must never label mock data as live.

## 6. Audit fields

Every transit record that originated from external data should support:

- source_id
- source_url
- source_version
- fetched_at
- verified_at
- confidence
- effective_from
- effective_to

## 7. Validation checks

At minimum:

- duplicate IDs;
- missing required fields;
- coordinates in Jabodetabek bounds;
- route references resolve;
- trips reference valid routes;
- stop_times reference valid stops;
- stop_sequence strictly increases per trip;
- schedule times are coherent;
- no impossible negative durations;
- agency attribution present;
- route direction is explicit where applicable.

## 8. Important note for AI agents

Do not “fix” missing transit facts by guessing.

Prefer:

`unknown / unavailable`

over fabricated data.
