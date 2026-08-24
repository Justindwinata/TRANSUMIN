# Route Preferences

## Overview
User-selectable routing optimization criteria persisted locally and passed to backend for ranking. Affects visible ordering of route alternatives in `RouteOptionsScreen`.

## Preference Values
| Value | Label (ID) | Backend Profile | Description |
|-------|------------|-----------------|-------------|
| `fastest` | Tercepat | `FASTEST` | Minimize total duration |
| `minTransfers` | Sedikit Peralihan | `FEWEST_TRANSFERS` | Minimize transfer count |
| `minWalking` | Jalan Kaki Minimal | `LEAST_WALKING` | Minimize walking distance/time |
| `simplest` | Paling Sederhana | `SIMPLEST` | Fewest segments, minimal complexity |

## Persistence
- `UserPreferencesRepository` stores in SharedPreferences key `route_preference`
- `RoutePreferenceNotifier` loads on init, exposes `setPreference()`
- Default: `fastest`

## Backend Integration

### Routing Request
Mobile `JourneyRequest.preference` → `RoutingRequestDto.preference` (string) → `OptimizationProfile`

### Scoring (`RoutingEngine.scoreJourney`)
```typescript
const ROUTING_WEIGHTS = {
  FASTEST: { travelTime: 1.0, transfer: 50, walk: 2, wait: 2 },
  FEWEST_TRANSFERS: { travelTime: 0.3, transfer: 500, walk: 5, wait: 5 },
  LEAST_WALKING: { travelTime: 0.8, transfer: 50, walk: 0.5, wait: 3 },
  SIMPLEST: { travelTime: 0.5, transfer: 200, walk: 3, wait: 3 },
};
score = duration*w.travelTime + transfers*w.transfer + walk*w.walk + wait*w.wait
```

### Ranking
- Journeys sorted by score ascending (lower = better)
- First journey gets `primaryRankingBadge` label (e.g., "Tercepat", "Minim Transit")

## Mobile Ranking Fallback
`RouteRanker.rank(routes, preference)` applies same logic client-side as safety net if backend doesn't rank.

## UI
- **HomeScreen**: Shows current preference chip below search inputs
- **SettingsScreen > Rute & Navigasi**: Bottom sheet radio selector (`_PreferenceTile`)
- **RouteOptionsScreen**: Badges on top result show active ranking

## Tests
- `RouteOptionsHelper.sortByPreference` tests verify different orderings for each preference
- `RouteOptionsNotifier` passes preference in request