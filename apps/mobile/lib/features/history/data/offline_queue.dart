import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/main.dart' as app;

enum OfflineActionType {
  addHistory,
  removeHistory,
  clearHistory,
}

class OfflineAction {
  final String id;
  final OfflineActionType type;
  final Map<String, dynamic> payload;
  final DateTime createdAt;
  final String userId;

  const OfflineAction({
    required this.id,
    required this.type,
    required this.payload,
    required this.createdAt,
    required this.userId,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type.name,
    'payload': payload,
    'createdAt': createdAt.toIso8601String(),
    'userId': userId,
  };

  factory OfflineAction.fromJson(Map<String, dynamic> json) {
    return OfflineAction(
      id: json['id'] as String,
      type: OfflineActionType.values.byName(json['type'] as String),
      payload: json['payload'] as Map<String, dynamic>,
      createdAt: DateTime.parse(json['createdAt'] as String),
      userId: json['userId'] as String,
    );
  }
}

class OfflineQueue {
  static const String _keyPrefix = 'offline_queue:';

  final SharedPreferences _prefs;
  final String _userId;

  OfflineQueue(this._prefs, this._userId);

  String get _key => '$_keyPrefix$_userId';

  List<OfflineAction> load() {
    final raw = _prefs.getString(_key);
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      return list.map((j) => OfflineAction.fromJson(j)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _saveAll(List<OfflineAction> actions) async {
    await _prefs.setString(_key, jsonEncode(actions.map((a) => a.toJson()).toList()));
  }

  Future<void> enqueue(OfflineAction action) async {
    final current = load();
    await _saveAll([action, ...current]);
  }

  Future<void> remove(String id) async {
    final current = load();
    await _saveAll(current.where((a) => a.id != id).toList());
  }

  Future<void> clear() async {
    await _prefs.remove(_key);
  }
}

final offlineQueueProvider = Provider<OfflineQueue>((ref) {
  final prefs = ref.watch(app.sharedPreferencesProvider);
  final userId = ref.watch(authProvider).userId ?? 'anon';
  return OfflineQueue(prefs, userId);
});