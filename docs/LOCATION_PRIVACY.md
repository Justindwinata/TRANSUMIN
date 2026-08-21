# Location Privacy & Security Policy

## Overview
TRANSUM-IN respects user location privacy and handles coordinates as sensitive data.

## Principles

1. **Explicit Permission:** Location permissions are requested only when needed for journey planning.
2. **Minimal Usage:** Precise location is used to populate origin coordinates and show position on map.
3. **No Indefinite Persistence:** Device location coordinates are not permanently stored on backend servers.
4. **Log Sanitization:** Coordinate data is scrubbed from production logs and crash reports.
5. **Transparency:** Users are informed why location permissions are needed.

## Location Usage Flow

```text
User triggers "Lokasi Sekarang" or Map Picker
  ↓
Check location permission
  ├─ Granted → Obtain current location
  ├─ Denied  → Fall back to manual selection
  └─ Permanently Denied → Direct user to Settings or manual input
```

## Data Retention

- **Device Location:** Retained in memory only during active session.
- **Search History:** Recent destination coordinates stored locally on device.
- **Saved Places:** User-named locations stored in user account (encrypted in transit).

## External Provider Policy

- Reverse geocoding requests pass coordinates to provider (e.g. OpenStreetMap Nominatim).
- No personally identifiable information (PII) is included in geocoding requests.
