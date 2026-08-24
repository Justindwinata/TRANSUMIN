import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/state/route_options_notifier.dart';
import 'package:mobile/features/saved/data/saved_journeys_repository.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'dart:convert';

class _FakeHistoryPersistence implements HistoryPersistence {
  List<JourneyHistoryEntry> stored = [];
  @override
  List<JourneyHistoryEntry> load() => stored;
  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async =>
      stored = List.from(entries);
  @override
  Future<void> clear() async => stored = [];
}

void main() {
  group('Integration flow - save and replan', () {
    late JourneyHistoryNotifier historyNotifier;
    late _FakeHistoryPersistence persistence;

    setUp(() {
      persistence = _FakeHistoryPersistence();
      final container = ProviderContainer();
    historyNotifier = JourneyHistoryNotifier(persistence, container.ref);
    });

    test(
      'search -> save history -> history persisted -> saved journey payload valid',
      () async {
        final request = JourneyRequest(
          origin: JourneyPoint(latitude: -6.2, longitude: 106.8, name: 'Home'),
          destination: JourneyPoint(
            latitude: -6.3,
            longitude: 106.9,
            name: 'Office',
          ),
        );

        final payload = jsonEncode({
          'originLat': request.origin.latitude,
          'originLon': request.origin.longitude,
          'destLat': request.destination.latitude,
          'destLon': request.destination.longitude,
        });

        historyNotifier.addEntry(
          JourneyHistoryEntry(
            id: 'search-1',
            originName: 'Home',
            destName: 'Office',
            originLat: request.origin.latitude.toString(),
            originLon: request.origin.longitude.toString(),
            destLat: request.destination.latitude.toString(),
            destLon: request.destination.longitude.toString(),
            searchedAt: DateTime.now(),
          ),
        );

        expect(historyNotifier.state.entries.length, 1);
        expect(persistence.stored.length, 1);

        final saved = SavedJourney(
          id: 'sj-1',
          userId: 'user-1',
          originName: 'Home',
          destName: 'Office',
          payloadJson: payload,
          createdAt: DateTime.now(),
        );
        final decoded = jsonDecode(saved.payloadJson) as Map<String, dynamic>;
        expect(decoded['originLat'], -6.2);
        expect(decoded['destLat'], -6.3);
      },
    );

    test('route options request can be reconstructed from saved journey', () {
      final saved = SavedJourney(
        id: 'sj-2',
        userId: 'user-1',
        originName: 'Home',
        destName: 'Office',
        payloadJson:
            '{"originLat":-6.2,"originLon":106.8,"destLat":-6.3,"destLon":106.9}',
        createdAt: DateTime.now(),
      );

      final payload = jsonDecode(saved.payloadJson) as Map<String, dynamic>;
      final request = JourneyRequest(
        origin: JourneyPoint(
          latitude: payload['originLat'] as double,
          longitude: payload['originLon'] as double,
          name: saved.originName,
        ),
        destination: JourneyPoint(
          latitude: payload['destLat'] as double,
          longitude: payload['destLon'] as double,
          name: saved.destName,
        ),
      );

      expect(request.origin.latitude, -6.2);
      expect(request.destination.latitude, -6.3);
    });
  });
}
