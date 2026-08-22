import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/location/domain/models.dart';
import 'package:mobile/features/location/ui/search_screen.dart';
import 'package:mobile/features/location/state/journey_notifier.dart';
import 'package:mobile/shared/widgets/location_input.dart';
import 'package:mobile/shared/widgets/app_button.dart';
import 'package:mobile/shared/widgets/place_picker.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/state/route_options_notifier.dart';
import 'package:mobile/features/routing/ui/route_options_screen.dart';
import 'package:mobile/features/saved/ui/saved_places_screen.dart';
import 'package:mobile/features/history/ui/journey_history_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journey = ref.watch(journeyProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('TRANSUM-IN')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            LocationInputWidget(
              hint: journey.origin?.name ?? 'Dari mana?',
              onTap: () => _pickOrigin(context, ref),
            ),
            const SizedBox(height: 16),
            LocationInputWidget(
              hint: journey.destination?.name ?? 'Mau ke mana?',
              onTap: () => _pickDestination(context, ref),
            ),
            const SizedBox(height: 24),
            AppButton(
              label: 'Cari Rute',
              isLoading: false,
              onPressed: journey.isComplete
                  ? () => _searchRoute(context, ref, journey)
                  : null,
            ),
            const SizedBox(height: 16),
            const Divider(),
            ListTile(
              title: const Text('Lokasi Tersimpan'),
              leading: const Icon(Icons.bookmark),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SavedPlacesScreen()),
              ),
            ),
            ListTile(
              title: const Text('Riwayat Perjalanan'),
              leading: const Icon(Icons.history),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const JourneyHistoryScreen()),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickOrigin(BuildContext context, WidgetRef ref) async {
    final result = await showModalBottomSheet<Place>(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: PlacePicker(
            label: 'Pilih Lokasi Asal',
            onSelect: (place) => Navigator.pop(context, place),
          ),
        ),
      ),
    );
    if (result != null) {
      ref.read(journeyProvider.notifier).setOrigin(JourneyLocation.fromPlace(result));
    }
  }

  Future<void> _pickDestination(BuildContext context, WidgetRef ref) async {
    final result = await showModalBottomSheet<Place>(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: PlacePicker(
            label: 'Pilih Lokasi Tujuan',
            onSelect: (place) => Navigator.pop(context, place),
          ),
        ),
      ),
    );
    if (result != null) {
      ref.read(journeyProvider.notifier).setDestination(JourneyLocation.fromPlace(result));
    }
  }

  void _searchRoute(BuildContext context, WidgetRef ref, JourneyState journey) {
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

    ref.read(routeOptionsProvider.notifier).searchRoutes(request);

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => RouteOptionsScreen(request: request)),
    );
  }
}
