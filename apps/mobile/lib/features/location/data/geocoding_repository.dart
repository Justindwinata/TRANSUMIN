import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_providers.dart';
import '../domain/models.dart';

class GeocodingRepository {
  final dynamic _apiClient;
  GeocodingRepository(this._apiClient);

  Future<List<Place>> search(String query) async {
    final results = await _apiClient.searchPlaces(query);
    return results.map<Place>((json) {
      return Place(
        id: json['id']?.toString(),
        name: json['name'] ?? '',
        address: json['address'],
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        type: _mapType(json['type']),
        source: json['source'] ?? 'backend',
        metadata: json['metadata'] as Map<String, dynamic>?,
      );
    }).toList();
  }

  Future<Place?> reverseGeocode(double lat, double lon) async {
    final result = await _apiClient.reverseGeocode(lat, lon);
    if (result == null) return null;
    return Place(
      id: result['id']?.toString(),
      name: result['name'] ?? '',
      address: result['address'],
      latitude: (result['latitude'] as num).toDouble(),
      longitude: (result['longitude'] as num).toDouble(),
      type: _mapType(result['type']),
      source: result['source'] ?? 'backend',
      metadata: result['metadata'] as Map<String, dynamic>?,
    );
  }

  PlaceType _mapType(String? type) {
    switch (type) {
      case 'landmark':
        return PlaceType.landmark;
      case 'station':
        return PlaceType.station;
      case 'stop':
        return PlaceType.stop;
      case 'savedPlace':
        return PlaceType.savedPlace;
      case 'recentSearch':
        return PlaceType.recentSearch;
      default:
        return PlaceType.generic;
    }
  }
}

final geocodingRepositoryProvider = Provider<GeocodingRepository>((ref) {
  return GeocodingRepository(ref.watch(apiClientProvider));
});
