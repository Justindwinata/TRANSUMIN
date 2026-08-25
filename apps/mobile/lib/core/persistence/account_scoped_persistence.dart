import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/features/auth/auth_provider.dart';
import 'package:mobile/main.dart' as app;

class AccountScopedPersistence {
  final SharedPreferences _prefs;
  final Ref _ref;

  AccountScopedPersistence(this._prefs, this._ref);

  String _getUserId() {
    final userId = _ref.read(authProvider).userId;
    if (userId == null) {
      throw StateError('No authenticated user for account-scoped persistence');
    }
    return userId;
  }

  String buildKey(String prefix) {
    return '$prefix${_getUserId()}';
  }

  Future<void> save(String prefix, String value) async {
    await _prefs.setString(buildKey(prefix), value);
  }

  String? get(String prefix) {
    return _prefs.getString(buildKey(prefix));
  }

  Future<void> clear(String prefix) async {
    await _prefs.remove(buildKey(prefix));
  }

  Future<void> clearAllUserData() async {
    final userId = _getUserId();
    final keys = _prefs.getKeys().where((k) => k.contains(userId)).toList();
    for (final key in keys) {
      await _prefs.remove(key);
    }
  }
}

final accountScopedPersistenceProvider = Provider<AccountScopedPersistence>((ref) {
  return AccountScopedPersistence(
    ref.read(app.sharedPreferencesProvider),
    ref,
  );
});