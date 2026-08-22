import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/saved/state/saved_places_notifier.dart';

class SavedPlacesScreen extends ConsumerStatefulWidget {
  const SavedPlacesScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SavedPlacesScreen> createState() => _SavedPlacesScreenState();
}

class _SavedPlacesScreenState extends ConsumerState<SavedPlacesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(savedPlacesProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(savedPlacesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lokasi Tersimpan'),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.places.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                        const SizedBox(height: 8),
                        Text('Gagal memuat: ${state.error}'),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () => ref.read(savedPlacesProvider.notifier).load(),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                )
              : state.places.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.bookmark_border, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Belum ada lokasi tersimpan'),
                            SizedBox(height: 4),
                            Text(
                              'Tambahkan Rumah, Kampus, atau Kantor untuk akses cepat.',
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.places.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final place = state.places[index];
                        return Card(
                          child: ListTile(
                            leading: const Icon(Icons.place),
                            title: Text(place.name),
                            subtitle: Text(place.address),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline),
                              onPressed: () => _confirmDelete(place.id, place.name),
                            ),
                            onTap: () {
                              Navigator.of(context).pop(place.toPlace());
                            },
                          ),
                        );
                      },
                    ),
    );
  }

  Future<void> _confirmDelete(String id, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Lokasi?'),
        content: Text('Hapus "$name" dari lokasi tersimpan?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus')),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(savedPlacesProvider.notifier).deletePlace(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lokasi dihapus')),
        );
      }
    }
  }
}