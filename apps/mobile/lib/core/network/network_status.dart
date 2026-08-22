import 'package:flutter_riverpod/flutter_riverpod.dart';

class NetworkStatus {
  final bool isConnected;
  final String? errorMessage;

  const NetworkStatus({this.isConnected = true, this.errorMessage});
}

class NetworkStatusNotifier extends StateNotifier<NetworkStatus> {
  NetworkStatusNotifier() : super(const NetworkStatus());

  void setConnected(bool connected, {String? message}) {
    state = NetworkStatus(isConnected: connected, errorMessage: message);
  }
}

final networkStatusProvider = StateNotifierProvider<NetworkStatusNotifier, NetworkStatus>((ref) {
  return NetworkStatusNotifier();
});
