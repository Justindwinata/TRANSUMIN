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
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/profile/state/user_preferences_notifier.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final journey = ref.watch(journeyProvider);
    final routePreference = ref.watch(routePreferenceProvider);

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
            const SizedBox(height: 12),
            _PreferenceDisplay(preference: routePreference),
            const SizedBox(height: 12),
            AppButton(
              label: 'Cari Rute',
              isLoading: false,
              onPressed:
                  journey.isComplete
                      ? () => _searchRoute(context, ref, journey, routePreference)
                      : null,
            ),
            const SizedBox(height: 16),
            const Divider(),
            ListTile(
              title: const Text('Lokasi Tersimpan'),
              leading: const Icon(Icons.bookmark),
              onTap:
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SavedPlacesScreen(),
                    ),
                  ),
            ),
            ListTile(
              title: const Text('Riwayat Perjalanan'),
              leading: const Icon(Icons.history),
              onTap:
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const JourneyHistoryScreen(),
                    ),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PreferenceDisplay extends StatelessWidget {
  final RoutePreference preference;

  const _PreferenceDisplay({required this.preference});

  @override
  Widget build(BuildContext context) {
    String label;
    IconData icon;
    switch (preference) {
      case RoutePreference.minTransfers:
        label = 'Sedikit Peralihan';
        icon = Icons.swap_horiz;
        break;
      case RoutePreference.minWalking:
        label = 'Jalan Kaki Minimal';
        icon = Icons.directions_walk;
        break;
      case RoutePreference.fastest:
      default:
        label = 'Tercepak';
        icon = Icons.speed;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: Colors.blue.shade700),
          const SizedBox(width: 8),
          Text(
            'Preferensi: $label',
            style: TextStyle(
              color: Colors.blue.shade700,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

  Future<void> _pickOrigin(BuildContext context, WidgetRef ref) async {
    final result = await showModalBottomSheet<Place>(
      context: context,
      isScrollControlled: true,
      builder:
          (context) => DraggableScrollableSheet(
            initialChildSize: 0.7,
            minChildSize: 0.5,
            maxChildSize: 0.9,
            builder:
                (context, scrollController) => SingleChildScrollView(
                  controller: scrollController,
                  child: PlacePicker(
                    label: 'Pilih Lokasi Asal',
                    onSelect: (place) => Navigator.pop(context, place),
                  ),
                ),
          ),
    );
    if (result != null) {
      ref
          .read(journeyProvider.notifier)
          .setOrigin(JourneyLocation.fromPlace(result));
    }
  }

  Future<void> _pickDestination(BuildContext context, WidgetRef ref) async {
    final result = await showModalBottomSheet<Place>(
      context: context,
      isScrollControlled: true,
      builder:
          (context) => DraggableScrollableSheet(
            initialChildSize: 0.7,
            minChildSize: 0.5,
            maxChildSize: 0.9,
            builder:
                (context, scrollController) => SingleChildScrollView(
                  controller: scrollController,
                  child: PlacePicker(
                    label: 'Pilih Lokasi Tujuan',
                    onSelect: (place) => Navigator.pop(context, place),
                  ),
                ),
          ),
    );
    if (result != null) {
      ref
          .read(journeyProvider.notifier)
          .setDestination(JourneyLocation.fromPlace(result));
    }
  }

  void _searchRoute(
    BuildContext context,
    WidgetRef ref,
    JourneyState journey,
    RoutePreference preference,
  ) {
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
      preference: preference.name,
    );

    // Add to history
    final historyEntry = JourneyHistoryEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      originName: journey.origin!.name ?? 'Unknown',
      destName: journey.destination!.name ?? 'Unknown',
      originLat: journey.origin!.latitude.toString(),
      originLon: journey.origin!.longitude.toString(),
      destLat: journey.destination!.latitude.toString(),
      destLon: journey.destination!.longitude.toString(),
      searchedAt: DateTime.now(),
    );
    ref.read(journeyHistoryProvider.notifier).addEntry(historyEntry);

    ref.read(routeOptionsProvider.notifier).searchRoutes(request);

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => RouteOptionsScreen(request: request)),
    );
  }
}
