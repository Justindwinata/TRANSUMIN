import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/core/auth/secure_storage.dart';
import 'package:mobile/core/persistence/account_scoped_persistence.dart';
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
  test('account scoped persistence isolates keys by userId', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    final authNotifier = AuthNotifier(_FakeSecureStorage());

    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        authProvider.overrideWith((ref) => authNotifier),
      ],
    );

    final persistence = container.read(accountScopedPersistenceProvider);

    // User A logs in
    await authNotifier.login('user-a', 'a@example.com', 'token-a');

    await persistence.save('notifications:', 'user-a-data');
    await persistence.save('history:', 'user-a-history');

    expect(persistence.get('notifications:'), 'user-a-data');
    expect(persistence.get('history:'), 'user-a-history');

    // User B logs in
    await authNotifier.logout();
    await authNotifier.login('user-b', 'b@example.com', 'token-b');

    expect(persistence.get('notifications:'), null);
    expect(persistence.get('history:'), null);

    await persistence.save('notifications:', 'user-b-data');
    await persistence.save('history:', 'user-b-history');

    expect(persistence.get('notifications:'), 'user-b-data');
    expect(persistence.get('history:'), 'user-b-history');
  });

  test('throws when no authenticated user', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    final authNotifier = AuthNotifier(_FakeSecureStorage());
    // Don't login - no user

    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        authProvider.overrideWith((ref) => authNotifier),
      ],
    );

    final persistence = container.read(accountScopedPersistenceProvider);

    expect(() => persistence.buildKey('test:'), throwsStateError);
  });
}