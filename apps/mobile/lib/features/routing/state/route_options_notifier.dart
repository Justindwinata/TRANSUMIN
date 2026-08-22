import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/routing_repository.dart';
import '../routing.types.dart';

class RouteOptionsState {
  final bool isLoading;
  final List<RouteAlternative>? routes;
  final String? error;

  RouteOptionsState._({required this.isLoading, this.routes, this.error});

  factory RouteOptionsState.idle() => RouteOptionsState._(isLoading: false);
  factory RouteOptionsState.loading() => RouteOptionsState._(isLoading: true);
  factory RouteOptionsState.success(List<RouteAlternative> routes) =>
      RouteOptionsState._(isLoading: false, routes: routes);
  factory RouteOptionsState.error(String message) =>
      RouteOptionsState._(isLoading: false, error: message);
}

class RouteOptionsNotifier extends StateNotifier<RouteOptionsState> {
  final RoutingRepository repository;

  RouteOptionsNotifier(this.repository) : super(RouteOptionsState.idle());

  Future<void> searchRoutes(JourneyRequest request) async {
    state = RouteOptionsState.loading();
    try {
      final routes = await repository.planJourney(request);
      state = RouteOptionsState.success(routes);
    } catch (e) {
      state = RouteOptionsState.error(e.toString());
    }
  }

  void reset() => state = RouteOptionsState.idle();
}

final routeOptionsProvider = StateNotifierProvider<RouteOptionsNotifier, RouteOptionsState>((ref) {
  return RouteOptionsNotifier(ref.read(routingRepositoryProvider));
});
