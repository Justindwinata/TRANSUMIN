import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/routing/ui/route_options_screen.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/state/route_options_notifier.dart';

class MockRoutingRepository {
  List<RouteAlternative>? mockResult;
  Exception? mockError;
  Duration delay;

  MockRoutingRepository({this.mockResult, this.mockError, this.delay = Duration.zero});

  Future<List<RouteAlternative>> planJourney(JourneyRequest request) async {
    await Future.delayed(delay);
    if (mockError != null) throw mockError!;
    return mockResult ?? [];
  }
}

void main() {
  group('RouteOptionsScreen widget tests', () {
    testWidgets('should show loading state', (tester) async {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: RouteOptionsScreen(request: request),
          ),
        ),
      );

      expect(find.text('Mencari halte dan stasiun terdekat...'), findsOneWidget);
    });

    testWidgets('should show route list on success', (tester) async {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
      );

      final route = RouteAlternative(
        id: 'route-1',
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
        departureTime: '08:00',
        arrivalTime: '09:00',
        totalDurationSeconds: 3600,
        transitDurationSeconds: 3000,
        walkingDurationSeconds: 600,
        walkingDistanceMeters: 800,
        waitingDurationSeconds: 0,
        transferCount: 0,
        fareText: 'Rp 5000',
        badge: 'Tercepat',
        segments: [],
      );

      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(routeOptionsProvider.notifier).state =
          RouteOptionsState.success([route], 'req-1');

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: RouteOptionsScreen(request: request),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('1 jam'), findsOneWidget);
      expect(find.text('Tercepat'), findsOneWidget);
      expect(find.text('Rp 5000'), findsOneWidget);
    });

    testWidgets('should show empty state when no routes', (tester) async {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
      );

      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(routeOptionsProvider.notifier).state =
          RouteOptionsState.noRoute('req-1');

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: RouteOptionsScreen(request: request),
          ),
        ),
      );

      expect(find.text('Belum menemukan rute yang sesuai'), findsOneWidget);
    });

    testWidgets('should show error state', (tester) async {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
      );

      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(routeOptionsProvider.notifier).state =
          RouteOptionsState.error(
        RoutingFailure(message: 'Test error', isNetworkError: false),
        'req-1',
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: RouteOptionsScreen(request: request),
          ),
        ),
      );

      expect(find.text('Terjadi Masalah'), findsOneWidget);
      expect(find.text('Test error'), findsOneWidget);
    });

    testWidgets('should show error state for network errors', (tester) async {
      final request = JourneyRequest(
        origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'A'),
        destination: JourneyPoint(latitude: -6.3, longitude: 106.9, name: 'B'),
      );

      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(routeOptionsProvider.notifier).state =
          RouteOptionsState.error(
        RoutingFailure(message: 'Socket exception', isNetworkError: true),
        'req-1',
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: RouteOptionsScreen(request: request),
          ),
        ),
      );

      expect(find.text('Tidak Ada Koneksi'), findsOneWidget);
      expect(find.text('Periksa koneksi internet Anda dan coba lagi.'), findsOneWidget);
    });
  });
}