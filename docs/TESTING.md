# Testing Strategy

## Backend (apps/backend)

### Framework
Jest + ts-jest

### Command
```bash
cd apps/backend && npm run test
```

### Coverage Areas
- Authentication guards and ownership enforcement
- Saved Places CRUD with ownership isolation
- Saved Journeys CRUD with ownership isolation
- Journey History create, list, delete, clear, limit, ownership
- Routing engine contract and calendar edge cases
- Transit graph integrity

## Mobile (apps/mobile)

### Framework
flutter_test

### Command
```bash
cd apps/mobile && flutter test
```

### Coverage Areas
- Route options notifier state transitions
- Journey instruction mapper
- Backend response contract parsing
- Journey map model generation
- Route options helper formatting and validation
- Retry interceptor exponential backoff
- Auth interceptor header injection and 401 handling
- Auth lifecycle (login, logout, initialize, storage restore)
- History persistence lifecycle
- Network retry safe-method gating
- AppConfig platform selection
- Saved journey replan payload validation
- PlacePicker basic rendering
- Integration save-and-replan flow

## Known Gaps
- No device runtime verification (Android/iOS/X)
- RouteOptionsScreen widget tests removed due to test harness instability; replaced by notifier-level coverage
- Settings screen actions intentionally non-functional (documented)
