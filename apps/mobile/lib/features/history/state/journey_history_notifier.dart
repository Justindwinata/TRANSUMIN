import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'package:mobile/features/auth/auth_provider.dart';

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
  Future<void> Function(List<JourneyHistoryEntry>)? _syncBackend;

  JourneyHistoryNotifier(
    this._persistence, {
    Future<void> Function(List<JourneyHistoryEntry>)? syncBackend,
  }) : super(const JourneyHistoryState(entries: [])) {
    _syncBackend = syncBackend ?? _defaultSync;
  }

  static Future<void> _defaultSync(List<JourneyHistoryEntry> entries) async {}

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
      await _syncBackend!(state.entries);
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
    _syncBackend!(updated);
  }

  void clear() {
    state = state.copyWith(entries: const []);
    _persistence.clear();
  }

  Future<void> removeById(String id) async {
    state = state.copyWith(
      entries: state.entries.where((e) => e.id != id).toList(),
    );
    await _persistence.save(state.entries);
    await _syncBackend!(state.entries);
  }
}

final journeyHistoryProvider =
    StateNotifierProvider<JourneyHistoryNotifier, JourneyHistoryState>((ref) {
      final persistence = ref.watch(historyPersistenceProvider).asData?.value;
      Future<void> Function(List<JourneyHistoryEntry>) syncBackend = (
        entries,
      ) async {
        await ref.read(authProvider.notifier).saveHistoryToBackend(entries);
      };
      if (persistence == null) {
        return JourneyHistoryNotifier(
          HistoryPersistenceDummy(),
          syncBackend: syncBackend,
        );
      }
      return JourneyHistoryNotifier(persistence, syncBackend: syncBackend);
    });

class HistoryPersistenceDummy implements HistoryPersistence {
  @override
  List<JourneyHistoryEntry> load() => [];

  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async {}

  @override
  Future<void> clear() async {}
}
