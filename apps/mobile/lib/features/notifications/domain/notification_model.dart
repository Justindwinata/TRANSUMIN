enum NotificationType {
  serviceDisruption,
  routeChange,
  delay,
  journeyReminder,
  system,
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

  const NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.severity,
    required this.createdAt,
    this.isRead = false,
  });
}
