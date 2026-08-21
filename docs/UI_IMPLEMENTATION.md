# UI Implementation

## Design System Source of Truth
Canonical tokens live in `apps/mobile/lib/core/theme/app_theme.dart` and `apps/mobile/lib/core/constants/app_constants.dart`.

## Reusable Widgets
- `AppButton`: Primary and secondary buttons with 48px min height.
- `AppCard`: Elevated surface container with rounded-xl (24px) corners.
- `TransitBadge`: Color-coded mode identifier (KRL/TransJakarta/Jaklingko/Walk).
- `RouteCard`: Route result presentation with primary ranking badge.
- `JourneyStepWidget`: Single journey step in active trip or detail view.
- `EmptyState`: Reusable empty view with optional CTA.
- `ErrorState`: Reusable error view with retry action.
- `LoadingState`: Reusable loading indicator.

## Accessibility
- Minimum 48px touch targets.
- Icon-only actions have semantic labels.
- Color is never the sole signal.
