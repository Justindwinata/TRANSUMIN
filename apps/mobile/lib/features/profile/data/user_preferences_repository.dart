import 'package:shared_preferences/shared_preferences.dart';

enum RoutePreference { fastest, minTransfers, minWalking }

class UserPreferences {
  final RoutePreference routePreference;
  final bool notificationsEnabled;
  final String themeMode;

  const UserPreferences({
    this.routePreference = RoutePreference.fastest,
    this.notificationsEnabled = true,
    this.themeMode = 'system',
  });

  Map<String, dynamic> toJson() => {
    'routePreference': routePreference.name,
    'notificationsEnabled': notificationsEnabled,
    'themeMode': themeMode,
  };
}

class UserPreferencesRepository {
  final SharedPreferences _prefs;
  static const _keyRoutePref = 'route_preference';

  UserPreferencesRepository(this._prefs);

  RoutePreference getRoutePreference() {
    final val = _prefs.getString(_keyRoutePref);
    if (val == 'minTransfers') return RoutePreference.minTransfers;
    if (val == 'minWalking') return RoutePreference.minWalking;
    return RoutePreference.fastest;
  }

  Future<void> setRoutePreference(RoutePreference pref) async {
    await _prefs.setString(_keyRoutePref, pref.name);
  }
}
