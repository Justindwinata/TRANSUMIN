import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models.dart';
import '../data/transit_repository.dart';

class NearbyState {
  final bool isLoading;
  final NearbyTransitResult? result;
  final String? error;

  NearbyState._({required this.isLoading, this.result, this.error});

  factory NearbyState.idle() => NearbyState._(isLoading: false);
  factory NearbyState.loading() => NearbyState._(isLoading: true);
  factory NearbyState.success(NearbyTransitResult result) =>
      NearbyState._(isLoading: false, result: result);
  factory NearbyState.error(String message) =>
      NearbyState._(isLoading: false, error: message);
}

class NearbyTransitNotifier extends StateNotifier<NearbyState> {
  final TransitRepository repository;
  NearbyTransitNotifier(this.repository) : super(NearbyState.idle());

  Future<void> fetchNearby(double lat, double lon, double radius) async {
    state = NearbyState.loading();
    try {
      final result = await repository.getNearbyTransit(lat, lon, radius);
      state = NearbyState.success(result);
    } catch (e) {
      state = NearbyState.error(e.toString());
    }
  }

  void reset() => state = NearbyState.idle();
}

final nearbyTransitProvider =
    StateNotifierProvider<NearbyTransitNotifier, NearbyState>((ref) {
      return NearbyTransitNotifier(ref.read(transitRepositoryProvider));
    });
