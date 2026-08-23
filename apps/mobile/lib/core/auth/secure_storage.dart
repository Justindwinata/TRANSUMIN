import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final FlutterSecureStorage _storage;

  SecureStorage() : _storage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }

  Future<void> saveUserId(String userId) async {
    await _storage.write(key: 'user_id', value: userId);
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: 'user_id');
  }

  Future<void> deleteUserId() async {
    await _storage.delete(key: 'user_id');
  }

  Future<void> saveEmail(String email) async {
    await _storage.write(key: 'user_email', value: email);
  }

  Future<String?> getEmail() async {
    return await _storage.read(key: 'user_email');
  }

  Future<void> deleteEmail() async {
    await _storage.delete(key: 'user_email');
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
