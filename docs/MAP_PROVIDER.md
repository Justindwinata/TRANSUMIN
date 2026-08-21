# Map Provider Decision — TRANSUM-IN

## Evaluation Criteria
- Flutter support (iOS + Android)
- Marker support
- Polyline support (for route rendering)
- Camera control
- Geolocation compatibility
- Licensing
- API key handling
- Offline capability
- Maintenance status
- Community support

## Options Evaluated

### 1. Google Maps (google_maps_flutter)
- **Pros:** Industry standard, excellent documentation, robust feature set, native performance.
- **Cons:** Requires API key, billing account, usage limits, restricted offline use.

### 2. Mapbox (flutter_mapbox_gl / mapbox_maps_flutter)
- **Pros:** Good feature set, customizable styles, generous free tier.
- **Cons:** API key required, official Flutter plugin less mature than Google Maps.

### 3. OpenStreetMap (flutter_map + OSM tiles)
- **Pros:** Open source, no API keys for tile usage, highly customizable, offline tile caching possible.
- **Cons:** No native map widgets, less polished UX, manual marker/polyline management, tile server reliability.

## Decision: flutter_map with OpenStreetMap

**Rationale:**
- Phase 2 focus is location/place/search foundation, not production map polish.
- flutter_map provides sufficient abstraction and control.
- No API key requirements simplify Phase 2 development.
- OSM tiles adequate for MVP development and testing.
- Migration to Google Maps or Mapbox remains straightforward via abstraction layer.

**Trade-offs:**
- Manual marker management required.
- Camera animations less polished than native SDKs.
- Production may require migration to native map SDK.

## Implementation Plan
- Create `MapService` abstraction interface.
- Implement `FlutterMapService` concrete provider.
- Keep map-specific logic isolated in `features/map/` module.
