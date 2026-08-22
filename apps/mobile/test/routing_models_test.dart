import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/domain/models.dart';

void main() {
  group('JourneyRequest', () {
    test('toJson should serialize correctly', () {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Origin'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Dest'),
        departureTime: DateTime(2024, 8, 19, 8, 0),
        preference: 'fastest',
      );

      final json = request.toJson();

      expect(json['origin']['latitude'], -6.2);
      expect(json['origin']['longitude'], 106.8);
      expect(json['origin']['name'], 'Origin');
      expect(json['destination']['latitude'], -6.3);
      expect(json['destination']['longitude'], 106.9);
      expect(json['destination']['name'], 'Dest');
      expect(json['departureTime'], '2024-08-19T08:00:00.000');
      expect(json['preference'], 'fastest');
    });

    test('toJson should omit null departureTime', () {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      final json = request.toJson();

      expect(json.containsKey('departureTime'), false);
    });
  });

  group('RouteAlternative', () {
    test('fromJson should parse backend response', () {
      final json = {
        'id': 'journey-1',
        'origin': {'latitude': -6.2, 'longitude': 106.8, 'name': 'A'},
        'destination': {'latitude': -6.3, 'longitude': 106.9, 'name': 'B'},
        'departureTime': '08:00:00',
        'arrivalTime': '09:00:00',
        'summary': {
          'totalDurationSeconds': 3600,
          'transitDurationSeconds': 2400,
          'walkingDurationSeconds': 600,
          'walkingDistanceMeters': 800.0,
          'waitingDurationSeconds': 600,
          'transferCount': 1,
          'fareText': 'Rp 5000',
        },
        'primaryRankingBadge': 'Tercepat',
        'segments': [
          {
            'type': 'WALK',
            'durationSeconds': 300,
            'distanceMeters': 400.0,
            'instruction': 'Walk to station',
            'fromName': 'Origin',
            'toName': 'Station A',
          },
        ],
      };

      final route = RouteAlternative.fromJson(json);

      expect(route.id, 'journey-1');
      expect(route.totalDurationSeconds, 3600);
      expect(route.transferCount, 1);
      expect(route.walkingDistanceMeters, 800.0);
      expect(route.badge, 'Tercepat');
      expect(route.segments.length, 1);
      expect(route.segments[0].type, 'WALK');
    });

    test('durationText should format correctly', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3660,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 660,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      expect(route.durationText, '1 jam 1 mnt');
    });

    test('durationText should format minutes only', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '08:45',
        totalDurationSeconds: 2700,
        transitDurationSeconds: 2400,
        walkingDurationSeconds: 300,
        walkingDistanceMeters: 400,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      expect(route.durationText, '45 mnt');
    });

    test('walkDistanceText should format kilometers', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 1500,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      expect(route.walkDistanceText, '1.5 km jalan kaki');
    });

    test('walkDistanceText should format meters', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 450,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      expect(route.walkDistanceText, '450 m jalan kaki');
    });

    test('transitModes should extract unique modes from segments', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 1,
        fareText: 'Rp 5000',
        segments: [
          JourneySegment(
            type: 'WALK',
            durationSeconds: 300,
            instruction: 'Walk',
            fromName: 'A',
            toName: 'B',
          ),
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 1500,
            instruction: 'Ride',
            fromName: 'B',
            toName: 'C',
            routeShortName: 'KRL',
          ),
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 1500,
            instruction: 'Ride',
            fromName: 'C',
            toName: 'D',
            routeShortName: 'TransJakarta',
          ),
        ],
      );

      expect(route.transitModes, ['KRL', 'TransJakarta']);
    });

    test('transitModes should return walk if no transit segments', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
        departureTime: '08:00',
        arrivalTime: '08:30',
        totalDurationSeconds: 1800,
        transitDurationSeconds: 0,
        walkingDurationSeconds: 1800,
        walkingDistanceMeters: 2000,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Gratis',
        segments: [
          JourneySegment(
            type: 'WALK',
            durationSeconds: 1800,
            instruction: 'Walk',
            fromName: 'A',
            toName: 'B',
          ),
        ],
      );

      expect(route.transitModes, ['Jalan Kaki']);
    });
  });

  group('JourneySegment', () {
    test('fromJson should parse segment data', () {
      final json = {
        'type': 'TRANSIT',
        'durationSeconds': 1500,
        'distanceMeters': 10000.0,
        'instruction': 'Ride KRL',
        'fromName': 'Stasiun A',
        'toName': 'Stasiun B',
        'fromLat': -6.2,
        'fromLon': 106.8,
        'toLat': -6.3,
        'toLon': 106.9,
        'routeShortName': 'KRL',
        'routeLongName': 'KRL Commuter Line',
        'routeColor': 'BA1A1A',
        'serviceType': 'KRL',
        'agencyName': 'KAI Commuter',
        'tripHeadsign': 'Jakarta Kota',
        'departureTime': '08:00:00',
        'arrivalTime': '08:25:00',
        'intermediateStopsCount': 3,
      };

      final segment = JourneySegment.fromJson(json);

      expect(segment.type, 'TRANSIT');
      expect(segment.durationSeconds, 1500);
      expect(segment.routeShortName, 'KRL');
      expect(segment.agencyName, 'KAI Commuter');
      expect(segment.intermediateStopsCount, 3);
    });

    test('fromJson should handle missing optional fields', () {
      final json = {
        'type': 'WALK',
        'durationSeconds': 300,
        'instruction': 'Walk',
        'fromName': 'A',
        'toName': 'B',
      };

      final segment = JourneySegment.fromJson(json);

      expect(segment.type, 'WALK');
      expect(segment.routeShortName, null);
      expect(segment.fromLat, null);
    });
  });
}
