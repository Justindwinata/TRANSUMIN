import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/api/api_providers.dart';
import '../../../core/network/network_status.dart';
import '../../../features/auth/auth_provider.dart';
import '../domain/notification_model.dart';
import 'package:mobile/main.dart' as app;

class NotificationRepository {
  static const String _key = 'notifications';
  final SharedPreferences _prefs;
  final Ref _ref;

  NotificationRepository(this._prefs, this._ref);

  Future<List<NotificationItem>> fetchAll() async {
    final isConnected = _ref.read(networkStatusProvider).isConnected;
    final userId = _ref.read(authProvider).userId;

    if (isConnected && userId != null) {
      try {
        final response = await _ref.read(apiClientProvider).get(
          '/notifications',
          headers: {'Authorization': 'Bearer ${_ref.read(authProvider).accessToken}'},
        );
        final list = (response['notifications'] as List?) ?? (response['data'] as List?) ?? [];
        final items = list
            .cast<Map<String, dynamic>>()
            .map((j) => NotificationItem.fromJson(j))
            .toList();
        // Sync to local cache
        await _saveAll(items);
        return items;
      } catch (e) {
        // Fall back to local cache on error
      }
    }

    // Offline or error: return local cache
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
    final isConnected = _ref.read(networkStatusProvider).isConnected;
    final userId = _ref.read(authProvider).userId;

    // Update local cache immediately
    final current = await fetchAll();
    final updated =
        current.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList();
    await _saveAll(updated);

    // Sync to backend if online
    if (isConnected) {
      try {
        await _ref.read(apiClientProvider).post(
          '/notifications/$id/read',
          headers: {'Authorization': 'Bearer ${_ref.read(authProvider).accessToken}'},
        );
      } catch (_) {
        // Ignore backend sync errors; local cache is authoritative
      }
    }
  }

  Future<void> markAllRead() async {
    final isConnected = _ref.read(networkStatusProvider).isConnected;
    final userId = _ref.read(authProvider).userId;

    // Update local cache immediately
    final current = await fetchAll();
    final updated = current.map((n) => n.copyWith(isRead: true)).toList();
    await _saveAll(updated);

    // Sync to backend if online
    if (isConnected && userId != null) {
      try {
        await _ref.read(apiClientProvider).post(
          '/notifications/read-all',
          headers: {'Authorization': 'Bearer ${_ref.read(authProvider).accessToken}'},
        );
      } catch (_) {
        // Ignore backend sync errors
      }
    }
  }
}

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepository(ref.watch(app.sharedPreferencesProvider), ref);
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
