import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/saved/data/saved_places_repository.dart';

class SavedPlacesState {
  final bool isLoading;
  final List<SavedPlace> places;
  final String? error;

  const SavedPlacesState({
    this.isLoading = false,
    required this.places,
    this.error,
  });

  SavedPlacesState copyWith({
    bool? isLoading,
    List<SavedPlace>? places,
    String? error,
  }) {
    return SavedPlacesState(
      isLoading: isLoading ?? this.isLoading,
      places: places ?? this.places,
      error: error,
    );
  }
}

class SavedPlacesNotifier extends StateNotifier<SavedPlacesState> {
  final SavedPlacesRepository repository;

  SavedPlacesNotifier(this.repository)
    : super(const SavedPlacesState(places: []));

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final places = await repository.list();
      state = state.copyWith(isLoading: false, places: places);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addPlace(
    String name,
    String address,
    double lat,
    double lon,
  ) async {
    try {
      final place = await repository.create(name, address, lat, lon);
      state = state.copyWith(places: [place, ...state.places]);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> updatePlace(
    String id,
    String? name,
    String? address,
    double? lat,
    double? lon,
  ) async {
    try {
      await repository.update(id, name, address, lat, lon);
      state = state.copyWith(
        places:
            state.places
                .map(
                  (p) =>
                      p.id == id
                          ? p.copyWith(
                            name: name,
                            address: address,
                            latitude: lat,
                            longitude: lon,
                          )
                          : p,
                )
                .toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> deletePlace(String id) async {
    try {
      await repository.delete(id);
      state = state.copyWith(
        places: state.places.where((p) => p.id != id).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  SavedPlace? placeById(String id) {
    try {
      return state.places.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }
}

final savedPlacesProvider =
    StateNotifierProvider<SavedPlacesNotifier, SavedPlacesState>((ref) {
      return SavedPlacesNotifier(ref.read(savedPlacesRepositoryProvider));
    });
