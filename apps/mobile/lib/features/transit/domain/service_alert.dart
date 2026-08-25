enum AlertSeverity { info, minor, major, critical }

enum AlertStatus { active, resolved, scheduled }

class ServiceAlert {
  final String id;
  final String title;
  final String description;
  final DateTime startsAt;
  final DateTime? endsAt;
  final AlertSeverity severity;
  final AlertStatus status;
  final String source;
  final String? operatorName;
  final String? affectedRouteShortName;
  final String? affectedStopName;
  final bool isDevelopmentData;

  const ServiceAlert({
    required this.id,
    required this.title,
    required this.description,
    required this.startsAt,
    this.endsAt,
    this.severity = AlertSeverity.info,
    this.status = AlertStatus.active,
    this.source = 'fixture',
    this.operatorName,
    this.affectedRouteShortName,
    this.affectedStopName,
    this.isDevelopmentData = false,
  });

  factory ServiceAlert.fromJson(Map<String, dynamic> json) {
    return ServiceAlert(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      startsAt:
          DateTime.tryParse(json['startsAt'] as String? ?? '') ??
          DateTime.now(),
      endsAt:
          json['endsAt'] == null
              ? null
              : DateTime.tryParse(json['endsAt'] as String),
      severity: _severityFromString(json['severity'] as String? ?? 'info'),
      status: _statusFromString(json['status'] as String? ?? 'active'),
      source: json['source'] as String? ?? 'fixture',
      operatorName: json['operatorName'] as String?,
      affectedRouteShortName: json['affectedRouteShortName'] as String?,
      affectedStopName: json['affectedStopName'] as String?,
      isDevelopmentData: json['isDevelopmentData'] as bool? ?? _isDevelopmentBySource(json['source'] as String? ?? 'fixture'),
    );
  }

  static bool _isDevelopmentBySource(String source) {
    return source == 'fixture' || source == 'development';
  }

  static AlertSeverity _severityFromString(String? value) {
    switch (value) {
      case 'minor':
        return AlertSeverity.minor;
      case 'major':
        return AlertSeverity.major;
      case 'critical':
        return AlertSeverity.critical;
      case 'info':
      default:
        return AlertSeverity.info;
    }
  }

  static AlertStatus _statusFromString(String? value) {
    switch (value) {
      case 'resolved':
        return AlertStatus.resolved;
      case 'scheduled':
        return AlertStatus.scheduled;
      case 'active':
      default:
        return AlertStatus.active;
    }
  }

  bool affectsRoute(String? routeShortName) {
    if (routeShortName == null) return false;
    return affectedRouteShortName == routeShortName;
  }
}

class ServiceAlertFixtures {
  static List<ServiceAlert> developmentAlerts() {
    final now = DateTime.now();
    return [
      ServiceAlert(
        id: 'dev-alert-1',
        title: '[DEV] Demo: Penutupan Jalur sementara',
        description:
            'Ini adalah contoh data pengembangan. Jalur ditutup sementara untuk pemeliharaan.',
        startsAt: now.subtract(const Duration(hours: 1)),
        endsAt: now.add(const Duration(hours: 4)),
        severity: AlertSeverity.major,
        status: AlertStatus.active,
        operatorName: 'TransJakarta',
        affectedRouteShortName: '1',
        isDevelopmentData: true,
      ),
      ServiceAlert(
        id: 'dev-alert-2',
        title: '[DEV] Info: Penambahan jadwal',
        description:
            'Jadwal tambahan akan berlaku mulai besok. Data demonstrasi.',
        startsAt: now.add(const Duration(days: 1)),
        severity: AlertSeverity.info,
        status: AlertStatus.scheduled,
        operatorName: 'KRL Commuter Line',
        isDevelopmentData: true,
      ),
    ];
  }
}
