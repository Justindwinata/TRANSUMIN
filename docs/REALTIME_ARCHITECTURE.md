# Realtime Architecture

## Overview
TRANSUM-IN provides a clean realtime architecture that separates static schedule data from realtime updates, with safe fallback behavior.

## Architecture Components

### RealtimeProvider (Interface)
```typescript
interface RealtimeProvider {
  name: string;
  status: RealtimeSourceStatus;
  lastUpdate?: Date;
  getVehiclePositions?(): Promise<RealtimeVehiclePosition[]>;
  getTripUpdates?(): Promise<RealtimeTripUpdate[]>;
  getServiceAlerts?(): Promise<RealtimeServiceAlert[]>;
  isHealthy(): boolean;
}
```

### RealtimeSourceStatus
- `ACTIVE` - Provider is healthy and returning data
- `STALE` - Provider hasn't updated within threshold
- `UNAVAILABLE` - No realtime feed configured
- `ERROR` - Provider is failing

### RealtimeManager
Central registry that:
- Registers multiple providers
- Aggregates data from all active providers
- Provides health monitoring
- Handles graceful degradation

## Data Types

### RealtimeVehiclePosition
- Vehicle ID, trip ID, route ID
- Latitude, longitude, bearing, speed
- Occupancy status
- Current stop sequence
- Timestamp

### RealtimeTripUpdate
- Trip ID, route ID
- Schedule relationship (SCHEDULED, ADDED, UNSCHEDULED, CANCELLED)
- Stop time updates with delays
- Vehicle assignment

### RealtimeServiceAlert
- Alert ID, cause, effect
- Severity level
- Header/description text
- Active periods
- Informed entities (routes, stops, trips)

## Fallback Behavior

### Static Schedule Priority
1. **Static GTFS** - Always the source of truth
2. **Realtime Updates** - Layered on top when available
3. **Fallback** - If realtime is stale/unavailable, use static

### Stale Detection
```
If (now - lastUpdate > 5 minutes) => status = STALE
If (provider error) => status = ERROR
If (no providers) => status = UNAVAILABLE
```

## Current Status

### DisabledRealtimeProvider (Active)
- Returns empty arrays for all queries
- Status: UNAVAILABLE
- Used when no realtime feeds are available

### Real Feeds (Not Yet Available)
- TransJakarta: No public GTFS-RT
- KAI Commuter: App-only tracking
- MRT Jakarta: No public feed
- LRT Jakarta: No public feed

## Integration Points

### Routing Engine (Future)
```typescript
async planWithRealtime(request) {
  const realtime = await realtimeManager.getTripUpdates();
  const staticTrips = await this.getStaticTrips();
  return mergeRealtimeWithStatic(staticTrips, realtime);
}
```

### Service Alerts (Future)
```typescript
async getActiveAlerts(routeId?) {
  const realtime = await realtimeManager.getServiceAlerts();
  return realtime.filter(a => !routeId || a.informedEntity.some(e => e.routeId === routeId));
}
```

## Security

### Source Validation
- Only registered providers can be added
- All external feeds must be whitelisted
- HTTPS required
- Size limits enforced
- Timeout protection

### Data Sanitization
- Coordinate bounds validation
- Timestamp validation
- Entity reference validation
- No code execution

## Testing

### Unit Tests
- RealtimeManager initialization
- Disabled provider behavior
- Provider registration
- Health status tracking
- Empty data fallback

### Integration Tests (Future)
- GTFS-RT feed parsing
- Real feed connection
- Alert propagation
- Fallback behavior

## Next Steps

1. Add GTFS-RT parser implementation
2. Add TransJakarta realtime adapter when available
3. Add KAI Commuter realtime adapter
4. Implement routing integration
5. Add service alert UI