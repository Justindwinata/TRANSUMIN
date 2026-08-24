import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_providers.dart';
import '../../../core/network/network_status.dart';
import '../domain/service_alert.dart';

class ServiceAlertRepository {
  final Ref _ref;

  ServiceAlertRepository(this._ref);

  Future<List<ServiceAlert>> getActiveAlerts() async {
    final connected = _ref.read(networkStatusProvider).isConnected;
    if (!connected) {
      return ServiceAlertFixtures.developmentAlerts();
    }
    try {
      final response = await _ref.read(apiClientProvider).get('/service-alerts');
      final list =
          (response['alerts'] as List?) ?? (response['data'] as List?);
      return (list ?? [])
          .cast<Map<String, dynamic>>()
          .map((j) => ServiceAlert.fromJson(j))
          .toList();
    } catch (e) {
      return ServiceAlertFixtures.developmentAlerts();
    }
  }
}

final serviceAlertRepositoryProvider =
    Provider<ServiceAlertRepository>((ref) {
  return ServiceAlertRepository(ref);
});

final serviceAlertsProvider = FutureProvider<List<ServiceAlert>>((ref) async {
  final repo = ref.watch(serviceAlertRepositoryProvider);
  return repo.getActiveAlerts();
});
