import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/auth/secure_storage.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';

class AuthState {
  final bool isAuthenticated;
  final String? userId;
  final String? email;
  final String? accessToken;
  final bool isLoading;

  AuthState({
    this.isAuthenticated = false,
    this.userId,
    this.email,
    this.accessToken,
    this.isLoading = false,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? userId,
    String? email,
    String? accessToken,
    bool? isLoading,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      accessToken: accessToken ?? this.accessToken,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SecureStorage _secureStorage;

  AuthNotifier(this._secureStorage) : super(AuthState());

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await _secureStorage.getToken();
      final userId = await _secureStorage.getUserId();
      final email = await _secureStorage.getEmail();

      if (token != null && userId != null && email != null) {
        state = AuthState(
          isAuthenticated: true,
          userId: userId,
          email: email,
          accessToken: token,
        );
      } else {
        state = AuthState();
      }
    } catch (e) {
      state = AuthState();
    }
  }

  Future<void> login(String userId, String email, String accessToken) async {
    await _secureStorage.saveToken(accessToken);
    await _secureStorage.saveUserId(userId);
    await _secureStorage.saveEmail(email);

    state = AuthState(
      isAuthenticated: true,
      userId: userId,
      email: email,
      accessToken: accessToken,
    );
  }

  Future<void> saveHistoryToBackend(List<JourneyHistoryEntry> entries) async {
    final userId = state.userId;
    if (userId == null) return;
    // Backend sync stub: real implementation will call POST /history/sync.
  }

  Future<void> logout() async {
    await _secureStorage.clearAll();
    state = AuthState();
  }
}

final secureStorageProvider = Provider<SecureStorage>((ref) {
  return SecureStorage();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(secureStorageProvider));
});
