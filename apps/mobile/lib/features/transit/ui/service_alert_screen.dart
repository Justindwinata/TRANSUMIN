import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/service_alert_repository.dart';
import '../ui/service_alert_widget.dart';

class ServiceAlertScreen extends ConsumerWidget {
  const ServiceAlertScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncAlerts = ref.watch(serviceAlertsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Service Alerts')),
      body: asyncAlerts.when(
        data: (alerts) {
          if (alerts.isEmpty) {
            return const Center(child: Text('Tidak ada peringatan saat ini.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: alerts.length,
            itemBuilder:
                (context, index) => ServiceAlertWidget(alert: alerts[index]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal memuat peringatan: $e')),
      ),
    );
  }
}
