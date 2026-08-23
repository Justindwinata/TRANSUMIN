import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/history/data/history_persistence.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/core/auth/secure_storage.dart';

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
  group('Auth lifecycle integration', () {
    test('login should store credentials in secure storage', () async {
      final storage = _FakeSecureStorage();
      final notifier = AuthNotifier(storage);

      await notifier.login('user-1', 'test@example.com', 'token-123');

      expect(await storage.getToken(), 'token-123');
      expect(await storage.getUserId(), 'user-1');
      expect(await storage.getEmail(), 'test@example.com');
      expect(notifier.state.isAuthenticated, true);
    });

    test('logout should clear secure storage and auth state', () async {
      final storage = _FakeSecureStorage();
      final notifier = AuthNotifier(storage);

      await notifier.login('user-1', 'test@example.com', 'token-123');
      await notifier.logout();

      expect(await storage.getToken(), isNull);
      expect(await storage.getUserId(), isNull);
      expect(await storage.getEmail(), isNull);
      expect(notifier.state.isAuthenticated, false);
      expect(notifier.state.accessToken, isNull);
    });

    test('initialize should restore session from secure storage', () async {
      final storage = _FakeSecureStorage();
      await storage.saveToken('token-xyz');
      await storage.saveUserId('user-2');
      await storage.saveEmail('restored@example.com');

      final notifier = AuthNotifier(storage);
      await notifier.initialize();

      expect(notifier.state.isAuthenticated, true);
      expect(notifier.state.userId, 'user-2');
      expect(notifier.state.email, 'restored@example.com');
      expect(notifier.state.accessToken, 'token-xyz');
    });

    test('initialize should set unauthenticated when no token stored', () async {
      final storage = _FakeSecureStorage();
      final notifier = AuthNotifier(storage);
      await notifier.initialize();

      expect(notifier.state.isAuthenticated, false);
      expect(notifier.state.isLoading, false);
    });

    test('initialize should set unauthenticated if storage throws', () async {
      final storage = _BrokenSecureStorage();
      final notifier = AuthNotifier(storage);
      await notifier.initialize();

      expect(notifier.state.isAuthenticated, false);
      expect(notifier.state.isLoading, false);
    });
  });

  group('History persistence lifecycle', () {
    test('should persist entries to storage', () {
      final persistence = _FakeHistoryPersistence();
      final notifier = JourneyHistoryNotifier(persistence);

      notifier.addEntry(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2024, 1, 1),
      ));

      expect(persistence.stored.length, 1);
      expect(persistence.stored[0].id, '1');
    });

    test('should load entries from storage on creation', () async {
      final persistence = _FakeHistoryPersistence();
      persistence.stored.add(JourneyHistoryEntry(
        id: 'loaded-1',
        originName: 'Loaded',
        destName: 'Place',
        searchedAt: DateTime(2024, 1, 1),
      ));

      final notifier = JourneyHistoryNotifier(persistence);
      await notifier.load();
      expect(notifier.state.entries.length, 1);
      expect(notifier.state.entries[0].id, 'loaded-1');
    });

    test('should clear storage when clear() called', () {
      final persistence = _FakeHistoryPersistence();
      persistence.stored.add(JourneyHistoryEntry(
        id: '1',
        originName: 'A',
        destName: 'B',
        searchedAt: DateTime(2024),
      ));

      final notifier = JourneyHistoryNotifier(persistence);
      notifier.clear();

      expect(persistence.stored, isEmpty);
      expect(notifier.state.entries, isEmpty);
    });
  });
}

class _BrokenSecureStorage extends SecureStorage {
  @override
  Future<String?> getToken() async => throw Exception('storage broken');
  @override
  Future<String?> getUserId() async => throw Exception('storage broken');
  @override
  Future<String?> getEmail() async => throw Exception('storage broken');
}
