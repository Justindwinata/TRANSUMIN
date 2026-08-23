import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/history/state/journey_history_notifier.dart';

class JourneyHistoryScreen extends ConsumerWidget {
  const JourneyHistoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(journeyHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Pencarian'),
        actions: [
          if (state.entries.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              tooltip: 'Hapus Semua',
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder:
                      (ctx) => AlertDialog(
                        title: const Text('Hapus Semua?'),
                        content: const Text('Hapus seluruh riwayat pencarian?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: const Text('Batal'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('Hapus'),
                          ),
                        ],
                      ),
                );
                if (confirmed == true) {
                  ref.read(journeyHistoryProvider.notifier).clear();
                }
              },
            ),
        ],
      ),
      body:
          state.entries.isEmpty
              ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.history, size: 48, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('Belum ada riwayat pencarian'),
                    ],
                  ),
                ),
              )
              : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: state.entries.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final entry = state.entries[index];
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.history),
                      title: Text('${entry.originName} → ${entry.destName}'),
                      subtitle: Text(
                        entry.summary ?? entry.searchedAt.toLocal().toString(),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed:
                            () => ref
                                .read(journeyHistoryProvider.notifier)
                                .removeById(entry.id),
                      ),
                      onTap: () {
                        Navigator.of(context).pop(entry);
                      },
                    ),
                  );
                },
              ),
    );
  }
}
