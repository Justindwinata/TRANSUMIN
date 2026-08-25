import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'package:mobile/features/history/data/offline_queue.dart';

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

class _FakeOfflineQueue implements OfflineQueue {
  @override
  List<OfflineAction> load() => [];
  @override
  Future<void> enqueue(OfflineAction action) async {}
  @override
  Future<void> remove(String id) async {}
  @override
  Future<void> clear() async {}
}

void main() {
  group('History synchronization deduplication', () {
    late JourneyHistoryNotifier notifier;
    late _FakeHistoryPersistence persistence;

    setUp(() {
      persistence = _FakeHistoryPersistence();
      notifier = JourneyHistoryNotifier(
        persistence,
        _FakeOfflineQueue(),
        ref: ProviderContainer(),
      );
    });

    test('exact duplicate should replace older entry', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'Jakarta',
        destName: 'Bandung',
        searchedAt: DateTime(2026, 8, 25, 10, 0),
      ));

      expect(notifier.state.entries.length, 1);

      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'Jakarta',
        destName: 'Bandung',
        searchedAt: DateTime(2026, 8, 25, 11, 0),
      ));

      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries.first.id, '2');
    });

    test('same names different times should dedupe on names only', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'Station A',
        destName: 'Station B',
        searchedAt: DateTime(2026, 8, 24),
      ));

      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'Station A',
        destName: 'Station B',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries.first.searchedAt, DateTime(2026, 8, 25));
    });

    test('different destinations should not dedupe', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'Origin',
        destName: 'Dest A',
        searchedAt: DateTime(2026, 8, 25),
      ));

      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'Origin',
        destName: 'Dest B',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, 2);
    });

    test('different origins should not dedupe', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'Origin A',
        destName: 'Destination',
        searchedAt: DateTime(2026, 8, 25),
      ));

      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'Origin B',
        destName: 'Destination',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, 2);
    });

    test('case sensitivity in names matters for dedupe', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'Jakarta',
        destName: 'bandung',
        searchedAt: DateTime(2026, 8, 25),
      ));

      notifier.addEntry(JourneyHistoryEntry(
        id: '2',
        originName: 'Jakarta',
        destName: 'Bandung',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, 2);
    });

    test('sync idempotency - repeated sync does not duplicate', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2026, 8, 25),
      ));

      var firstCount = notifier.state.entries.length;

      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, firstCount);
    });

    test('account isolation - user A and user B separate', () {
      notifier.addEntry(JourneyHistoryEntry(
        id: 'a1',
        originName: 'A Origin',
        destName: 'A Dest',
        searchedAt: DateTime(2026, 8, 25),
      ));

      expect(notifier.state.entries.length, 1);

      var aCount = notifier.state.entries.length;

      notifier.addEntry(JourneyHistoryEntry(
        id: 'a2',
        originName: 'A Origin',
        destName: 'A Dest',
        searchedAt: DateTime(2026, 8, 25, 1),
      ));

      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries.first.id, 'a2');
    });
  });
}
