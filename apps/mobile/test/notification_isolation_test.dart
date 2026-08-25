import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/notifications/data/notification_repository.dart';
import 'package:mobile/features/notifications/domain/notification_model.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/core/network/network_status.dart';
import 'package:mobile/core/auth/secure_storage.dart';
import 'package:mobile/main.dart';

class _FakeSecureStorage extends SecureStorage {
  final Map<String, String> _store = {};
  @override
  Future<void> saveToken(String token) async => _store['auth_token'] = token;
  @override
  Future<String?> getToken() async => _store['auth_token'];
  @override
  Future<void> saveUserId(String userId) async => _store['user_id'] = userId;
  @override
  Future<String?> getUserId() async => _store['user_id'];
  @override
  Future<void> saveEmail(String email) async => _store['user_email'] = email;
  @override
  Future<String?> getEmail() async => _store['user_email'];
  @override
  Future<void> clearAll() async => _store.clear();
}

void main() {
  test('notification cache is isolated by userId across account switches', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    final authNotifier = AuthNotifier(_FakeSecureStorage());

    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        authProvider.overrideWith((ref) => authNotifier),
        networkStatusProvider.overrideWith((ref) {
          final notifier = NetworkStatusNotifier();
          notifier.state = const NetworkStatus(isConnected: false);
          return notifier;
        }),
      ],
    );

    final repo = container.read(notificationRepositoryProvider);

    // User A logs in
    await authNotifier.login('user-a', 'a@example.com', 'token-a');
    await repo.add(NotificationItem(
      id: 'n1',
      title: 'A notification',
      body: 'body',
      type: NotificationType.system,
      severity: NotificationSeverity.info,
      isRead: false,
      createdAt: DateTime.now(),
    ));

    // User A has 1 notification
    var items = await repo.fetchAll();
    expect(items.length, 1);
    expect(items.first.id, 'n1');

    // User A logs out
    await authNotifier.logout();

    // User B logs in
    await authNotifier.login('user-b', 'b@example.com', 'token-b');

    // User B should see NO notifications from User A
    items = await repo.fetchAll();
    expect(items, isEmpty);

    // Add a notification for User B
    await repo.add(NotificationItem(
      id: 'n2',
      title: 'B notification',
      body: 'body',
      type: NotificationType.system,
      severity: NotificationSeverity.critical,
      isRead: false,
      createdAt: DateTime.now(),
    ));

    items = await repo.fetchAll();
    expect(items.length, 1);
    expect(items.first.id, 'n2');

    // Log back in as User A - should still see A's data
    await authNotifier.logout();
    await authNotifier.login('user-a', 'a@example.com', 'token-a');

    items = await repo.fetchAll();
    expect(items.length, 1);
    expect(items.first.id, 'n1');
  });
}