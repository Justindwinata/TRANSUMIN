import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/data/history_persistence.dart';

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

  JourneyHistoryNotifier(this._persistence)
    : super(const JourneyHistoryState(entries: []));

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final localEntries = await _persistence.load();
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
    ref.read(authProvider.notifier).saveHistoryToBackend(state.entries);

      state = state.copyWith(isSyncing: false);
    } catch (e) {
      state = state.copyWith(isSyncing: false, error: 'Gagal sinkronisasi: $e');
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
    ref.read(authProvider.notifier).saveHistoryToBackend(updated);

    ref.read(authProvider.notifier).saveHistoryToBackend(updated);

  }

  void clear() {
    state = state.copyWith(entries: const []);
    _persistence.clear();
    // backend clear handled via auth logout

  }

  void removeById(String id) {
    state = state.copyWith(
      entries: state.entries.where((e) => e.id != id).toList(),
    );
    await _persistence.save(state.entries);
    ref.read(authProvider.notifier).saveHistoryToBackend(state.entries);

        ref.read(authProvider.notifier).saveHistoryToBackend(state.entries);

  }
}

final journeyHistoryProvider =
    StateNotifierProvider<JourneyHistoryNotifier, JourneyHistoryState>((ref) {
      final persistence = ref.watch(historyPersistenceProvider).asData?.value;
      if (persistence == null) {
        return JourneyHistoryNotifier(HistoryPersistenceDummy());
      }
      return JourneyHistoryNotifier(persistence);
    });

class HistoryPersistenceDummy implements HistoryPersistence {
  @override
  List<JourneyHistoryEntry> load() => [];

  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async {}

  @override
  Future<void> clear() async {}
}
