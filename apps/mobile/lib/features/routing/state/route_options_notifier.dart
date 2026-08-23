import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/routing_repository.dart';
import '../domain/models.dart';

enum RoutingStatus { idle, searching, loading, success, noRoute, error }

class RoutingFailure {
  final String message;
  final bool isNetworkError;
  const RoutingFailure({required this.message, required this.isNetworkError});
}

class RouteOptionsState {
  final RoutingStatus status;
  final List<RouteAlternative> routes;
  final RoutingFailure? failure;
  final String? requestId;
  final DateTime? searchedAt;

  const RouteOptionsState._({
    required this.status,
    required this.routes,
    this.failure,
    this.requestId,
    this.searchedAt,
  });

  factory RouteOptionsState.idle() =>
      const RouteOptionsState._(status: RoutingStatus.idle, routes: []);

  factory RouteOptionsState.searching(String requestId) => RouteOptionsState._(
    status: RoutingStatus.searching,
    routes: const [],
    requestId: requestId,
  );

  factory RouteOptionsState.loading(String requestId) => RouteOptionsState._(
    status: RoutingStatus.loading,
    routes: const [],
    requestId: requestId,
  );

  factory RouteOptionsState.success(
    List<RouteAlternative> routes,
    String requestId,
  ) => RouteOptionsState._(
    status: routes.isEmpty ? RoutingStatus.noRoute : RoutingStatus.success,
    routes: routes,
    requestId: requestId,
    searchedAt: DateTime.now(),
  );

  factory RouteOptionsState.noRoute(String requestId) => RouteOptionsState._(
    status: RoutingStatus.noRoute,
    routes: const [],
    requestId: requestId,
    searchedAt: DateTime.now(),
  );

  factory RouteOptionsState.error(RoutingFailure failure, String requestId) =>
      RouteOptionsState._(
        status: RoutingStatus.error,
        routes: const [],
        failure: failure,
        requestId: requestId,
      );

  bool isStale(String currentRequestId) =>
      requestId != null && currentRequestId != requestId;
}

class RouteOptionsNotifier extends StateNotifier<RouteOptionsState> {
  final RoutingRepository repository;
  String _currentRequestId = '';
  Future<void>? _inFlight;

  RouteOptionsNotifier(this.repository, [RouteOptionsState? initialState])
      : super(initialState ?? RouteOptionsState.idle());

  String _newRequestId() => DateTime.now().microsecondsSinceEpoch.toString();

  Future<void> searchRoutes(JourneyRequest request) async {
    final requestId = _newRequestId();
    _currentRequestId = requestId;
    state = RouteOptionsState.searching(requestId);

    final future = _runSearch(request, requestId);
    _inFlight = future;
    return future;
  }

  Future<void> _runSearch(JourneyRequest request, String requestId) async {
    try {
      state = RouteOptionsState.loading(requestId);
      if (_isStale(requestId)) return;

      final routes = await repository.planJourney(request);

      if (_isStale(requestId)) return;

      if (routes.isEmpty) {
        state = RouteOptionsState.noRoute(requestId);
      } else {
        state = RouteOptionsState.success(routes, requestId);
      }
    } catch (e) {
      if (_isStale(requestId)) return;
      state = RouteOptionsState.error(
        RoutingFailure(
          message: e.toString(),
          isNetworkError: _isNetworkError(e),
        ),
        requestId,
      );
    }
  }

  bool _isStale(String requestId) => requestId != _currentRequestId;

  bool _isNetworkError(Object error) {
    final s = error.toString().toLowerCase();
    return s.contains('socket') ||
        s.contains('connection') ||
        s.contains('timeout') ||
        s.contains('network');
  }

  Future<void> retry(JourneyRequest request) async {
    if (_inFlight != null) return;
    await searchRoutes(request);
  }

  void reset() {
    _currentRequestId = '';
    state = RouteOptionsState.idle();
  }

  RouteAlternative? routeById(String id) {
    try {
      return state.routes.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }
}

final routeOptionsProvider =
    StateNotifierProvider<RouteOptionsNotifier, RouteOptionsState>((ref) {
      return RouteOptionsNotifier(ref.read(routingRepositoryProvider));
    });
