import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/map/presentation/journey_map_model.dart';

void main() {
  group('JourneyMapModel', () {
    test('should create markers for origin and destination', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
        destination:
            JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Office'),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final model = JourneyMapBuilder.fromJourney(route);

      expect(model.markers.length, 2);
      expect(
        model.markers.firstWhere((m) => m.kind == JourneyMapMarkerKind.origin)
            .label,
        'Home',
      );
      expect(
        model.markers.firstWhere((m) => m.kind == JourneyMapMarkerKind.destination)
            .label,
        'Office',
      );
    });

    test('should add transit segment markers and lines', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
        destination:
            JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Office'),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [
          JourneySegment(
            type: 'TRANSIT',
            durationSeconds: 1500,
            instruction: 'Ride KRL',
            fromName: 'Stasiun UI',
            toName: 'Stasiun Manggarai',
            fromLat: -6.2,
            fromLon: 106.8,
            toLat: -6.3,
            toLon: 106.9,
            routeShortName: 'KRL',
            routeColor: 'BA1A1A',
          ),
        ],
      );

      final model = JourneyMapBuilder.fromJourney(route);

      final transitLine =
          model.segments.firstWhere((s) => s.kind == JourneySegmentKind.transit);
      expect(transitLine.points.length, 2);
      expect(transitLine.points[0].lat, -6.2);
      expect(transitLine.points[0].lon, 106.8);
      expect(transitLine.points[1].lat, -6.3);
      expect(transitLine.points[1].lon, 106.9);

      final boardMarkers = model.markers
          .where((m) => m.kind == JourneyMapMarkerKind.boarding)
          .toList();
      expect(boardMarkers.length, 1);
      expect(boardMarkers[0].label, 'Stasiun UI');
    });

    test('should mark geometry as incomplete if missing coordinates', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
        destination:
            JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'Office'),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [
          JourneySegment(
            type: 'WALK',
            durationSeconds: 300,
            instruction: 'Walk to station',
            fromName: 'Home',
            toName: 'Station',
          ),
        ],
      );

      final model = JourneyMapBuilder.fromJourney(route);

      expect(model.hasFullGeometry, false);
    });

    test('should calculate center from all markers', () {
      final route = RouteAlternative(
        id: '1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
        destination:
            JourneyPoint(latitude: -6.4, longitude: 107.0, name: 'Office'),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final model = JourneyMapBuilder.fromJourney(route);

      expect(model.center, isNotNull);
      expect(model.center!.lat, closeTo(-6.3, 0.01));
      expect(model.center!.lon, closeTo(106.9, 0.01));
    });

    test('should be empty when no markers or segments', () {
      final model = JourneyMapModel(
        markers: [],
        segments: [],
      );

      expect(model.isEmpty, true);
    });

    test('should not be empty when markers exist', () {
      final model = JourneyMapModel(
        markers: [
          JourneyMapMarker(
            latitude: -6.2,
            longitude: 106.8,
            label: 'Home',
            kind: JourneyMapMarkerKind.origin,
          ),
        ],
        segments: [],
      );

      expect(model.isEmpty, false);
    });
  });

  group('JourneySegmentLine', () {
    test('should mark walking segments as approximate', () {
      final line = JourneySegmentLine(
        points: [
          (lat: -6.2, lon: 106.8),
          (lat: -6.3, lon: 106.9),
        ],
        kind: JourneySegmentKind.walking,
      );

      expect(line.isApprox, true);
    });

    test('should mark transfer segments as approximate', () {
      final line = JourneySegmentLine(
        points: [
          (lat: -6.2, lon: 106.8),
          (lat: -6.2, lon: 106.8),
        ],
        kind: JourneySegmentKind.transfer,
      );

      expect(line.isApprox, true);
    });

    test('should mark transit segments as not approximate', () {
      final line = JourneySegmentLine(
        points: [
          (lat: -6.2, lon: 106.8),
          (lat: -6.3, lon: 106.9),
        ],
        kind: JourneySegmentKind.transit,
      );

      expect(line.isApprox, false);
    });
  });
}
