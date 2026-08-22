import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_providers.dart';
import '../domain/models.dart';
import '../routing.types.dart';

class RoutingRepository {
  final Ref _ref;

  RoutingRepository(this._ref);

  Future<List<RouteAlternative>> planJourney(
    JourneyRequest request,
  ) async {
    final response = await _ref.read(apiClientProvider).post('/routing/plan', data: {
      'origin': {'latitude': request.origin.latitude, 'longitude': request.origin.longitude, 'name': request.origin.name},
      'destination': {'latitude': request.destination.latitude, 'longitude': request.destination.longitude, 'name': request.destination.name},
      'departureTime': request.departureTime?.toIso8601String(),
      'preference': request.preference,
    });

    final journeys = (response['journeys'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return journeys.map((j) => RouteAlternative.fromJson(j)).toList();
  }
}

final routingRepositoryProvider = Provider<RoutingRepository>((ref) {
  return RoutingRepository(ref);
});
