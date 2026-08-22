import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../routing/state/route_options_notifier.dart';
import '../../routing/routing.types.ts';

class RouteOptionsScreen extends ConsumerWidget {
  const RouteOptionsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(routeOptionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Opsi Rute')),
      body: state.isLoading
          ? const Center(child: Text('Mencari rute terbaik...'))
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : state.routes == null || state.routes!.isEmpty
                  ? const Center(child: Text('Belum menemukan rute yang cocok.'))
                  : ListView.builder(
                      itemCount: state.routes!.length,
                      itemBuilder: (context, index) {
                        final route = state.routes![index];
                        return Card(
                          child: ListTile(
                            title: Text(route.badge ?? 'Rute ${index + 1}'),
                            subtitle: Text('${(route.totalDurationSeconds / 60).round()} menit · ${route.transferCount} transit'),
                            onTap: () {
                               // Navigate to detail
                            },
                          ),
                        );
                      },
                    ),
    );
  }
}
