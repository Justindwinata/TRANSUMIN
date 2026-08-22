# TRANSUM-IN API Contract

## Base URL

```
Development: http://localhost:3000
Production:  [To be configured]
```

## Authentication

Currently no authentication required for routing endpoints.

## Routing Endpoints

### POST /routing/plan

Plan a journey between two locations.

**Request Body:**

```json
{
  "origin": {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "name": "Bundaran HI"
  },
  "destination": {
    "latitude": -6.2443,
    "longitude": 106.7999,
    "name": "Blok M"
  },
  "departureTime": "2024-08-19T08:00:00",
  "preference": "fastest"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| origin.latitude | number | Yes | Origin latitude |
| origin.longitude | number | Yes | Origin longitude |
| origin.name | string | No | Origin display name |
| destination.latitude | number | Yes | Destination latitude |
| destination.longitude | number | Yes | Destination longitude |
| destination.name | string | No | Destination display name |
| departureTime | string | No | ISO 8601 departure time (defaults to now) |
| preference | string | No | Optimization profile: `fastest`, `fewestTransfers`, `leastWalking`, `simplest` |

**Response (200 OK):**

```json
{
  "journeys": [
    {
      "id": "direct:trip-123:stop-a->stop-b",
      "origin": {
        "latitude": -6.2088,
        "longitude": 106.8456,
        "name": "Bundaran HI"
      },
      "destination": {
        "latitude": -6.2443,
        "longitude": 106.7999,
        "name": "Blok M"
      },
      "requestedDepartureTime": "2024-08-19T08:00:00.000Z",
      "departureTime": "08:10:00",
      "arrivalTime": "08:45:00",
      "summary": {
        "totalDurationSeconds": 3600,
        "transitDurationSeconds": 2400,
        "walkingDurationSeconds": 600,
        "walkingDistanceMeters": 800,
        "waitingDurationSeconds": 600,
        "transferCount": 0,
        "fareText": "Tarif tidak tersedia",
        "badge": "Tercepat"
      },
      "primaryRankingBadge": "Tercepat",
      "segments": [
        {
          "type": "WALK",
          "durationSeconds": 300,
          "distanceMeters": 400,
          "instruction": "Berjalan ke Halte Bundaran HI",
          "fromName": "Bundaran HI",
          "toName": "Halte Bundaran HI",
          "fromLat": -6.2088,
          "fromLon": 106.8456,
          "toLat": -6.2099,
          "toLon": 106.8467
        },
        {
          "type": "WAIT",
          "durationSeconds": 600,
          "instruction": "Tunggu sekitar 10 menit",
          "fromName": "Halte Bundaran HI",
          "toName": "Halte Bundaran HI",
          "fromLat": -6.2099,
          "fromLon": 106.8467,
          "toLat": -6.2099,
          "toLon": 106.8467,
          "departureTime": "08:10:00"
        },
        {
          "type": "TRANSIT",
          "durationSeconds": 1800,
          "distanceMeters": 12000,
          "instruction": "Naik TransJakarta Koridor 1 menuju Blok M",
          "fromName": "Halte Bundaran HI",
          "toName": "Halte Blok M",
          "fromLat": -6.2099,
          "fromLon": 106.8467,
          "toLat": -6.2443,
          "toLon": 106.7999,
          "routeShortName": "1",
          "routeLongName": "TransJakarta Koridor 1",
          "routeColor": "0053DB",
          "serviceType": "TRANSJAKARTA_BRT",
          "agencyName": "TransJakarta",
          "tripHeadsign": "Blok M",
          "departureTime": "08:10:00",
          "arrivalTime": "08:40:00",
          "intermediateStopsCount": 8
        },
        {
          "type": "WALK",
          "durationSeconds": 300,
          "distanceMeters": 400,
          "instruction": "Berjalan ke Blok M",
          "fromName": "Halte Blok M",
          "toName": "Blok M",
          "fromLat": -6.2443,
          "fromLon": 106.7999,
          "toLat": -6.2443,
          "toLon": 106.7999
        }
      ]
    }
  ],
  "count": 1,
  "requestedAt": "2024-08-19T07:55:00.000Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| journeys | Journey[] | Array of journey alternatives (max 6) |
| count | number | Number of journeys returned |
| requestedAt | string | ISO 8601 timestamp of request |

**Journey Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique journey identifier |
| origin | LocationPoint | Journey origin |
| destination | LocationPoint | Journey destination |
| requestedDepartureTime | string | User's requested departure time |
| departureTime | string | Actual departure time (HH:mm:ss) |
| arrivalTime | string | Estimated arrival time (HH:mm:ss) |
| summary | JourneySummary | Journey statistics |
| primaryRankingBadge | string | Badge for top-ranked journey (e.g., "Tercepat") |
| segments | Segment[] | Array of journey segments |

**Segment Types:**

| Type | Description |
|------|-------------|
| WALK | Walking segment |
| WAIT | Waiting at stop |
| TRANSIT | Riding transit |
| TRANSFER | Transfer between routes |

**Segment Fields:**

| Field | Type | TRANSIT | WALK | WAIT | TRANSFER |
|-------|------|---------|------|------|----------|
| type | string | ✓ | ✓ | ✓ | ✓ |
| durationSeconds | number | ✓ | ✓ | ✓ | ✓ |
| distanceMeters | number | ✓ | ✓ | | ✓ |
| instruction | string | ✓ | ✓ | ✓ | ✓ |
| fromName | string | ✓ | ✓ | ✓ | ✓ |
| toName | string | ✓ | ✓ | ✓ | ✓ |
| fromLat | number | ✓ | ✓ | ✓ | ✓ |
| fromLon | number | ✓ | ✓ | ✓ | ✓ |
| toLat | number | ✓ | ✓ | | |
| toLon | number | ✓ | ✓ | | |
| routeShortName | string | ✓ | | | |
| routeLongName | string | ✓ | | | |
| routeColor | string | ✓ | | | |
| serviceType | string | ✓ | | | |
| agencyName | string | ✓ | | | |
| tripHeadsign | string | ✓ | | | |
| departureTime | string | ✓ | | ✓ | ✓ |
| arrivalTime | string | ✓ | | | |
| intermediateStopsCount | number | ✓ | | | |

**Optimization Profiles:**

| Profile | Badge Label | Optimization Focus |
|---------|-------------|-------------------|
| fastest | Tercepat | Minimum total travel time |
| fewestTransfers | Minim Transit | Minimum transfers |
| leastWalking | Minim Jalan | Minimum walking distance |
| simplest | Paling Sederhana | Balanced simplicity score |

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Invalid request (missing required fields, invalid coordinates) |
| 500 | Internal server error |

**No Routes Found:**

When no routes are available, returns empty array:

```json
{
  "journeys": [],
  "count": 0,
  "requestedAt": "2024-08-19T08:00:00.000Z"
}
```

## Known Limitations

### Fare Information

Fares are currently unavailable. All responses return:

```json
"fareText": "Tarif tidak tersedia"
```

Future implementation will integrate operator fare APIs.

### Geometry

Walking segments use straight-line approximation between coordinates. Transit segments represent stop-to-stop paths, not full route geometry.

Future enhancement: Integrate pedestrian routing and full transit route shapes.

### Real-time Data

All times are schedule-based from GTFS data. No real-time delay or disruption information is currently available.

### Service Coverage

Primary coverage is TransJakarta BRT routes from official GTFS. KRL, MRT, and LRT data may be limited depending on ingested datasets.

## Versioning

Current API version: 1.0.0

Breaking changes will be versioned via URL path (e.g., `/v2/routing/plan`).

## Rate Limiting

Currently no rate limiting. Production deployment should implement appropriate limits.
