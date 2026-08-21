import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/location/domain/models.dart';

class SavedPlaceNotifier extends StateNotifier<List<Place>> {
  SavedPlaceNotifier() : super([]);

  Future<void> init() async {
    // Load saved places from backend or local cache
    state = [];
  }

  void addSavedPlace(Place place) {
    state = [...state, place];
  }

  void removeSavedPlace(String id) {
    state = state.where((p) => p.id != id).toList();
  }

  void updateSavedPlace(String id, Place updated) {
    state = state.map((p) => p.id == id ? updated : p).toList();
  }
}

final savedPlaceProvider = StateNotifierProvider<SavedPlaceNotifier, List<Place>>((ref) {
  final notifier = SavedPlaceNotifier();
  notifier.init();
  return notifier;
});
