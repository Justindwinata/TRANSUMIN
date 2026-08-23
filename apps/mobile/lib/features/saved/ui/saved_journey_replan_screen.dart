import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:convert';
import 'package:mobile/features/saved/data/saved_journeys_repository.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/state/route_options_notifier.dart';
import 'package:mobile/features/routing/ui/route_options_screen.dart';

class SavedJourneyReplanScreen extends ConsumerWidget {
  final SavedJourney journey;

  const SavedJourneyReplanScreen({Key? key, required this.journey})
    : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rencanakan Ulang')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Perjalanan Tersimpan',
                      style: const TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      journey.label ?? 'Tanpa Label',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.place, color: Color(0xFF2563EB)),
                        const SizedBox(width: 8),
                        Text(journey.originName),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Row(
                      children: [
                        Icon(Icons.arrow_downward, color: Colors.grey),
                        SizedBox(width: 8),
                        Text(''),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.flag, color: Color(0xFFBA1A1A)),
                        const SizedBox(width: 8),
                        Text(journey.destName),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Detail',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text('ID Perjalanan: ${journey.id}'),
            Text(
              'Dibuat: ${journey.createdAt.toLocal().toString().substring(0, 19)}',
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Batal'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _replanJourney(context, ref),
                    child: const Text('Cari Rute Baru'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _replanJourney(BuildContext context, WidgetRef ref) {
    final payload = _parsePayload(journey.payloadJson);

    final request = JourneyRequest(
      origin: JourneyPoint(
        latitude: payload['originLat'] ?? -6.2088,
        longitude: payload['originLon'] ?? 106.8456,
        name: journey.originName,
      ),
      destination: JourneyPoint(
        latitude: payload['destLat'] ?? -6.2443,
        longitude: payload['destLon'] ?? 106.7999,
        name: journey.destName,
      ),
    );

    ref.read(routeOptionsProvider.notifier).searchRoutes(request);

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => RouteOptionsScreen(request: request)),
    );
  }

  Map<String, dynamic> _parsePayload(String json) {
    try {
      return jsonDecode(json) as Map<String, dynamic>;
    } catch (e) {
      return {};
    }
  }
}
