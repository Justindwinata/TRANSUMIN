import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/geocoding_repository.dart';
import '../domain/models.dart';

class PlaceSearchState {
  final String query;
  final bool isLoading;
  final List<Place> results;
  final String? error;
  
  PlaceSearchState({
    this.query = '',
    this.isLoading = false,
    this.results = const [],
    this.error,
  });

  PlaceSearchState copyWith({
    String? query,
    bool? isLoading,
    List<Place>? results,
    String? error,
  }) {
    return PlaceSearchState(
      query: query ?? this.query,
      isLoading: isLoading ?? this.isLoading,
      results: results ?? this.results,
      error: error,
    );
  }
}

class PlaceSearchNotifier extends StateNotifier<PlaceSearchState> {
  final GeocodingRepository _repository;
  Timer? _debounceTimer;
  
  PlaceSearchNotifier(this._repository) : super(PlaceSearchState());

  void setQuery(String query) {
    state = state.copyWith(query: query);
    _debounceTimer?.cancel();
    
    if (query.length < 2) {
      state = state.copyWith(results: [], isLoading: false, error: null);
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      _search(query);
    });
  }

  Future<void> _search(String query) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final results = await _repository.search(query);
      state = state.copyWith(isLoading: false, results: results);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString(), results: []);
    }
  }

  void clear() {
    _debounceTimer?.cancel();
    state = PlaceSearchState();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final placeSearchProvider = StateNotifierProvider<PlaceSearchNotifier, PlaceSearchState>((ref) {
  return PlaceSearchNotifier(ref.watch(geocodingRepositoryProvider));
});
