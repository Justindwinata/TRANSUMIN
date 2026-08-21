# System Architecture — TRANSUM-IN

## High-Level Diagram

```text
+-------------------------------------------------------------+
|                      Flutter Mobile App                     |
|                                                             |
|  [ Presentation (UI / Riverpod) ]
|  [ Domain (Entities / UseCases) ]
|  [ Data (Repositories / ApiClient / Storage) ]
+----------------------------------+---------------------------+
                                | HTTPS / JSON
                                v
+-------------------------------------------------------------+
|                        NestJS Backend                       |
|                                                             |
|  [ Auth Module (JWT / OAuth Adapters) ]
|  [ Transit Domain Module (Agencies, Routes, Stops, Trips) ]
|  [ Transit Ingestion Module (GTFS Raw, Staging, Normalize) ]
|  [ Place/Geocoding Module (Nominatim Proxy) ]
|  [ User/Saved Module (Saved Places & Journeys) ]
|  [ Health Module (Monitoring & Status) ]
+----------------------------------+---------------------------+
                                | Prisma ORM
                                v
+-------------------------------------------------------------+
|                    PostgreSQL Database                      |
|                                                             |
|  Data Sources, Dataset Versions, Agencies, Routes, Stops,  |
|  Stations, Trips, StopTimes, Calendars, Transfers,
|  SavedPlaces, SavedJourneys
+-------------------------------------------------------------
```

## Architectural Decoupling

1. **Mobile Application**: Clean Architecture with strict layer separation. No direct SQL or raw HTTP calls from UI screens.
2. **Backend API**: Feature-based NestJS modules exposing domain-driven REST API endpoints.
3. **Data Layer**: Prisma ORM with strict migration control and strong TypeScript typing.
4. **Map Provider**: Abstracted map layer in Flutter to easily substitute Google Maps, Mapbox, or OpenStreetMap.

## Transit Ingestion Layer

```text
External GTFS Feed (ZIP/CSV)
    ↓
Raw Fetch (download via CLI)
    ↓
CsvParser → typed Gtfs objects
    ↓
GtfsValidator (coordinates, times, duplicates)
    ↓
GtfsNormalizer (namespace IDs, map to canonical)
    ↓
Canonical DB (upsert via transaction)
    ↓
DatasetRegistry (version + safe activation)
    ↓
Transit API (normalized, queryable)
```

- Raw/staging layer preserved through typed parsing and validation.
- Dataset versioning ensures safe activation (failed datasets never go live).
- Provenance tracked via `DataSource` and `DatasetVersion` models.
