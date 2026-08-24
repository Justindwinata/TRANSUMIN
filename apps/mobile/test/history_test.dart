import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/history_persistence.dart';

class _FakeHistoryPersistence implements HistoryPersistence {
  List<JourneyHistoryEntry> stored = [];

  @override
  List<JourneyHistoryEntry> load() => stored;

  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async {
    stored = List<JourneyHistoryEntry>.from(entries);
  }

  @override
  Future<void> clear() async {
    stored = [];
  }
}

void main() {
  group('JourneyHistoryNotifier', () {
    late JourneyHistoryNotifier notifier;
    late _FakeHistoryPersistence persistence;

    setUp(() {
      persistence = _FakeHistoryPersistence();
      final container = ProviderContainer();
    notifier = JourneyHistoryNotifier(persistence, container.ref);
    });

    test('should start empty', () {
      expect(notifier.state.entries, isEmpty);
    });

    test('should add entries at beginning', () {
      final entry1 = JourneyHistoryEntry(
        id: '1',
        originName: 'Rumah',
        destName: 'Kampus',
        searchedAt: DateTime(2024, 8, 19, 8, 0),
      );
      final entry2 = JourneyHistoryEntry(
        id: '2',
        originName: 'Kampus',
        destName: 'Stasiun',
        searchedAt: DateTime(2024, 8, 19, 9, 0),
      );

      notifier.addEntry(entry1);
      notifier.addEntry(entry2);

      expect(notifier.state.entries.length, 2);
      expect(notifier.state.entries[0].id, '2');
      expect(notifier.state.entries[1].id, '1');
    });

    test('should replace duplicate entries', () {
      final entry1 = JourneyHistoryEntry(
        id: '1',
        originName: 'Rumah',
        destName: 'Kampus',
        searchedAt: DateTime(2024, 8, 19, 8, 0),
      );
      final entry2 = JourneyHistoryEntry(
        id: '2',
        originName: 'Rumah',
        destName: 'Kampus',
        searchedAt: DateTime(2024, 8, 19, 9, 0),
      );

      notifier.addEntry(entry1);
      notifier.addEntry(entry2);

      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries[0].id, '2');
    });

    test('should clear all entries', () async {
      notifier.addEntry(
        JourneyHistoryEntry(
          id: '1',
          originName: 'A',
          destName: 'B',
          searchedAt: DateTime(2024),
        ),
      );
      notifier.clear();

      expect(notifier.state.entries, isEmpty);
    });

    test('should remove entry by id', () {
      notifier.addEntry(
        JourneyHistoryEntry(
          id: '1',
          originName: 'A',
          destName: 'B',
          searchedAt: DateTime(2024),
        ),
      );
      notifier.addEntry(
        JourneyHistoryEntry(
          id: '2',
          originName: 'C',
          destName: 'D',
          searchedAt: DateTime(2024),
        ),
      );

      notifier.removeById('1');

      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries[0].id, '2');
    });

    test('should limit entries to max', () {
      for (var i = 0; i < 60; i++) {
        notifier.addEntry(
          JourneyHistoryEntry(
            id: '$i',
            originName: 'Origin $i',
            destName: 'Dest $i',
            searchedAt: DateTime(2024, 8, 19, 0, i % 60),
          ),
        );
      }

      expect(notifier.state.entries.length, JourneyHistoryNotifier.maxEntries);
      expect(notifier.state.entries.first.id, '59');
    });

    test('should serialize and deserialize correctly', () {
      final entry = JourneyHistoryEntry(
        id: 'test-1',
        originName: 'Rumah',
        destName: 'Kampus',
        originLat: '-6.2',
        originLon: '106.8',
        destLat: '-6.4',
        destLon: '107.0',
        summary: '45 menit, 1 transit',
        searchedAt: DateTime(2024, 8, 19, 8, 0),
      );

      final json = entry.toJson();
      final deserialized = JourneyHistoryEntry.fromJson(json);

      expect(deserialized.id, entry.id);
      expect(deserialized.originName, entry.originName);
      expect(deserialized.destName, entry.destName);
      expect(deserialized.originLat, entry.originLat);
      expect(deserialized.originLon, entry.originLon);
      expect(deserialized.destLat, entry.destLat);
      expect(deserialized.destLon, entry.destLon);
      expect(deserialized.summary, entry.summary);
    });
  });
}
