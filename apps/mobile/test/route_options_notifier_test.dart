import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/state/route_options_notifier.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/data/routing_repository.dart';

class MockRoutingRepository implements RoutingRepository {
  List<RouteAlternative>? mockResult;
  Exception? mockError;
  Duration delay;

  MockRoutingRepository({this.mockResult, this.mockError, this.delay = Duration.zero});

  @override
  Future<List<RouteAlternative>> planJourney(JourneyRequest request) async {
    await Future.delayed(delay);
    if (mockError != null) throw mockError!;
    return mockResult ?? [];
  }
}

void main() {
  group('RouteOptionsNotifier', () {
    test('initial state should be idle', () {
      final repo = MockRoutingRepository();
      final notifier = RouteOptionsNotifier(repo);

      expect(notifier.state.status, RoutingStatus.idle);
      expect(notifier.state.routes, isEmpty);
    });

    test('searchRoutes should transition to loading then success', () async {
      final mockRoute = RouteAlternative(
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
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final repo = MockRoutingRepository(mockResult: [mockRoute]);
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      final future = notifier.searchRoutes(request);

      expect(notifier.state.status, RoutingStatus.loading);

      await future;

      expect(notifier.state.status, RoutingStatus.success);
      expect(notifier.state.routes.length, 1);
      expect(notifier.state.routes[0].id, '1');
    });

    test('searchRoutes should transition to noRoute when empty', () async {
      final repo = MockRoutingRepository(mockResult: []);
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);

      expect(notifier.state.status, RoutingStatus.noRoute);
      expect(notifier.state.routes, isEmpty);
    });

    test('searchRoutes should transition to error on exception', () async {
      final repo = MockRoutingRepository(mockError: Exception('Network error'));
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);

      expect(notifier.state.status, RoutingStatus.error);
      expect(notifier.state.failure, isNotNull);
      expect(notifier.state.failure!.message, contains('Network error'));
    });

    test('searchRoutes should detect network errors', () async {
      final repo = MockRoutingRepository(mockError: Exception('Connection timeout'));
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);

      expect(notifier.state.status, RoutingStatus.error);
      expect(notifier.state.failure!.isNetworkError, true);
    });

    test('reset should return to idle state', () async {
      final mockRoute = RouteAlternative(
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
        transferCount: 0,
        fareText: 'Rp 5000',
        segments: [],
      );

      final repo = MockRoutingRepository(mockResult: [mockRoute]);
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);
      expect(notifier.state.status, RoutingStatus.success);

      notifier.reset();

      expect(notifier.state.status, RoutingStatus.idle);
      expect(notifier.state.routes, isEmpty);
    });

    test('routeById should return route if exists', () async {
      final mockRoute = RouteAlternative(
        id: 'route-123',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
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

      final repo = MockRoutingRepository(mockResult: [mockRoute]);
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);

      final found = notifier.routeById('route-123');
      expect(found, isNotNull);
      expect(found!.id, 'route-123');
    });

    test('routeById should return null if not exists', () async {
      final repo = MockRoutingRepository(mockResult: []);
      final notifier = RouteOptionsNotifier(repo);

      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      await notifier.searchRoutes(request);

      final found = notifier.routeById('nonexistent');
      expect(found, isNull);
    });

    test('concurrent requests should not race', () async {
      final mockRoute1 = RouteAlternative(
        id: 'route-1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
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

      final mockRoute2 = RouteAlternative(
        id: 'route-2',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.4, longitude: 107.0),
        departureTime: '08:00',
        arrivalTime: '10:00',
        totalDurationSeconds: 7200,
        transitDurationSeconds: 6000,
        walkingDurationSeconds: 1200,
        walkingDistanceMeters: 1600,
        waitingDurationSeconds: 0,
        transferCount: 1,
        fareText: 'Rp 10000',
        segments: [],
      );

      final repo = MockRoutingRepository(
        mockResult: [mockRoute1],
        delay: const Duration(milliseconds: 100),
      );
      final notifier = RouteOptionsNotifier(repo);

      final request1 = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9),
      );

      notifier.searchRoutes(request1);

      await Future.delayed(const Duration(milliseconds: 10));

      repo.mockResult = [mockRoute2];
      final request2 = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8),
        destination: JourneyPoint(latitude: -6.4, longitude: 107.0),
      );

      await notifier.searchRoutes(request2);

      expect(notifier.state.routes.length, 1);
      expect(notifier.state.routes[0].id, 'route-2');
    });
  });
}
