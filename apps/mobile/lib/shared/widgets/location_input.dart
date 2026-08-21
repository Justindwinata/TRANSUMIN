import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/location/domain/models.dart';
import '../../features/location/state/location_notifier.dart';

class LocationInputWidget extends ConsumerWidget {
  final String hint;
  final ValueChanged<JourneyLocation>? onSelected;

  const LocationInputWidget({Key? key, required this.hint, this.onSelected})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () {
        // Navigate to search screen
      },
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFC3C6D7)),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: Colors.grey),
            const SizedBox(width: 8),
            Text(hint, style: const TextStyle(color: Colors.grey)),
            const Spacer(),
            IconButton(
              icon: const Icon(Icons.my_location),
              onPressed: () {
                ref.read(locationProvider.notifier).getCurrentLocation();
              },
            ),
          ],
        ),
      ),
    );
  }
}
