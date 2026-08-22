# TRANSUM-IN Known Limitations

## Phase 7 Limitations

### Database
- No `JourneyHistory` Prisma migration applied (requires `DATABASE_URL`)
- No indexes added on `JourneyHistory` for performance
- No Prisma Client regenerated after schema update

### Authentication
- JWT_SECRET uses hardcoded default (`dev-secret-change-me`) if not configured
- No token refresh mechanism implemented
- No password reset flow
- No OAuth (Google/Facebook) integration
- Mobile: no persistent token storage (secured storage foundation added but not connected)

### Saved Places
- No limit on number of saved places
- No category validation (backend accepts any string)
- No geocoding integration (user must search manually)
- No bulk import from existing data
- Mobile: selection from picker doesn't auto-close picker

### Saved Journeys
- `payloadJson` stored as raw JSON string (not validated)
- No journey update/replan integration
- No notification when saved journey data becomes stale
- No sharing capability
- No journey notes/description field

### Journey History
- Local-only persistence (in-memory by default)
- `HistoryPersistence` class exists but not connected to provider
- No sync with backend history
- No data export capability
- Max 20 entries enforced in provider, not backend

### Home Screen
- Quick saved places show all saved places (no filtering for Rumah/Kampus/Kantor)
- No weather integration
- No service disruption alerts
- No departure time selector (defaults to current time)
- Recent searches not persisted across app restarts

### Profile Screen
- Settings sections are placeholders (show "coming soon" snackbar)
- No actual theme switching
- No actual language switching
- No notification preference persistence
- No data export/privacy controls

### Map Integration
- Walking paths use geodesic approximation (straight lines)
- No real-time vehicle tracking
- No pedestrian routing
- No road-following polylines
- Map preview only available in JourneyDetailScreen (not HomeScreen)

### Network
- No offline mode (app requires network for all operations)
- No request cancellation on screen dispose
- No exponential backoff retry
- No request deduplication (beyond route options)
- No bandwidth-aware loading

### Platform
- Android emulator only tested (`10.0.2.2` for localhost)
- iOS simulator not tested
- Physical device not tested
- No Android notification channels configured
- No iOS background fetch configured
- No deep linking support
- No app links/universal links

### Testing
- No integration tests (widget tests only)
- No backend integration tests (unit tests only)
- No device/emulator runtime tests performed
- No performance profiling
- No accessibility audit
- No localization tests

### Data
- GTFS data primarily covers TransJakarta
- KRL/MRT/LRT coverage may be incomplete
- No real-time schedule data
- No service alerts or disruptions
- No crowd level data
- No fare data (all routes show "Tarif tidak tersedia")

### Security
- No rate limiting on mobile requests
- No request signing
- No certificate pinning
- No obfuscation/proGuard configuration
- No secrets management for production

## Phase 6 Limitations (carried forward)

### Route Options
- Route preferences UI not implemented
- No departure time picker
- No alternative departure times
- No route comparison view
- No estimated arrival notification

### Journey Detail
- Step-by-step instructions are text-only (no visual diagrams)
- No turn-by-turn navigation mode
- No accessibility audio cues
- No estimated walking path visualization

### Navigation
- Basic MaterialPageRoute navigation (no typed routes)
- No deep linking
- No route guards for authentication
- No splash screen on app launch
- No onboarding flow

## Future Enhancement Priorities

### High Priority
1. Complete SharedPreferences history integration
2. Add database migration and Prisma Client regeneration
3. Connect saved places to routing flow
4. Add actual auth token persistence with secure storage
5. Device runtime testing on iOS simulator

### Medium Priority
1. Add real-time connectivity detection
2. Add departure time picker
3. Implement settings persistence
4. Add pagination for large lists
5. Add pull-to-refresh on list screens

### Low Priority
1. Add deep linking support
2. Add notification infrastructure
3. Add offline mode
4. Add analytics/telemetry
5. Add crash reporting
