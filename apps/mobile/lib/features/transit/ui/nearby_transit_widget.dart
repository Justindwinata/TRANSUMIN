import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models.dart';
import '../state/nearby_transit_notifier.dart';

class NearbyTransitWidget extends ConsumerWidget {
  final double lat;
  final double lon;

  const NearbyTransitWidget({Key? key, required this.lat, required this.lon}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(nearbyTransitProvider);

    return Column(
      children: [
        if (state.isLoading) const CircularProgressIndicator(),
        if (state.error != null) Text('Error: ${state.error}'),
        if (state.result != null)
          ...state.result!.allStops.map((stop) => ListTile(
                title: Text(stop.name),
                subtitle: Text('Distance: ${stop.distance?.toStringAsFixed(2) ?? '-'} km'),
                leading: const Icon(Icons.directions_bus),
              )),
      ],
    );
  }
}
