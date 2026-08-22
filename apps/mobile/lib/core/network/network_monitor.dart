import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

enum NetworkStatus { online, offline, unknown }

class NetworkMonitor {
  final Connectivity _connectivity = Connectivity();
  final Ref _ref;

  NetworkMonitor(this._ref);

  Future<void> startMonitoring() async {
    _connectivity.onConnectivityChanged.listen((
      List<ConnectivityResult> results,
    ) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      _ref
          .read(networkStatusProvider.notifier)
          .setStatus(isOnline ? NetworkStatus.online : NetworkStatus.offline);
    });

    // Initial check
    final results = await _connectivity.checkConnectivity();
    final isOnline = results.any((r) => r != ConnectivityResult.none);
    _ref
        .read(networkStatusProvider.notifier)
        .setStatus(isOnline ? NetworkStatus.online : NetworkStatus.offline);
  }
}

class NetworkStatusNotifier extends StateNotifier<NetworkStatus> {
  NetworkMonitor? _monitor;

  NetworkStatusNotifier() : super(NetworkStatus.unknown);

  void setMonitor(NetworkMonitor monitor) {
    _monitor = monitor;
  }

  void setStatus(NetworkStatus status) {
    state = status;
  }

  bool get isOnline => state == NetworkStatus.online;
}

final networkStatusProvider =
    StateNotifierProvider<NetworkStatusNotifier, NetworkStatus>((ref) {
      return NetworkStatusNotifier();
    });

final networkMonitorProvider = FutureProvider<NetworkMonitor>((ref) async {
  final monitor = NetworkMonitor(ref);
  await monitor.startMonitoring();
  return monitor;
});
