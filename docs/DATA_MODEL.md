# Transit Data Model

## Overview

The transit data model represents official transit data ingested from GTFS feeds and other authoritative sources.

## Canonical Entities

### DataSource
Tracks external data providers and feed URLs.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Provider identifier (e.g., `transjakarta`) |
| name | String | Human-readable name |
| url | String | Feed URL |
| license | String? | License if applicable |
| lastFetchedAt | DateTime | Last fetch timestamp |

### DatasetVersion
Each ingestion produces a version. Only one active at a time.

| Field | Type | Description |
|-------|------|-------------|
| id | String | UUID |
| sourceId | String | FK to DataSource |
| version | String | Version string |
| isActive | Boolean | Active dataset flag |
| createdAt | DateTime | Creation timestamp |

### Agency
Transit operator or data publisher.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Namespaced ID |
| name | String | Full agency name |
| shortName | String | Short identifier |
| authority | String | Operating authority |
| website | String? | Website URL |
| sourceUrl | String? | Source feed URL |
| lastVerifiedAt | DateTime | Last verification timestamp |

### Route
A service path/line.

| Field | Type | Description |
|-------|------|-------------|
| id | String | GTFS route_id (namespaced) |
| agencyId | String | FK to Agency |
| shortName | String | Short name/code |
| longName | String | Full route name |
| routeType | String | GTFS route_type |
| serviceType | String | KRL, TRANSJAKARTA_BRT, MIKROTRANS, etc. |
| color | String? | Route color (hex) |

### Station
A station complex (rail station, major transit hub).

| Field | Type | Description |
|-------|------|-------------|
| id | String | UUID |
| name | String | Station name |
| lat | Float | Latitude |
| lon | Float | Longitude |
| operator | String? | Operating entity |

### Stop
A specific boarding/alighting point.

| Field | Type | Description |
|-------|------|-------------|
| id | String | GTFS stop_id (namespaced) |
| agencyId | String | FK to Agency |
| name | String | Stop name |
| lat | Float | Latitude |
| lon | Float | Longitude |
| stationId | String? | Parent station |

### Trip
A scheduled service instance/pattern.

| Field | Type | Description |
|-------|------|-------------|
| id | String | GTFS trip_id (namespaced) |
| routeId | String | FK to Route |
| serviceId | String | Service calendar ID |
| directionId | Int | 0/1 direction |
| headsign | String | Direction label |

### StopTime
Scheduled arrival/departure at a stop.

| Field | Type | Description |
|-------|------|-------------|
| tripId | String | FK to Trip |
| stopId | String | FK to Stop |
| arrivalTime | String | Arrival time (GTFS format, may exceed 24:00) |
| departureTime | String | Departure time (GTFS format) |
| stopSequence | Int | Sequence number |

**Note**: GTFS times may exceed `24:00:00` for trips after midnight. These are preserved as strings.

### ServiceCalendar
Weekday service schedule.

| Field | Type | Description |
|-------|------|-------------|
| serviceId | String | Service ID |
| monday-sunday | Boolean | Operating days |
| startDate | DateTime | Start date |
| endDate | DateTime | End date |

### Transfer
Transfer between stops/stations.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Auto-generated |
| fromStopId | String | Source stop |
| toStopId | String | Destination stop |
| transferType | Int | GTFS transfer type |
| minTransferTime | Int? | Minimum transfer time (seconds) |

## Provenance

All canonical records preserve provenance via `sourceUrl`, `source`, and dataset versioning.
