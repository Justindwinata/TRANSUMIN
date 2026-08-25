import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'package:mobile/features/history/data/offline_queue.dart';
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

class _FakeHistoryPersistence implements HistoryPersistence {
  List<JourneyHistoryEntry> stored = [];
  @override
  List<JourneyHistoryEntry> load() => stored;
  @override
  Future<void> save(List<JourneyHistoryEntry> entries) async {
    stored = List<JourneyHistoryEntry>.from(entries);
  }
  @override
  Future<void> clear() async {
    stored = [];
  }
}

class _FakeOfflineQueue implements OfflineQueue {
  @override
  List<OfflineAction> load() => [];
  @override
  Future<void> enqueue(OfflineAction action) async {}
  @override
  Future<void> remove(String id) async {}
  @override
  Future<void> clear() async {}
}

void main() {
  group('Account transitions', () {
    test('login stores credentials in secure storage', () async {
      final storage = _FakeSecureStorage();
      final notifier = AuthNotifier(storage);

      await notifier.login('user-1', 'test@example.com', 'token-123');

      expect(await storage.getToken(), 'token-123');
      expect(await storage.getUserId(), 'user-1');
      expect(await storage.getEmail(), 'test@example.com');
      expect(notifier.state.isAuthenticated, true);
    });

    test('logout clears secure storage and auth state', () async {
      final storage = _FakeSecureStorage();
      final notifier = AuthNotifier(storage);

      await notifier.login('user-1', 'test@example.com', 'token-123');
      await notifier.logout();

      expect(await storage.getToken(), null);
      expect(await storage.getUserId(), null);
      expect(await storage.getEmail(), null);
      expect(notifier.state.isAuthenticated, false);
    });

    test('user A logout then user B login keeps histories separate', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      final histPersistA = _FakeHistoryPersistence();
      final histPersistB = _FakeHistoryPersistence();

      var notifierA = JourneyHistoryNotifier(
        histPersistA,
        _FakeOfflineQueue(),
        ref: ProviderContainer(),
      );

      notifierA.addEntry(JourneyHistoryEntry(
        id: 'a1',
        originName: 'User A Origin',
        destName: 'User A Dest',
        searchedAt: DateTime.now(),
      ));

      expect(histPersistA.stored.length, 1);

      var notifierB = JourneyHistoryNotifier(
        histPersistB,
        _FakeOfflineQueue(),
        ref: ProviderContainer(),
      );

      expect(histPersistB.stored.length, 0);

      notifierB.addEntry(JourneyHistoryEntry(
        id: 'b1',
        originName: 'User B Origin',
        destName: 'User B Dest',
        searchedAt: DateTime.now(),
      ));

      expect(histPersistA.stored.length, 1);
      expect(histPersistB.stored.length, 1);
      expect(histPersistA.stored.first.originName, 'User A Origin');
      expect(histPersistB.stored.first.originName, 'User B Origin');
    });

    test('account switch does not cross-pollinate state', () async {
      final authA = AuthNotifier(_FakeSecureStorage());
      final authB = AuthNotifier(_FakeSecureStorage());

      await authA.login('user-a', 'a@example.com', 'token-a');
      expect(authA.state.userId, 'user-a');
      expect(authB.state.userId, null);

      await authB.login('user-b', 'b@example.com', 'token-b');
      expect(authA.state.userId, 'user-a');
      expect(authB.state.userId, 'user-b');

      await authA.logout();
      expect(authA.state.isAuthenticated, false);
      expect(authB.state.isAuthenticated, true);
    });
  });
}
