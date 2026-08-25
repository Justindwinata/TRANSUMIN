import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/api_providers.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/network/network_monitor.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/features/history/data/offline_queue.dart';

class QueueProcessor {
  final Ref _ref;
  StreamSubscription<NetworkStatus>? _sub;
  bool _isDraining = false;

  QueueProcessor(this._ref);

  void start() {
    _sub?.cancel();
    _sub = _ref
        .read(networkStatusProvider.notifier)
        .stream
        .listen((status) async {
      if (status == NetworkStatus.online) {
        await _drainQueue();
      }
    });
  }

  Future<void> _drainQueue() async {
    if (_isDraining) return;
    _isDraining = true;
    try {
      final queue = _ref.read(offlineQueueProvider);
      final actions = queue.load();
      if (actions.isEmpty) return;

      final token = _ref.read(authProvider).accessToken;
      if (token == null) return;

      final apiClient = _ref.read(apiClientProvider);

      for (final action in actions) {
        try {
          await _executeAction(apiClient, token, action);
          await queue.remove(action.id);
        } catch (e) {
          // If permanent client error (4xx except 408/429), discard to avoid blocking queue
          final errStr = e.toString();
          if (errStr.contains('Status: 400') ||
              errStr.contains('Status: 401') ||
              errStr.contains('Status: 403') ||
              errStr.contains('Status: 404')) {
            await queue.remove(action.id);
          } else {
            // Temporary network/server error — stop draining
            break;
          }
        }
      }
    } finally {
      _isDraining = false;
    }
  }

  Future<void> _executeAction(ApiClient apiClient, String token, OfflineAction action) async {
    switch (action.type) {
      case OfflineActionType.addHistory:
        await apiClient.syncHistory(token, [action.payload]);
        break;
      case OfflineActionType.removeHistory:
        final id = action.payload['id'] as String;
        await apiClient.delete('/history/$id', headers: {'Authorization': 'Bearer $token'});
        break;
      case OfflineActionType.clearHistory:
        await apiClient.delete('/history', headers: {'Authorization': 'Bearer $token'});
        break;
    }
  }

  void dispose() {
    _sub?.cancel();
  }
}

final queueProcessorProvider = Provider.autoDispose<QueueProcessor>((ref) {
  final processor = QueueProcessor(ref);
  ref.onDispose(() => processor.dispose());
  processor.start();
  return processor;
});