import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/profile/data/user_preferences_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

final userPreferencesRepositoryProvider = Provider<UserPreferencesRepository>((
  ref,
) {
  // This will be overridden in main to provide initialized SharedPreferences
  throw UnimplementedError('UserPreferencesRepository must be initialized');
});

final routePreferenceProvider =
    StateNotifierProvider<RoutePreferenceNotifier, RoutePreference>((ref) {
      return RoutePreferenceNotifier(
        ref.read(userPreferencesRepositoryProvider),
      );
    });

class RoutePreferenceNotifier extends StateNotifier<RoutePreference> {
  final UserPreferencesRepository _repo;

  RoutePreferenceNotifier(this._repo) : super(RoutePreference.fastest) {
    state = _repo.getRoutePreference();
  }

  Future<void> setPreference(RoutePreference pref) async {
    await _repo.setRoutePreference(pref);
    state = pref;
  }
}
