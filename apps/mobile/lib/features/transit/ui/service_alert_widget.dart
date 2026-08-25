import 'package:flutter/material.dart';
import '../domain/service_alert.dart';

class ServiceAlertWidget extends StatelessWidget {
  final ServiceAlert alert;

  const ServiceAlertWidget({Key? key, required this.alert}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDevFallback = alert.isDevelopmentData || alert.source == 'fixture' || alert.source == 'development';
    final sourceLabel = _getSourceLabel(alert.source);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDevFallback
            ? Colors.grey[100]
            : _getColor(alert.severity).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDevFallback ? Colors.grey : _getColor(alert.severity),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isDevFallback ? Icons.info_outline : Icons.warning,
                size: 16,
                color: isDevFallback ? Colors.grey[600] : _getColor(alert.severity),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  alert.title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isDevFallback ? Colors.grey[700] : _getColor(alert.severity),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            alert.description,
            style: TextStyle(color: Colors.grey[700]),
          ),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerRight,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isDevFallback ? Colors.grey[200] : Colors.blue[50],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                sourceLabel,
                style: TextStyle(
                  fontSize: 10,
                  color: isDevFallback ? Colors.grey[600] : Colors.blue[700],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getSourceLabel(String source) {
    switch (source) {
      case 'live':
        return 'Data langsung';
      case 'official':
        return 'Data resmi';
      case 'fixture':
        return 'Data demo';
      case 'development':
        return 'Data simulasi';
      default:
        return 'Data tidak diketahui';
    }
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
