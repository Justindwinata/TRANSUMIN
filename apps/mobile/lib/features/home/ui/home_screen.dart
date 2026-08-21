import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/location/ui/search_screen.dart';
import '../features/location/state/journey_notifier.dart';
import '../shared/widgets/location_input.dart';

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
              onSelected: (loc) => ref.read(journeyProvider.notifier).setOrigin(loc),
            ),
            const SizedBox(height: 16),
            LocationInputWidget(
              hint: journey.destination?.name ?? 'Mau ke mana?',
              onSelected: (loc) => ref.read(journeyProvider.notifier).setDestination(loc),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: journey.isComplete ? () {} : null,
              child: const Text('Cari Rute'),
            ),
          ],
        ),
      ),
    );
  }
}
