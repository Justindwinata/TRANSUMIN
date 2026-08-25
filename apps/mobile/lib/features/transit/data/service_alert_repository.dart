import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_providers.dart';
import '../../../core/network/network_status.dart';
import '../domain/service_alert.dart';

class ServiceAlertRepository {
  final Ref _ref;

  ServiceAlertRepository(this._ref);

  Future<List<ServiceAlert>> getActiveAlerts({
    String? operatorName,
    String? affectedRoute,
    String? affectedStop,
    String? severity,
    String? status,
    String? source,
  }) async {
    final connected = _ref.read(networkStatusProvider).isConnected;
    if (!connected) {
      return ServiceAlertFixtures.developmentAlerts();
    }
    try {
      final queryParams = <String, String>{};
      if (operatorName != null) queryParams['operatorName'] = operatorName;
      if (affectedRoute != null) queryParams['affectedRoute'] = affectedRoute;
      if (affectedStop != null) queryParams['affectedStop'] = affectedStop;
      if (severity != null) queryParams['severity'] = severity;
      if (status != null) queryParams['status'] = status;
      if (source != null) queryParams['source'] = source;

      final response = await _ref
          .read(apiClientProvider)
          .get('/service-alerts', queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final list = (response['alerts'] as List?) ?? (response['data'] as List?);
      return (list ?? [])
          .cast<Map<String, dynamic>>()
          .map((j) => ServiceAlert.fromJson(j))
          .toList();
    } catch (e) {
      return ServiceAlertFixtures.developmentAlerts();
    }
  }
}

final serviceAlertRepositoryProvider = Provider<ServiceAlertRepository>((ref) {
  return ServiceAlertRepository(ref);
});

final serviceAlertsProvider = FutureProvider<List<ServiceAlert>>((ref) async {
  final repo = ref.watch(serviceAlertRepositoryProvider);
  return repo.getActiveAlerts();
});
