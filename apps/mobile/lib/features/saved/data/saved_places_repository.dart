import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/location/domain/models.dart';
import 'package:mobile/core/api/api_providers.dart';
import 'package:mobile/features/auth/auth_provider.dart';

class SavedPlace {
  final String id;
  final String userId;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final DateTime createdAt;

  SavedPlace({
    required this.id,
    required this.userId,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
  });

  SavedPlace copyWith({
    String? name,
    String? address,
    double? latitude,
    double? longitude,
  }) {
    return SavedPlace(
      id: id,
      userId: userId,
      name: name ?? this.name,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      createdAt: createdAt,
    );
  }

  factory SavedPlace.fromJson(Map<String, dynamic> json) {
    return SavedPlace(
      id: json['id'] as String,
      userId: json['userId'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      latitude: (json['lat'] as num).toDouble(),
      longitude: (json['lon'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Place toPlace() {
    return Place(
      id: id,
      name: name,
      address: address,
      latitude: latitude,
      longitude: longitude,
      type: PlaceType.savedPlace,
      source: 'saved_place',
    );
  }
}

class SavedPlacesRepository {
  final Ref _ref;

  SavedPlacesRepository(this._ref);

  Future<List<SavedPlace>> list() async {
    final token = _ref.read(authProvider).accessToken;
    final response = await _ref
        .read(apiClientProvider)
        .get('/saved-places', headers: {'Authorization': 'Bearer $token'});

    final places = (response as List?)?.cast<Map<String, dynamic>>() ?? [];
    return places.map((p) => SavedPlace.fromJson(p)).toList();
  }

  Future<SavedPlace> create(
    String name,
    String address,
    double lat,
    double lon,
  ) async {
    final token = _ref.read(authProvider).accessToken;
    final response = await _ref
        .read(apiClientProvider)
        .post(
          '/saved-places',
          data: {'name': name, 'address': address, 'lat': lat, 'lon': lon},
          headers: {'Authorization': 'Bearer $token'},
        );

    return SavedPlace.fromJson(response);
  }

  Future<void> update(
    String id,
    String? name,
    String? address,
    double? lat,
    double? lon,
  ) async {
    final token = _ref.read(authProvider).accessToken;
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (address != null) data['address'] = address;
    if (lat != null) data['lat'] = lat;
    if (lon != null) data['lon'] = lon;

    await _ref
        .read(apiClientProvider)
        .patch(
          '/saved-places/$id',
          data: data,
          headers: {'Authorization': 'Bearer $token'},
        );
  }

  Future<void> delete(String id) async {
    final token = _ref.read(authProvider).accessToken;
    await _ref
        .read(apiClientProvider)
        .delete(
          '/saved-places/$id',
          headers: {'Authorization': 'Bearer $token'},
        );
  }
}

final savedPlacesRepositoryProvider = Provider<SavedPlacesRepository>((ref) {
  return SavedPlacesRepository(ref);
});
