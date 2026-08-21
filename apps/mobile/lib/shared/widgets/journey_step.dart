import 'package:flutter/material.dart';

class JourneyStepWidget extends StatelessWidget {
  final String title;
  final String subtitle;
  final String iconType;
  final bool isLast;

  const JourneyStepWidget({
    Key? key,
    required this.title,
    required this.subtitle,
    required this.iconType,
    this.isLast = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAlignment.start,
      children: [
        Column(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: const Color(0xFF2563EB),
              child: Icon(
                iconType == 'walk' ? Icons.directions_walk : Icons.directions_transit,
                size: 16,
                color: Colors.white,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: const Color(0xFF737686),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }
}
