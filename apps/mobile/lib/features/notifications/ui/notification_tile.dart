import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/notification_model.dart';

class NotificationTile extends StatelessWidget {
  final NotificationItem notification;
  final VoidCallback? onTap;
  final VoidCallback? onMarkRead;

  const NotificationTile({
    Key? key,
    required this.notification,
    this.onTap,
    this.onMarkRead,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bg =
        notification.isRead ? Colors.grey.shade100 : Colors.yellow.shade50;
    return ListTile(
      tileColor: bg,
      title: Text(
        notification.title,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text(notification.body),
      trailing:
          notification.isRead
              ? null
              : IconButton(
                icon: const Icon(Icons.check),
                onPressed: onMarkRead,
              ),
      onTap: onTap,
    );
  }
}
