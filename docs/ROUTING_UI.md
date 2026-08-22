# Routing UI Architecture

## Overview

Phase 6 implements the complete routing user experience for TRANSUM-IN, transforming the backend routing engine into a mobile-first journey planning interface.

## State Machine

### RoutingStatus

The routing experience uses an explicit state machine:

```dart
enum RoutingStatus {
  idle,       // No search initiated
  searching,  // Request initiated
  loading,    // Backend processing
  success,    // Routes returned
  noRoute,    // No routes found
  error,      // Request failed
}
```

### Request Identity Protection

Each routing request is assigned a unique ID to prevent race conditions:

- Concurrent requests are tracked
- Stale responses are discarded
- Only the latest request updates UI state

### State Transitions

```
idle → searching → loading → success
                           → noRoute
                           → error
```

Any state can be reset to `idle` by user action.

## Screen Architecture

### RouteOptionsScreen

Displays route alternatives returned by the backend.

**States:**
- Loading: Shows progress message
- Success: Displays route cards
- No Route: Empty state with retry
- Error: Network or API error with retry

**Route Card Display:**
- Duration (formatted)
- Departure/arrival times
- Transit modes (badges)
- Transfer count
- Walking distance
- Ranking badge (e.g., "Tercepat")
- Fare information

**Actions:**
- Select route → opens JourneyDetailScreen
- Swap origin/destination → returns to search
- Refresh → re-requests routes

### JourneyDetailScreen

Shows step-by-step journey instructions and map preview.

**Components:**
1. **Header**: Origin → Destination with duration badge
2. **Summary**: Total time, transfers, walking, modes
3. **Map Preview**: Route visualization with markers/lines
4. **Journey Timeline**: Step-by-step instructions

### Journey Instructions

Instructions are generated from backend `JourneySegment` data using `JourneyInstructionMapper`.

**Instruction Types:**
- Start: "Mulai dari [location]"
- Walk: "Berjalan ke [stop]"
- Wait: "Tunggu kendaraan"
- Board: "Naik [route] di [stop]"
- Ride: "Menuju [stop]" with duration
- Alight: "Turun di [stop]"
- Transfer: "Transfer ke [next mode]"
- Arrive: Journey end

Each instruction includes:
- Title (user-facing action)
- Subtitle (details: distance, time, stops)
- Icon type (walk, transit, transfer, etc.)
- Optional coordinates

## Map Visualization

### JourneyMapModel

Presentation model for journey visualization:

```dart
class JourneyMapModel {
  final List<JourneyMapMarker> markers;
  final List<JourneySegmentLine> segments;
  final ({double lat, double lon})? center;
  final double? zoom;
  final bool hasFullGeometry;
}
```

**Markers:**
- Origin (blue circle)
- Destination (flag)
- Boarding points (transit icon)
- Alighting points (filled transit icon)
- Transfer stops

**Segment Lines:**
- Transit segments (colored by route)
- Walking segments (gray, straight)
- Transfer segments (orange, point)

**Geometry Limitations:**

Walking segments use straight-line approximation between stops. The architecture preserves semantic distinction between:
- Precise transit routes (stop-to-stop)
- Approximate walking paths (geodesic)

Future enhancement: Replace walking approximations with pedestrian routing API.

## Navigation Flow

```
HomeScreen
  ↓ (user selects origin/destination)
Search Complete
  ↓ (tap "Cari Rute")
RouteOptionsScreen
  ↓ (select route)
JourneyDetailScreen
  ↓ (view map/steps)
```

Back navigation reverses naturally.

## Error Handling

### Network Errors

Detected by exception message pattern matching:
- "socket"
- "connection"
- "timeout"
- "network"

Displays: "Tidak Ada Koneksi" with retry.

### API Errors

Non-network exceptions display error message with retry.

### Empty Results

Backend returns `[]` journeys:
- Status: `noRoute`
- Message: "Belum menemukan rute yang sesuai"
- Action: Change location or retry

### Missing Data

Models handle null/missing fields gracefully:
- Default values for required fields
- Null-safe access for optional fields
- Fallback labels for display

## Testing Strategy

### Unit Tests

- **Domain Models**: Serialization, formatting, computed properties
- **State Machine**: State transitions, request identity, stale protection
- **Instruction Mapper**: Segment → instruction conversion
- **Map Model**: Marker generation, geometry validation

### Widget Tests

- Route card rendering
- State-specific UI (loading, success, error, empty)
- Navigation flow

### Contract Tests

Backend response parsing with:
- Minimal valid responses
- Full optional field coverage
- Empty/null handling
- Multiple journeys

### Integration Tests

Not implemented in Phase 6 (requires mock HTTP or test backend).

## Accessibility

- Semantic labels for map controls
- Screen-reader-friendly route summaries
- Adequate touch target sizes (48dp minimum)
- Non-color-only transit mode distinctions
- Meaningful button labels
- Loading/error state announcements

## Limitations

### Map Visualization

- Walking paths are geodesic approximations, not actual pedestrian routes
- No turn-by-turn walking directions
- Segments simplified to start/end coordinates only
- No real-time vehicle tracking

### Routing Data

- Fare information unavailable (displays "Tarif tidak tersedia")
- No real-time delay information
- Calendar-based schedules only (no live updates)
- Limited multimodal coverage (TransJakarta primary)

### UI Features Not Implemented

- Route preferences UI (fastest/fewest transfers/etc.)
- Departure time picker (uses current time)
- Save/favorite routes
- Share journey
- Alternative departure times
- Route comparison view

## Performance

- Routing state uses request versioning to prevent duplicate queries
- Dio connection pooling for HTTP efficiency
- Lazy map tile loading
- No excessive rebuilds (ConsumerStatefulWidget)

## Design System Compliance

All UI components follow TRANSUM-IN design tokens:
- Primary blue: `#2563EB`
- KRL red: `#BA1A1A`
- TransJakarta blue: `#0053DB`
- JakLingko green: `#006A61`
- Card radius: 24dp
- Typography: Inter font family

## Future Enhancements

1. **Real-time Updates**: Live vehicle positions, delays
2. **Pedestrian Routing**: Replace walking approximations with actual paths
3. **Route Preferences**: UI for user-selectable optimization profiles
4. **Saved Routes**: Persistent favorites
5. **Offline Mode**: Cache recent routes
6. **Notifications**: Departure reminders, service alerts
7. **Multi-leg Editing**: Modify journey mid-route
8. **Accessibility**: Voice guidance, high-contrast mode
