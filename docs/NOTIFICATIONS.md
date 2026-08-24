# Notifications

## Overview
In-app notification center with persistent read state per user. Notifications are stored locally in SharedPreferences and isolated per authenticated user account.

## Implementation

### Domain Model (`lib/features/notifications/domain/notification_model.dart`)
```dart
enum NotificationType {
  serviceDisruption, routeChange, delay, journeyReminder, system
}
enum NotificationSeverity { info, warning, critical }

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final NotificationSeverity severity;
  final DateTime createdAt;
  final bool isRead;
  
  // JSON serialization with copyWith
}
```

### Repository (`lib/features/notifications/data/notification_repository.dart`)
- Persists notifications to SharedPreferences keyed by user (via `sharedPreferencesProvider`)
- Methods: `fetchAll()`, `add()`, `markRead()`, `markAllRead()`
- Auto-loads on app start, clears on logout via auth listener

### UI
- **NotificationCenterScreen**: List with mark-read, mark-all-read, empty/loading/error states
- **Badge in main app shell**: Top-right bell icon with red unread count

### Account Isolation
- Notifications stored under `sharedPreferencesProvider` which is re-instantiated per user session
- On logout, auth listener clears state; new user gets fresh store

## API Readiness
- Current: Local persistence only
- Future: Replace `NotificationRepository` with backend API calls while keeping same interface