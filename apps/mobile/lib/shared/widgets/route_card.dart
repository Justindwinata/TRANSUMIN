import 'package:flutter/material.dart';

class RouteCard extends StatelessWidget {
  final String durationText;
  final String departureTime;
  final String arrivalTime;
  final String fareText;
  final String primaryBadgeLabel;
  final List<String> modes;
  final String walkDistanceText;
  final int transferCount;
  final VoidCallback onTap;

  const RouteCard({
    Key? key,
    required this.durationText,
    required this.departureTime,
    required this.arrivalTime,
    required this.fareText,
    required this.primaryBadgeLabel,
    required this.modes,
    required this.walkDistanceText,
    required this.transferCount,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFC3C6D7)),
        ),
        child: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  durationText,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2563EB),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    primaryBadgeLabel,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Text('$departureTime - $arrivalTime', style: const TextStyle(fontSize: 14)),
                const Spacer(),
                Text(fareText, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
            const Divider(height: 24),
            Row(
              children: [
                Text('Moda: ${modes.join(" → ")}', style: const TextStyle(fontSize: 12)),
                const Spacer(),
                Text('$walkDistanceText • $transferCount transit', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
