# Transit API Contract

## Endpoints

All endpoints are under `/transit`.

### GET /transit/operators

List all transit operators.

**Response**: 200 OK
```json
[
  {
    "id": "transjakarta",
    "name": "TransJakarta",
    "shortName": "TJ",
    "website": "https://transjakarta.co.id"
  }
]
```

### GET /transit/routes

List all routes, optionally filtered by agency.

**Query Parameters**:
- `agencyId` (optional): Filter by operator ID

**Response**: 200 OK
```json
[
  {
    "id": "TJ-1",
    "agencyId": "transjakarta",
    "shortName": "1",
    "longName": "Blok M - Kota",
    "routeType": "bus",
    "serviceType": "TRANSJAKARTA_BRT",
    "color": "000000",
    "agency": { "name": "TransJakarta" }
  }
]
```

### GET /transit/routes/:id

Get a single route by ID.

**Response**: 200 OK
```json
{
  "id": "TJ-1",
  "agencyId": "transjakarta",
  "shortName": "1",
  "longName": "Blok M - Kota",
  "routeType": "bus",
  "serviceType": "TRANSJAKARTA_BRT",
  "color": "000000",
  "agency": {
    "id": "transjakarta",
    "name": "TransJakarta",
    "shortName": "TJ"
  },
  "trips": [...]
}
```

### GET /transit/stops

List all stops, optionally filtered by agency.

**Query Parameters**:
- `agencyId` (optional): Filter by operator ID

**Response**: 200 OK
```json
[
  {
    "id": "transjakarta-stop-monas",
    "agencyId": "transjakarta",
    "name": "Monumen Nasional",
    "lat": -6.1751,
    "lon": 106.8241,
    "stationId": "station-monas"
  }
]
```

### GET /transit/stops/:id

Get a single stop by ID.

**Response**: 200 OK
```json
{
  "id": "transjakarta-stop-monas",
  "agencyId": "transjakarta",
  "name": "Monumen Nasional",
  "lat": -6.1751,
  "lon": 106.8241,
  "stopTimes": [...]
}
```

### GET /transit/stations

List all stations.

**Response**: 200 OK
```json
[
  {
    "id": "station-jakarta-kota",
    "name": "Stasiun Jakarta Kota",
    "lat": -6.175,
    "lon": 106.8272,
    "operator": "KAI Commuter"
  }
]
```

### GET /transit/stations/:id

Get a single station with child stops.

**Response**: 200 OK
```json
{
  "id": "station-jakarta-kota",
  "name": "Stasiun Jakarta Kota",
  "lat": -6.175,
  "lon": 106.8272,
  "operator": "KAI Commuter",
  "stops": [...]
}
```

### GET /transit/nearby

Find nearby transit stops and stations within a radius.

**Query Parameters**:
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional, default: 1): Search radius in kilometers

> **Note**: Distance is calculated using geodesic (haversine) distance, labeled as such.

**Response**: 200 OK
```json
{
  "stops": [
    {
      "id": "stop-1",
      "name": "Stop 1",
      "lat": -6.2,
      "lon": 106.8,
      "agencyId": "transjakarta",
      "distance": 0.5,
      "type": "stop"
    }
  ],
  "stations": [
    {
      "id": "station-1",
      "name": "Jakarta Kota",
      "lat": -6.175,
      "lon": 106.827,
      "operator": "KAI",
      "distance": 0.8,
      "type": "station"
    }
  ]
}
```
