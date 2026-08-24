import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/notification_repository.dart';
import '../ui/notification_tile.dart';

class NotificationCenterScreen extends ConsumerWidget {
  const NotificationCenterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncNotifications = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pusat Notifikasi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Tandai semua sudah dibaca',
            onPressed: () async {
              await ref.read(notificationRepositoryProvider).markAllRead();
              ref.refresh(notificationsProvider);
            },
          ),
        ],
      ),
      body: asyncNotifications.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(child: Text('Tidak ada notifikasi.'));
          }
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final n = notifications[index];
              return NotificationTile(
                notification: n,
                onMarkRead:
                    n.isRead
                        ? null
                        : () async {
                          await ref
                              .read(notificationRepositoryProvider)
                              .markRead(n.id);
                          ref.refresh(notificationsProvider);
                        },
                // TODO: implement navigation based on type
                onTap: () {},
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Gagal memuat notifikasi: $e')),
      ),
    );
  }
}
