import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/notification_model.dart';

class NotificationRepository {
  // In‑memory store for simplicity. Replace with backend API later.
  final List<NotificationItem> _store = [];

  Future<List<NotificationItem>> fetchAll() async {
    // Simulate network latency
    await Future.delayed(const Duration(milliseconds: 200));
    return List<NotificationItem>.from(_store);
  }

  Future<void> add(NotificationItem item) async {
    _store.add(item);
  }

  Future<void> markRead(String id) async {
    final idx = _store.indexWhere((n) => n.id == id);
    if (idx != -1) {
      final n = _store[idx];
      _store[idx] = NotificationItem(
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        severity: n.severity,
        createdAt: n.createdAt,
        isRead: true,
      );
    }
  }

  Future<void> markAllRead() async {
    for (var i = 0; i < _store.length; i++) {
      final n = _store[i];
      _store[i] = NotificationItem(
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        severity: n.severity,
        createdAt: n.createdAt,
        isRead: true,
      );
    }
  }
}

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) => NotificationRepository());

final notificationsProvider = FutureProvider<List<NotificationItem>>((ref) async {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.fetchAll();
});
