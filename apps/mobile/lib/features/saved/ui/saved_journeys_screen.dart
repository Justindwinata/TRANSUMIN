import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/saved/state/saved_journeys_notifier.dart';

class SavedJourneysScreen extends ConsumerStatefulWidget {
  const SavedJourneysScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SavedJourneysScreen> createState() => _SavedJourneysScreenState();
}

class _SavedJourneysScreenState extends ConsumerState<SavedJourneysScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(savedJourneysProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(savedJourneysProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Perjalanan Tersimpan'),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.journeys.isEmpty
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
                          onPressed: () => ref.read(savedJourneysProvider.notifier).load(),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                )
              : state.journeys.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.route_outlined, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Belum ada perjalanan tersimpan'),
                            SizedBox(height: 4),
                            Text(
                              'Simpan perjalanan favorit untuk akses cepat.',
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.journeys.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final journey = state.journeys[index];
                        return Card(
                          child: ListTile(
                            leading: const Icon(Icons.route),
                            title: Text(journey.label ?? journey.originName),
                            subtitle: Text('${journey.originName} → ${journey.destName}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline),
                              onPressed: () => _confirmDelete(journey.id, journey.label ?? journey.originName),
                            ),
                            onTap: () {
                              Navigator.of(context).pop(journey);
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
        title: const Text('Hapus Perjalanan?'),
        content: Text('Hapus "$name" dari perjalanan tersimpan?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus')),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(savedJourneysProvider.notifier).deleteJourney(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Perjalanan dihapus')),
        );
      }
    }
  }
}