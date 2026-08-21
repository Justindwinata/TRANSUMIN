import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models.dart';

class JourneyState {
  final JourneyLocation? origin;
  final JourneyLocation? destination;
  
  JourneyState({
    this.origin,
    this.destination,
  });

  JourneyState copyWith({
    JourneyLocation? origin,
    JourneyLocation? destination,
  }) {
    return JourneyState(
      origin: origin ?? this.origin,
      destination: destination ?? this.destination,
    );
  }

  bool get isComplete => origin != null && destination != null;
}

class JourneyNotifier extends StateNotifier<JourneyState> {
  JourneyNotifier() : super(JourneyState());

  void setOrigin(JourneyLocation location) {
    state = state.copyWith(origin: location);
  }

  void setDestination(JourneyLocation location) {
    state = state.copyWith(destination: location);
  }

  void swapOriginDestination() {
    state = state.copyWith(
      origin: state.destination,
      destination: state.origin,
    );
  }

  void reset() {
    state = JourneyState();
  }
}

final journeyProvider = StateNotifierProvider<JourneyNotifier, JourneyState>((ref) {
  return JourneyNotifier();
});
