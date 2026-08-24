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

  NotificationItem copyWith({bool? isRead}) {
    return NotificationItem(
      id: id,
      title: title,
      body: body,
      type: type,
      severity: severity,
      createdAt: createdAt,
      isRead: isRead ?? this.isRead,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'body': body,
    'type': _typeToString(type),
    'severity': _severityToString(severity),
    'createdAt': createdAt.toIso8601String(),
    'isRead': isRead,
  };

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: _typeFromString(json['type'] as String?),
      severity: _severityFromString(json['severity'] as String?),
      createdAt: DateTime.parse(json['createdAt'] as String),
      isRead: json['isRead'] as bool? ?? false,
    );
  }

  static String _typeToString(NotificationType t) {
    switch (t) {
      case NotificationType.serviceDisruption:
        return 'serviceDisruption';
      case NotificationType.routeChange:
        return 'routeChange';
      case NotificationType.delay:
        return 'delay';
      case NotificationType.journeyReminder:
        return 'journeyReminder';
      case NotificationType.system:
        return 'system';
    }
  }

  static NotificationType _typeFromString(String? v) {
    switch (v) {
      case 'routeChange':
        return NotificationType.routeChange;
      case 'delay':
        return NotificationType.delay;
      case 'journeyReminder':
        return NotificationType.journeyReminder;
      case 'system':
        return NotificationType.system;
      case 'serviceDisruption':
      default:
        return NotificationType.serviceDisruption;
    }
  }

  static String _severityToString(NotificationSeverity s) {
    switch (s) {
      case NotificationSeverity.warning:
        return 'warning';
      case NotificationSeverity.critical:
        return 'critical';
      case NotificationSeverity.info:
      default:
        return 'info';
    }
  }

  static NotificationSeverity _severityFromString(String? v) {
    switch (v) {
      case 'warning':
        return NotificationSeverity.warning;
      case 'critical':
        return NotificationSeverity.critical;
      case 'info':
      default:
        return NotificationSeverity.info;
    }
  }
}
