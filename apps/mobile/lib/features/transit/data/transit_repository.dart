import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_providers.dart';
import '../domain/models.dart';

class TransitRepository {
  final Ref _ref;

  TransitRepository(this._ref);

  Future<NearbyTransitResult> getNearbyTransit(
    double lat,
    double lon,
    double radius,
  ) async {
    final response = await _ref
        .read(apiClientProvider)
        .get(
          '/transit/nearby',
          queryParameters: {
            'lat': lat.toString(),
            'lon': lon.toString(),
            'radius': radius.toString(),
          },
        );
    return NearbyTransitResult.fromJson(response);
  }
}

final transitRepositoryProvider = Provider<TransitRepository>((ref) {
  return TransitRepository(ref);
});
