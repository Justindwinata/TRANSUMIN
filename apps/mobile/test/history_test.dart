import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';

void main() {
  group('JourneyHistoryNotifier', () {
    late JourneyHistoryNotifier notifier;

    setUp(() {
      notifier = JourneyHistoryNotifier();
    });

    test('should start empty', () {
      expect(notifier.state, isEmpty);
    });

    test('should add entries at the beginning', () {
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

      expect(notifier.state.length, 2);
      expect(notifier.state[0].id, '2');
      expect(notifier.state[1].id, '1');
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

      expect(notifier.state.length, 1);
      expect(notifier.state[0].id, '2');
    });

    test('should clear all entries', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2024),
      ));
      notifier.clear();

      expect(notifier.state, isEmpty);
    });

    test('should remove entry by id', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2024),
      ));
      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'C',
        destName: 'D',
        searchedAt: DateTime(2024),
      ));

      notifier.removeById('1');

      expect(notifier.state.length, 1);
      expect(notifier.state[0].id, '2');
    });

    test('should limit entries to 20', () {
      for (var i = 0; i < 25; i++) {
        notifier.addEntry(JourneyHistoryEntry(
          id: '$i',
          originName: 'Origin $i',
          destName: 'Dest $i',
          searchedAt: DateTime(2024, 8, 19, i),
        ));
      }

      expect(notifier.state.length, JourneyHistoryNotifier.maxEntries);
      expect(notifier.state[0].id, '24');
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
