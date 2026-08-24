import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/service_alert.dart';

class ServiceAlertRepository {
  // TODO: Add backend API call here. Using fixtures for now as per instructions.
  Future<List<ServiceAlert>> getActiveAlerts() async {
    return ServiceAlertFixtures.developmentAlerts();
  }
}

final serviceAlertRepositoryProvider = Provider<ServiceAlertRepository>((ref) {
  return ServiceAlertRepository();
});

final serviceAlertsProvider = FutureProvider<List<ServiceAlert>>((ref) async {
  final repo = ref.read(serviceAlertRepositoryProvider);
  return repo.getActiveAlerts();
});
