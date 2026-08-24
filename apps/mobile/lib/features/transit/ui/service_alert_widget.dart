import 'package:flutter/material.dart';
import '../domain/service_alert.dart';

class ServiceAlertWidget extends StatelessWidget {
  final ServiceAlert alert;

  const ServiceAlertWidget({Key? key, required this.alert}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _getColor(alert.severity).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _getColor(alert.severity)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning, size: 16, color: _getColor(alert.severity)),
              const SizedBox(width: 8),
              Text(
                alert.title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _getColor(alert.severity),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(alert.description),
        ],
      ),
    );
  }

  Color _getColor(AlertSeverity severity) {
    switch (severity) {
      case AlertSeverity.critical:
        return Colors.red;
      case AlertSeverity.major:
        return Colors.orange;
      case AlertSeverity.minor:
        return Colors.amber;
      case AlertSeverity.info:
      default:
        return Colors.blue;
    }
  }
}
