import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../domain/notification_model.dart';
import 'package:mobile/main.dart' as app;

class NotificationRepository {
  static const String _key = 'notifications';
  final SharedPreferences _prefs;

  NotificationRepository(this._prefs);

  Future<List<NotificationItem>> fetchAll() async {
    final raw = _prefs.getString(_key);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List;
    return list
        .map((j) => NotificationItem.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<void> _saveAll(List<NotificationItem> items) async {
    await _prefs.setString(
      _key,
      jsonEncode(items.map((i) => i.toJson()).toList()),
    );
  }

  Future<void> add(NotificationItem item) async {
    final current = await fetchAll();
    await _saveAll([item, ...current]);
  }

  Future<void> markRead(String id) async {
    final current = await fetchAll();
    final updated =
        current.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList();
    await _saveAll(updated);
  }

  Future<void> markAllRead() async {
    final current = await fetchAll();
    final updated = current.map((n) => n.copyWith(isRead: true)).toList();
    await _saveAll(updated);
  }
}

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(ref.watch(app.sharedPreferencesProvider));
});

final notificationsProvider = FutureProvider<List<NotificationItem>>((ref) {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.fetchAll();
});

final unreadNotificationCountProvider = Provider<int>((ref) {
  final async = ref.watch(notificationsProvider);
  return async.maybeWhen(
    data: (items) => items.where((n) => !n.isRead).length,
    orElse: () => 0,
  );
});
