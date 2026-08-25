import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'package:mobile/features/history/data/offline_queue.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/core/network/network_status.dart';

class JourneyHistoryEntry {
  final String id;
  final String originName;
  final String destName;
  final String? originLat;
  final String? originLon;
  final String? destLat;
  final String? destLon;
  final String? summary;
  final DateTime searchedAt;

  const JourneyHistoryEntry({
    required this.id,
    required this.originName,
    required this.destName,
    this.originLat,
    this.originLon,
    this.destLat,
    this.destLon,
    this.summary,
    required this.searchedAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'originName': originName,
    'destName': destName,
    if (originLat != null) 'originLat': originLat,
    if (originLon != null) 'originLon': originLon,
    if (destLat != null) 'destLat': destLat,
    if (destLon != null) 'destLon': destLon,
    if (summary != null) 'summary': summary,
    'searchedAt': searchedAt.toIso8601String(),
  };

  factory JourneyHistoryEntry.fromJson(Map<String, dynamic> json) {
    return JourneyHistoryEntry(
      id: json['id'] as String,
      originName: json['originName'] as String,
      destName: json['destName'] as String,
      originLat: json['originLat'] as String?,
      originLon: json['originLon'] as String?,
      destLat: json['destLat'] as String?,
      destLon: json['destLon'] as String?,
      summary: json['summary'] as String?,
      searchedAt: DateTime.parse(json['searchedAt'] as String),
    );
  }
}

class JourneyHistoryState {
  final List<JourneyHistoryEntry> entries;
  final bool isLoading;
  final String? error;
  final bool isSyncing;

  const JourneyHistoryState({
    required this.entries,
    this.isLoading = false,
    this.error,
    this.isSyncing = false,
  });

  JourneyHistoryState copyWith({
    List<JourneyHistoryEntry>? entries,
    bool? isLoading,
    String? error,
    bool? isSyncing,
  }) {
    return JourneyHistoryState(
      entries: entries ?? this.entries,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSyncing: isSyncing ?? this.isSyncing,
    );
  }
}

class JourneyHistoryNotifier extends StateNotifier<JourneyHistoryState> {
  static const int maxEntries = 50;
  final HistoryPersistence _persistence;
  final OfflineQueue _offlineQueue;
  final dynamic _ref;
  Future<void> Function(List<JourneyHistoryEntry>)? _syncBackend;

  JourneyHistoryNotifier(
    this._persistence,
    this._offlineQueue, {
    dynamic ref,
    Future<void> Function(List<JourneyHistoryEntry>)? syncBackend,
  }) : _ref = ref,
       super(const JourneyHistoryState(entries: [])) {
    _syncBackend = syncBackend ?? _defaultSync;
  }

  static Future<void> _defaultSync(List<JourneyHistoryEntry> entries) async {}

  bool get _isOnline {
    if (_ref == null) return true;
    return _ref!.read(networkStatusProvider).isConnected;
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final localEntries = _persistence.load();
      state = state.copyWith(isLoading: false, entries: localEntries);
      await _syncWithBackend();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> _syncWithBackend() async {
    state = state.copyWith(isSyncing: true);
    try {
      await _persistence.save(state.entries);
      if (_isOnline) {
        await _syncBackend!(state.entries);
      } else {
        await _queueAddAll(state.entries);
      }
      state = state.copyWith(isSyncing: false);
    } catch (e) {
      state = state.copyWith(isSyncing: false, error: 'Gagal sinkronisasi: $e');
    }
  }

  Future<void> _queueAddAll(List<JourneyHistoryEntry> entries) async {
    for (final entry in entries) {
      final userId = _ref?.read(authProvider).userId ?? 'anon';
      await _offlineQueue.enqueue(OfflineAction(
        id: entry.id,
        type: OfflineActionType.addHistory,
        payload: entry.toJson(),
        createdAt: DateTime.now(),
        userId: userId,
      ));
    }
  }

  void addEntry(JourneyHistoryEntry entry) {
    final filtered =
        state.entries
            .where(
              (e) =>
                  !(e.originName == entry.originName &&
                      e.destName == entry.destName),
            )
            .toList();
    final updated =
        [entry, ...filtered].take(JourneyHistoryNotifier.maxEntries).toList();
    state = state.copyWith(entries: updated);
    _persistence.save(updated);
    if (_isOnline) {
      _syncBackend!(updated);
    } else {
      final userId = _ref?.read(authProvider).userId ?? 'anon';
      _offlineQueue.enqueue(OfflineAction(
        id: entry.id,
        type: OfflineActionType.addHistory,
        payload: entry.toJson(),
        createdAt: DateTime.now(),
        userId: userId,
      ));
    }
  }

  void clear() {
    state = state.copyWith(entries: const []);
    _persistence.clear();
    if (_isOnline) {
      _syncBackend!([]);
    } else {
      final userId = _ref?.read(authProvider).userId ?? 'anon';
      _offlineQueue.enqueue(OfflineAction(
        id: 'clear-${DateTime.now().millisecondsSinceEpoch}',
        type: OfflineActionType.clearHistory,
        payload: {},
        createdAt: DateTime.now(),
        userId: userId,
      ));
    }
  }

  Future<void> removeById(String id) async {
    state = state.copyWith(
      entries: state.entries.where((e) => e.id != id).toList(),
    );
    await _persistence.save(state.entries);
    if (_isOnline) {
      await _syncBackend!(state.entries);
    } else {
      final userId = _ref?.read(authProvider).userId ?? 'anon';
      _offlineQueue.enqueue(OfflineAction(
        id: 'remove-$id',
        type: OfflineActionType.removeHistory,
        payload: {'id': id},
        createdAt: DateTime.now(),
        userId: userId,
      ));
    }
  }
}

final journeyHistoryProvider =
    StateNotifierProvider<JourneyHistoryNotifier, JourneyHistoryState>((ref) {
      final persistence = ref.watch(historyPersistenceProvider).asData?.value;
      final offlineQueue = ref.watch(offlineQueueProvider);
      Future<void> Function(List<JourneyHistoryEntry>) syncBackend = (
        entries,
      ) async {
        final userId = ref.read(authProvider).userId;
        if (userId == null) return;
        await ref.read(authProvider.notifier).saveHistoryToBackend(entries);
      };
      final notifier = JourneyHistoryNotifier(
        persistence ?? HistoryPersistenceDummy(),
        offlineQueue,
        ref: ref,
        syncBackend: syncBackend,
      );
      ref.listen<String?>(authProvider.select((s) => s.userId), (prev, next) {
        if (next == null) {
          notifier.clear();
        }
      });
      notifier.load();
      return notifier;
    });

class HistoryPersistenceDummy implements HistoryPersistence {
  @override
  List<JourneyHistoryEntry> load() => [];

  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async {}

  @override
  Future<void> clear() async {}
}
