import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models.dart';

class RecentSearchNotifier extends StateNotifier<List<Place>> {
  static const int maxRecent = 10;

  RecentSearchNotifier() : super([]);

  void addRecent(Place place) {
    state = [
      place,
      ...state
          .where((p) => p.id != place.id || p.name != place.name)
          .take(maxRecent - 1),
    ];
  }

  void clearRecent() {
    state = [];
  }
}

final recentSearchProvider =
    StateNotifierProvider<RecentSearchNotifier, List<Place>>((ref) {
      return RecentSearchNotifier();
    });
