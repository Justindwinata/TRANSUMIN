import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:mobile/features/routing/presentation/route_options_helper.dart';
import 'package:mobile/features/routing/domain/models.dart';

void main() {
  group('RouteOptionsHelper', () {
    group('formatDuration', () {
      test('should format minutes only', () {
        expect(RouteOptionsHelper.formatDuration(1800), '30 mnt');
        expect(RouteOptionsHelper.formatDuration(600), '10 mnt');
        expect(RouteOptionsHelper.formatDuration(60), '1 mnt');
      });

      test('should format hours and minutes', () {
        expect(RouteOptionsHelper.formatDuration(3660), '1 jam 1 mnt');
        expect(RouteOptionsHelper.formatDuration(5400), '1 jam 30 mnt');
        expect(RouteOptionsHelper.formatDuration(7200), '2 jam');
      });

      test('should handle zero and negative', () {
        expect(RouteOptionsHelper.formatDuration(0), '0 mnt');
        expect(RouteOptionsHelper.formatDuration(-100), '0 mnt');
      });
    });

    group('formatDistance', () {
      test('should format meters', () {
        expect(RouteOptionsHelper.formatDistance(500), '500 m');
        expect(RouteOptionsHelper.formatDistance(999), '999 m');
      });

      test('should format kilometers', () {
        expect(RouteOptionsHelper.formatDistance(1000), '1.0 km');
        expect(RouteOptionsHelper.formatDistance(1500), '1.5 km');
        expect(RouteOptionsHelper.formatDistance(2350), '2.4 km');
      });
    });

    group('formatTime', () {
      test('should format normal GTFS time', () {
        expect(RouteOptionsHelper.formatTime('08:30:00'), '08:30');
        expect(RouteOptionsHelper.formatTime('14:05:00'), '14:05');
      });

      test('should handle times after midnight', () {
        expect(RouteOptionsHelper.formatTime('25:30:00'), '01:30');
        expect(RouteOptionsHelper.formatTime('26:15:00'), '02:15');
      });

      test('should handle malformed time', () {
        expect(RouteOptionsHelper.formatTime('invalid'), 'invalid');
      });
    });

    group('getRouteColor', () {
      test('should parse valid hex colors', () {
        final color = RouteOptionsHelper.getRouteColor('0053DB');
        expect(color, const Color(0xFF0053DB));
      });

      test('should return default for null color', () {
        final color = RouteOptionsHelper.getRouteColor(null);
        expect(color, const Color(0xFF2563EB));
      });

      test('should return default for invalid color', () {
        final color = RouteOptionsHelper.getRouteColor('invalid');
        expect(color, const Color(0xFF2563EB));
      });
    });

    group('getTransferLabel', () {
      test('should return Langsung for zero transfers', () {
        expect(RouteOptionsHelper.getTransferLabel(0), 'Langsung');
      });

      test('should return singular for one transfer', () {
        expect(RouteOptionsHelper.getTransferLabel(1), '1 transit');
      });

      test('should return plural for multiple transfers', () {
        expect(RouteOptionsHelper.getTransferLabel(2), '2 transit');
        expect(RouteOptionsHelper.getTransferLabel(5), '5 transit');
      });
    });

    group('getRankingBadgeLabel', () {
      test('should map English badges to Indonesian', () {
        expect(RouteOptionsHelper.getRankingBadgeLabel('fastest'), 'Tercepat');
        expect(RouteOptionsHelper.getRankingBadgeLabel('fewestTransfers'), 'Minim Transit');
        expect(RouteOptionsHelper.getRankingBadgeLabel('leastWalking'), 'Minim Jalan');
        expect(RouteOptionsHelper.getRankingBadgeLabel('simplest'), 'Paling Sederhana');
      });

      test('should return original if not in map', () {
        expect(RouteOptionsHelper.getRankingBadgeLabel('Custom'), 'Custom');
      });

      test('should return empty for null', () {
        expect(RouteOptionsHelper.getRankingBadgeLabel(null), '');
      });
    });

    group('sortByPreference', () {
      final routes = [
        RouteAlternative(
          id: '1',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '08:00',
          arrivalTime: '09:00',
          totalDurationSeconds: 3600,
          transitDurationSeconds: 3000,
          walkingDurationSeconds: 600,
          walkingDistanceMeters: 800,
          waitingDurationSeconds: 0,
          transferCount: 2,
          fareText: '',
          segments: [
            JourneySegment(type: 'WALK', durationSeconds: 600, instruction: '', fromName: '', toName: ''),
            JourneySegment(type: 'TRANSIT', durationSeconds: 3000, instruction: '', fromName: '', toName: ''),
          ],
        ),
        RouteAlternative(
          id: '2',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '08:00',
          arrivalTime: '08:30',
          totalDurationSeconds: 1800,
          transitDurationSeconds: 1500,
          walkingDurationSeconds: 300,
          walkingDistanceMeters: 400,
          waitingDurationSeconds: 0,
          transferCount: 0,
          fareText: '',
          segments: [
            JourneySegment(type: 'WALK', durationSeconds: 300, instruction: '', fromName: '', toName: ''),
            JourneySegment(type: 'TRANSIT', durationSeconds: 1500, instruction: '', fromName: '', toName: ''),
          ],
        ),
      ];

      test('should sort by fastest', () {
        final sorted = RouteOptionsHelper.sortByPreference(routes, 'fastest');
        expect(sorted[0].totalDurationSeconds, 1800);
        expect(sorted[1].totalDurationSeconds, 3600);
      });

      test('should sort by fewest transfers', () {
        final sorted = RouteOptionsHelper.sortByPreference(routes, 'fewestTransfers');
        expect(sorted[0].transferCount, 0);
        expect(sorted[1].transferCount, 2);
      });

      test('should sort by least walking', () {
        final sorted = RouteOptionsHelper.sortByPreference(routes, 'leastWalking');
        expect(sorted[0].walkingDistanceMeters, 400);
        expect(sorted[1].walkingDistanceMeters, 800);
      });
    });

    group('isValidRoute', () {
      test('should return true for valid route', () {
        final route = RouteAlternative(
          id: '1',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '08:00',
          arrivalTime: '09:00',
          totalDurationSeconds: 3600,
          transitDurationSeconds: 3000,
          walkingDurationSeconds: 600,
          walkingDistanceMeters: 800,
          waitingDurationSeconds: 0,
          transferCount: 0,
          fareText: '',
          segments: [
            JourneySegment(type: 'WALK', durationSeconds: 600, instruction: '', fromName: '', toName: ''),
          ],
        );
        expect(RouteOptionsHelper.isValidRoute(route), true);
      });

      test('should return false for empty segments', () {
        final route = RouteAlternative(
          id: '1',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '08:00',
          arrivalTime: '09:00',
          totalDurationSeconds: 3600,
          transitDurationSeconds: 3000,
          walkingDurationSeconds: 600,
          walkingDistanceMeters: 800,
          waitingDurationSeconds: 0,
          transferCount: 0,
          fareText: '',
          segments: [],
        );
        expect(RouteOptionsHelper.isValidRoute(route), false);
      });

      test('should return false for zero duration', () {
        final route = RouteAlternative(
          id: '1',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '08:00',
          arrivalTime: '09:00',
          totalDurationSeconds: 0,
          transitDurationSeconds: 0,
          walkingDurationSeconds: 0,
          walkingDistanceMeters: 0,
          waitingDurationSeconds: 0,
          transferCount: 0,
          fareText: '',
          segments: [
            JourneySegment(type: 'WALK', durationSeconds: 600, instruction: '', fromName: '', toName: ''),
          ],
        );
        expect(RouteOptionsHelper.isValidRoute(route), false);
      });

      test('should return false for empty times', () {
        final route = RouteAlternative(
          id: '1',
          origin: JourneyPoint(latitude: 0, longitude: 0),
          destination: JourneyPoint(latitude: 0, longitude: 0),
          departureTime: '',
          arrivalTime: '',
          totalDurationSeconds: 3600,
          transitDurationSeconds: 3000,
          walkingDurationSeconds: 600,
          walkingDistanceMeters: 800,
          waitingDurationSeconds: 0,
          transferCount: 0,
          fareText: '',
          segments: [
            JourneySegment(type: 'WALK', durationSeconds: 600, instruction: '', fromName: '', toName: ''),
          ],
        );
        expect(RouteOptionsHelper.isValidRoute(route), false);
      });
    });
  });
}
