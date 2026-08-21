import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/location_notifier.dart';

class LocationPermissionScreen extends ConsumerWidget {
  const LocationPermissionScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(locationProvider);

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_on, size: 64, color: Color(0xFF2563EB)),
            const SizedBox(height: 24),
            const Text(
              'Gunakan Lokasi Anda',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Text(
              'Kami membutuhkan akses lokasi untuk menunjukkan rute terdekat.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: state.isRequesting
                  ? null
                  : () async {
                      await ref.read(locationProvider.notifier).requestLocationPermission();
                      if (context.mounted && state.permissionStatus.name == 'granted') {
                        Navigator.pop(context);
                      }
                    },
              child: state.isRequesting ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Izinkan Lokasi'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Pilih Manual'),
            ),
          ],
        ),
      ),
    );
  }
}
