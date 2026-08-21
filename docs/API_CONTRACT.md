# API Contract

## Health Endpoint

```
GET /health
```

Response:
```json
{
  "api": "ok",
  "database": "ok",
  "timestamp": "2026-08-21T08:43:57.847Z",
  "env": "development"
}
```

## Places Endpoints (Phase 2)

### Search Places

```
GET /places/search?q={query}
```

Response:
```json
{
  "query": "Jakarta",
  "results": [
    {
      "id": "12345",
      "name": "Jakarta Central Station",
      "address": "Jalan Medan Merdeka Timur, Jakarta",
      "latitude": -6.1754,
      "longitude": 106.8272,
      "type": "station",
      "source": "openstreetmap_nominatim",
      "metadata": {}
    }
  ]
}
```

### Reverse Geocode

```
GET /places/reverse?lat={lat}&lon={lon}
```

Response:
```json
{
  "coordinates": {
    "lat": -6.2088,
    "lon": 106.8456
  },
  "result": {
    "id": "98765",
    "name": "Jakarta",
    "address": "Jakarta, DKI Jakarta, Indonesia",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "type": "generic",
    "source": "openstreetmap_nominatim",
    "metadata": {}
  }
}
```

## Transit Endpoints

### Get Routes

```
GET /transit/routes
```

Response:
```json
[
  {
    "id": "uuid",
    "agencyId": "uuid",
    "shortName": "KRL Bogor",
    "longName": "KRL Commuter Line Bogor",
    "routeType": "rail",
    "serviceType": "KRL",
    "color": "#ba1a1a"
  }
]
```

## Auth Endpoints (Foundation)

### Login

```
POST /auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "accessToken": "jwt_token"
}
```
