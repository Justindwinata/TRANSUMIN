import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';

class HistoryPersistence {
  static String _keyForUser(String userId) => 'journey_history:$userId';
  final SharedPreferences _prefs;
  final String? _userId;

  HistoryPersistence(this._prefs, {String? userId}) : _userId = userId;

  String get _key {
    final uid = _userId;
    return uid == null || uid.isEmpty ? 'journey_history:anon' : _keyForUser(uid);
  }

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

final historyPersistenceProvider = FutureProvider<HistoryPersistence>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  final userId = ref.watch(authProvider).userId;
  return HistoryPersistence(prefs, userId: userId);
});
