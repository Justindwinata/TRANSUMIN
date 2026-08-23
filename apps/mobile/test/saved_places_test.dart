import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/saved/data/saved_places_repository.dart';

void main() {
  group('SavedPlace', () {
    test('fromJson should parse correctly', () {
      final json = {
        'id': 'place-1',
        'userId': 'user-1',
        'name': 'Kampus',
        'address': 'Jl. Sudirman No. 1',
        'lat': -6.2,
        'lon': 106.8,
        'createdAt': '2024-08-19T08:00:00Z',
      };

      final place = SavedPlace.fromJson(json);

      expect(place.id, 'place-1');
      expect(place.userId, 'user-1');
      expect(place.name, 'Kampus');
      expect(place.address, 'Jl. Sudirman No. 1');
      expect(place.latitude, -6.2);
      expect(place.longitude, 106.8);
    });

    test('copyWith should create new instance with updated fields', () {
      final place = SavedPlace(
        id: '1',
        userId: 'u1',
        name: 'Home',
        address: 'Address 1',
        latitude: -6.2,
        longitude: 106.8,
        createdAt: DateTime(2024),
      );

      final updated = place.copyWith(name: 'Kantor', latitude: -6.3);

      expect(updated.id, '1');
      expect(updated.name, 'Kantor');
      expect(updated.latitude, -6.3);
      expect(updated.longitude, 106.8);
    });

    test('copyWith should preserve unchanged fields', () {
      final place = SavedPlace(
        id: '1',
        userId: 'u1',
        name: 'Home',
        address: 'Address 1',
        latitude: -6.2,
        longitude: 106.8,
        createdAt: DateTime(2024),
      );

      final updated = place.copyWith(name: 'Kantor');

      expect(updated.id, '1');
      expect(updated.userId, 'u1');
      expect(updated.address, 'Address 1');
      expect(updated.longitude, 106.8);
      expect(updated.createdAt, DateTime(2024));
    });

    test('toPlace should create a Place instance', () {
      final savedPlace = SavedPlace(
        id: '1',
        userId: 'u1',
        name: 'Home',
        address: 'Address 1',
        latitude: -6.2,
        longitude: 106.8,
        createdAt: DateTime(2024),
      );

      final place = savedPlace.toPlace();

      expect(place.id, '1');
      expect(place.name, 'Home');
      expect(place.address, 'Address 1');
      expect(place.latitude, -6.2);
      expect(place.longitude, 106.8);
    });
  });
}
