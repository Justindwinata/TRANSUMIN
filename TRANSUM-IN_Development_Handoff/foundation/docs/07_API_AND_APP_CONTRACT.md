# TRANSUM-IN — API & Mobile App Contract

## 1. API principles

The mobile app should receive domain-level journey data, not raw GTFS tables.

Bad:

`/stop_times?trip_id=...`

Good:

`POST /v1/journeys/search`

## 2. Journey search request

Example conceptual request:

```json
{
  "origin": {
    "lat": -6.365,
    "lon": 106.828
  },
  "destination": {
    "lat": -6.175,
    "lon": 106.827
  },
  "departureTime": "2026-08-21T08:00:00+07:00",
  "optimization": "FASTEST",
  "allowedModes": ["KRL", "TRANSJAKARTA", "MIKROTRANS", "WALK"],
  "maxWalkingMeters": 800
}
```

## 3. Response principles

The response should be readable by the mobile UI directly.

Each journey includes:

- id
- duration
- departure
- arrival
- fare
- fare_status
- walking_distance_m
- transfer_count
- primary_badge
- segments
- data_freshness
- confidence

## 4. Error codes

Use stable machine-readable error codes:

- INVALID_LOCATION
- LOCATION_OUT_OF_SERVICE_AREA
- NO_NEARBY_TRANSIT
- NO_ROUTE_FOUND
- SERVICE_DATA_STALE
- ROUTE_DATA_UNAVAILABLE
- LIVE_DATA_UNAVAILABLE
- LOCATION_PERMISSION_REQUIRED
- NETWORK_UNAVAILABLE
- INTERNAL_ERROR

## 5. Freshness

Every journey response should declare:

- data timestamp;
- schedule validity;
- whether live updates were used;
- whether the result contains estimated values.

## 6. Mobile responsibilities

The mobile app owns:

- screen state;
- navigation;
- map presentation;
- local cache;
- user preferences;
- accessibility;
- active-trip interaction.

The backend owns:

- transit data;
- routing;
- journey ranking;
- source freshness;
- service validity;
- authoritative route facts.

## 7. Maps

The app should receive map-ready geometry:

- route polylines;
- walking polylines;
- stop/station coordinates;
- transfer points.

The mobile layer should not calculate transit routing.
