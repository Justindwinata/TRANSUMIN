import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/domain/models.dart';

void main() {
  group('Backend Response Contract Validation', () {
    test('should parse minimal valid journey response', () {
      final json = {
        'journeys': [
          {
            'id': 'journey-1',
            'origin': {'latitude': -6.2, 'longitude': 106.8},
            'destination': {'latitude': -6.3, 'longitude': 106.9},
            'departureTime': '08:00:00',
            'arrivalTime': '09:00:00',
            'summary': {
              'totalDurationSeconds': 3600,
              'transitDurationSeconds': 3000,
              'walkingDurationSeconds': 600,
              'walkingDistanceMeters': 800.0,
              'waitingDurationSeconds': 0,
              'transferCount': 0,
              'fareText': 'Tarif tidak tersedia',
            },
            'segments': [],
          },
        ],
      };

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys.length, 1);
      expect(journeys[0].id, 'journey-1');
      expect(journeys[0].totalDurationSeconds, 3600);
    });

    test('should parse rich journey with all optional fields', () {
      final json = {
        'journeys': [
          {
            'id': 'journey-1',
            'origin': {'latitude': -6.2, 'longitude': 106.8, 'name': 'Home'},
            'destination': {
              'latitude': -6.3,
              'longitude': 106.9,
              'name': 'Office',
            },
            'departureTime': '08:00:00',
            'arrivalTime': '09:30:00',
            'primaryRankingBadge': 'Tercepat',
            'summary': {
              'totalDurationSeconds': 5400,
              'transitDurationSeconds': 4200,
              'walkingDurationSeconds': 1200,
              'walkingDistanceMeters': 1500.0,
              'waitingDurationSeconds': 0,
              'transferCount': 1,
              'fareText': 'Rp 5000',
              'badge': 'Tercepat',
            },
            'segments': [
              {
                'type': 'WALK',
                'durationSeconds': 600,
                'distanceMeters': 800.0,
                'instruction': 'Berjalan ke Halte Bundaran HI',
                'fromName': 'Rumah',
                'toName': 'Halte Bundaran HI',
                'fromLat': -6.2,
                'fromLon': 106.8,
                'toLat': -6.21,
                'toLon': 106.81,
              },
              {
                'type': 'TRANSIT',
                'durationSeconds': 1800,
                'distanceMeters': 12000.0,
                'instruction': 'Naik TransJakarta Koridor 1',
                'fromName': 'Halte Bundaran HI',
                'toName': 'Halte Senayan',
                'fromLat': -6.21,
                'fromLon': 106.81,
                'toLat': -6.22,
                'toLon': 106.82,
                'routeShortName': 'TJ1',
                'routeLongName': 'TransJakarta Koridor 1',
                'routeColor': '0053DB',
                'serviceType': 'TRANSJAKARTA_BRT',
                'agencyName': 'TransJakarta',
                'tripHeadsign': 'Blok M',
                'departureTime': '08:10:00',
                'arrivalTime': '08:40:00',
                'intermediateStopsCount': 5,
              },
              {
                'type': 'WALK',
                'durationSeconds': 600,
                'distanceMeters': 800.0,
                'instruction': 'Berjalan ke Kantor',
                'fromName': 'Halte Senayan',
                'toName': 'Kantor',
                'fromLat': -6.22,
                'fromLon': 106.82,
                'toLat': -6.23,
                'toLon': 106.83,
              },
            ],
          },
        ],
      };

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys.length, 1);
      final j = journeys[0];

      expect(j.id, 'journey-1');
      expect(j.origin.name, 'Home');
      expect(j.destination.name, 'Office');
      expect(j.badge, 'Tercepat');
      expect(j.totalDurationSeconds, 5400);
      expect(j.transferCount, 1);
      expect(j.walkingDistanceMeters, 1500.0);

      expect(j.segments.length, 3);
      expect(j.segments[0].type, 'WALK');
      expect(j.segments[1].type, 'TRANSIT');
      expect(j.segments[1].routeShortName, 'TJ1');
      expect(j.segments[1].intermediateStopsCount, 5);
      expect(j.segments[2].type, 'WALK');
    });

    test('should handle empty journeys list', () {
      final json = {'journeys': []};

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys.length, 0);
    });

    test('should handle null journeys gracefully', () {
      final json = {'journeys': null};

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys.length, 0);
    });

    test('should parse multiple journeys with different ranking badges', () {
      final json = {
        'journeys': [
          {
            'id': 'journey-fastest',
            'origin': {'latitude': -6.2, 'longitude': 106.8},
            'destination': {'latitude': -6.3, 'longitude': 106.9},
            'departureTime': '08:00:00',
            'arrivalTime': '08:30:00',
            'primaryRankingBadge': 'Tercepat',
            'summary': {
              'totalDurationSeconds': 1800,
              'transitDurationSeconds': 1500,
              'walkingDurationSeconds': 300,
              'walkingDistanceMeters': 400.0,
              'waitingDurationSeconds': 0,
              'transferCount': 0,
              'fareText': 'Rp 3000',
            },
            'segments': [],
          },
          {
            'id': 'journey-transfers',
            'origin': {'latitude': -6.2, 'longitude': 106.8},
            'destination': {'latitude': -6.3, 'longitude': 106.9},
            'departureTime': '08:00:00',
            'arrivalTime': '09:00:00',
            'primaryRankingBadge': 'Minim Transit',
            'summary': {
              'totalDurationSeconds': 3600,
              'transitDurationSeconds': 3000,
              'walkingDurationSeconds': 600,
              'walkingDistanceMeters': 800.0,
              'waitingDurationSeconds': 0,
              'transferCount': 0,
              'fareText': 'Rp 5000',
            },
            'segments': [],
          },
        ],
      };

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys.length, 2);
      expect(journeys[0].badge, 'Tercepat');
      expect(journeys[1].badge, 'Minim Transit');
    });

    test('should preserve segment order in journey', () {
      final json = {
        'journeys': [
          {
            'id': 'journey-1',
            'origin': {'latitude': -6.2, 'longitude': 106.8},
            'destination': {'latitude': -6.3, 'longitude': 106.9},
            'departureTime': '08:00:00',
            'arrivalTime': '09:00:00',
            'summary': {
              'totalDurationSeconds': 3600,
              'transitDurationSeconds': 3000,
              'walkingDurationSeconds': 600,
              'walkingDistanceMeters': 800.0,
              'waitingDurationSeconds': 0,
              'transferCount': 0,
              'fareText': 'Tarif tidak tersedia',
            },
            'segments': [
              {
                'type': 'WALK',
                'durationSeconds': 300,
                'instruction': 'Walk 1',
                'fromName': 'A',
                'toName': 'B',
              },
              {
                'type': 'TRANSIT',
                'durationSeconds': 1500,
                'instruction': 'Ride',
                'fromName': 'B',
                'toName': 'C',
                'routeShortName': 'R1',
              },
              {
                'type': 'WALK',
                'durationSeconds': 300,
                'instruction': 'Walk 2',
                'fromName': 'C',
                'toName': 'D',
              },
            ],
          },
        ],
      };

      final journeys =
          (json['journeys'] as List?)
              ?.map((j) => RouteAlternative.fromJson(j))
              .toList() ??
          [];

      expect(journeys[0].segments.length, 3);
      expect(journeys[0].segments[0].type, 'WALK');
      expect(journeys[0].segments[1].type, 'TRANSIT');
      expect(journeys[0].segments[2].type, 'WALK');
    });
  });
}
