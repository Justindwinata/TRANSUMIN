import 'package:flutter_riverpod/flutter_riverpod.dart';

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

class JourneyHistoryNotifier extends StateNotifier<List<JourneyHistoryEntry>> {
  static const int maxEntries = 20;

  JourneyHistoryNotifier() : super(const []);

  void addEntry(JourneyHistoryEntry entry) {
    final filtered = state.where((e) => !(e.originName == entry.originName && e.destName == entry.destName)).toList();
    state = [entry, ...filtered].take(maxEntries).toList();
  }

  void clear() {
    state = const [];
  }

  void removeById(String id) {
    state = state.where((e) => e.id != id).toList();
  }
}

final journeyHistoryProvider =
    StateNotifierProvider<JourneyHistoryNotifier, List<JourneyHistoryEntry>>((ref) {
  return JourneyHistoryNotifier();
});
