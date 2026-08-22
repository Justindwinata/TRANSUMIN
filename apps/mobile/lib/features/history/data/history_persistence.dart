import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HistoryPersistence {
  static const String _key = 'journey_history';
  final SharedPreferences _prefs;

  HistoryPersistence(this._prefs);

  List<JourneyHistoryEntry> load() {
    final raw = _prefs.getString(_key);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      return list.map((j) => JourneyHistoryEntry.fromJson(j)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> save(List<JourneyHistoryEntry> entries) async {
    final raw = jsonEncode(entries.map((e) => e.toJson()).toList());
    await _prefs.setString(_key, raw);
  }

  Future<void> clear() async {
    await _prefs.remove(_key);
  }
}

final historyPersistenceProvider = FutureProvider<HistoryPersistence>((
  ref,
) async {
  final prefs = await SharedPreferences.getInstance();
  return HistoryPersistence(prefs);
});
