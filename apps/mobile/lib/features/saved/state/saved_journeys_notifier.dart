import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'saved_journeys_repository.dart';

class SavedJourneysState {
  final bool isLoading;
  final List<SavedJourney> journeys;
  final String? error;

  const SavedJourneysState({
    this.isLoading = false,
    required this.journeys,
    this.error,
  });

  SavedJourneysState copyWith({
    bool? isLoading,
    List<SavedJourney>? journeys,
    String? error,
  }) {
    return SavedJourneysState(
      isLoading: isLoading ?? this.isLoading,
      journeys: journeys ?? this.journeys,
      error: error,
    );
  }
}

class SavedJourneysNotifier extends StateNotifier<SavedJourneysState> {
  final SavedJourneysRepository repository;

  SavedJourneysNotifier(this.repository)
      : super(const SavedJourneysState(journeys: []));

  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    try {
      final journeys = await repository.list();
      state = state.copyWith(isLoading: false, journeys: journeys);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addJourney({
    required String originName,
    required String destName,
    required String payloadJson,
    String? label,
  }) async {
    try {
      final journey = await repository.create(
        originName: originName,
        destName: destName,
        payloadJson: payloadJson,
        label: label,
      );
      state = state.copyWith(journeys: [journey, ...state.journeys]);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> deleteJourney(String id) async {
    try {
      await repository.delete(id);
      state = state.copyWith(
        journeys: state.journeys.where((j) => j.id != id).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  SavedJourney? journeyById(String id) {
    try {
      return state.journeys.firstWhere((j) => j.id == id);
    } catch (_) {
      return null;
    }
  }
}

final savedJourneysProvider =
    StateNotifierProvider<SavedJourneysNotifier, SavedJourneysState>((ref) {
  return SavedJourneysNotifier(ref.read(savedJourneysRepositoryProvider));
});
