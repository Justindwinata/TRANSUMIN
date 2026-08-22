import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/location/state/place_search_notifier.dart';
import 'package:mobile/features/location/domain/models.dart';
import 'package:mobile/features/saved/state/saved_places_notifier.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';
import 'package:mobile/features/location/ui/search_screen.dart';

class PlacePicker extends ConsumerWidget {
  final String label;
  final ValueChanged<Place> onSelect;

  const PlacePicker({
    Key? key,
    required this.label,
    required this.onSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedPlaces = ref.watch(savedPlacesProvider);
    final history = ref.watch(journeyHistoryProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.place, color: Color(0xFF2563EB)),
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.search, color: Colors.grey),
              title: const Text('Cari Lokasi'),
              subtitle: const Text('Ketik nama tempat atau alamat'),
              onTap: () async {
                final result = await Navigator.push<JourneyLocation?>(
                  context,
                  MaterialPageRoute(builder: (_) => const SearchScreen()),
                );
                if (result != null) {
                  onSelect(Place(
                    id: result.id,
                    name: result.name ?? '',
                    address: result.address,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    type: PlaceType.generic,
                    source: 'search',
                  ));
                }
              },
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.my_location, color: Colors.green),
              title: const Text('Lokasi Saat Ini'),
              subtitle: const Text('Gunakan posisi GPS'),
              onTap: () {
                onSelect(Place(
                  name: 'Lokasi Saya',
                  latitude: -6.2088,
                  longitude: 106.8456,
                  type: PlaceType.generic,
                  source: 'current_location',
                ));
              },
            ),
            if (savedPlaces.places.isNotEmpty) ...[
              const Divider(),
              const Text('Tersimpan', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: savedPlaces.places.map((sp) {
                  return ActionChip(
                    avatar: Icon(
                      _getPlaceIcon(sp.name),
                      size: 18,
                    ),
                    label: Text(sp.name, style: const TextStyle(fontSize: 13)),
                    onPressed: () => onSelect(sp.toPlace()),
                  );
                }).toList(),
              ),
            ],
            if (history.isNotEmpty) ...[
              const Divider(),
              const Text('Riwayat', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: history.take(5).map((h) {
                  return ActionChip(
                    avatar: const Icon(Icons.history, size: 18),
                    label: Text('${h.originName} → ${h.destName}', style: const TextStyle(fontSize: 13)),
                    onPressed: () => onSelect(Place(
                      name: h.originName,
                      latitude: double.tryParse(h.originLat ?? '') ?? -6.2,
                      longitude: double.tryParse(h.originLon ?? '') ?? 106.8,
                      type: PlaceType.generic,
                      source: 'history',
                    )),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  IconData _getPlaceIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('rumah') || lower.contains('home')) return Icons.home;
    if (lower.contains('kantor') || lower.contains('office')) return Icons.work;
    if (lower.contains('kampus') || lower.contains('university') || lower.contains('sekolah')) return Icons.school;
    if (lower.contains('stasiun') || lower.contains('station')) return Icons.train;
    if (lower.contains('halte') || lower.contains('bus')) return Icons.directions_bus;
    return Icons.place;
  }
}