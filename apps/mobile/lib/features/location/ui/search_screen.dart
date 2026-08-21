import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../location/state/place_search_notifier.dart';
import '../location/domain/models.dart';

class SearchScreen extends ConsumerWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(placeSearchProvider);
    final notifier = ref.read(placeSearchProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Cari Lokasi')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              autofocus: true,
              onChanged: (val) => notifier.setQuery(val),
              decoration: const InputDecoration(
                hintText: 'Cari tempat atau stasiun...',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          if (state.isLoading) const LinearProgressIndicator(),
          Expanded(
            child: ListView.builder(
              itemCount: state.results.length,
              itemBuilder: (context, index) {
                final place = state.results[index];
                return ListTile(
                  title: Text(place.name),
                  subtitle: Text(place.address ?? ''),
                  onTap: () {
                    Navigator.pop(context, JourneyLocation.fromPlace(place));
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
