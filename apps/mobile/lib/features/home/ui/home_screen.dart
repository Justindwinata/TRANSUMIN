import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../location/ui/search_screen.dart';
import '../../location/state/journey_notifier.dart';
import '../../shared/widgets/location_input.dart';
import '../../routing/domain/models.dart';
import '../../routing/state/route_options_notifier.dart';
import '../../routing/ui/route_options_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journey = ref.watch(journeyProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Beranda')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            LocationInputWidget(
              hint: journey.origin?.name ?? 'Dari mana?',
              onSelected:
                  (loc) => ref.read(journeyProvider.notifier).setOrigin(loc),
            ),
            const SizedBox(height: 16),
            LocationInputWidget(
              hint: journey.destination?.name ?? 'Mau ke mana?',
              onSelected:
                  (loc) =>
                      ref.read(journeyProvider.notifier).setDestination(loc),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed:
                  journey.isComplete
                      ? () async {
                        final request = JourneyRequest(
                          origin: JourneyPoint(
                            latitude: journey.origin!.latitude,
                            longitude: journey.origin!.longitude,
                            name: journey.origin!.name,
                          ),
                          destination: JourneyPoint(
                            latitude: journey.destination!.latitude,
                            longitude: journey.destination!.longitude,
                            name: journey.destination!.name,
                          ),
                        );
                        ref
                            .read(routeOptionsProvider.notifier)
                            .searchRoutes(request);
                        final result = await Navigator.push<JourneyRequest>(
                          context,
                          MaterialPageRoute(
                            builder:
                                (_) => RouteOptionsScreen(request: request),
                          ),
                        );
                        if (result != null) {
                          // Handle re-search if needed
                        }
                      }
                      : null,
              child: const Text('Cari Rute'),
            ),
          ],
        ),
      ),
    );
  }
}
