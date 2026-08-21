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
