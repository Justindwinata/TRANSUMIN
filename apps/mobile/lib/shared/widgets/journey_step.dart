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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = _colorFor(iconType, isDark);
    final icon = _iconFor(iconType);

    return Semantics(
      button: false,
      label: _accessibilityLabel,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: color,
                child: Icon(
                  icon,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.bold),
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
      ),
    );
  }

  String get _accessibilityLabel {
    final stepType = _labelFor(iconType);
    return '$stepType. $title. $subtitle';
  }

  String _labelFor(String type) {
    switch (type) {
      case 'walk':
        return 'Berjalan';
      case 'board':
        return 'Naik';
      case 'ride':
        return 'Dalam perjalanan';
      case 'transfer':
        return 'Transfer';
      case 'alight':
        return 'Turun';
      case 'wait':
        return 'Menunggu';
      case 'arrive':
        return 'Tiba';
      default:
        return 'Langkah';
    }
  }

  Color _colorFor(String type, bool isDark) {
    switch (type) {
      case 'walk':
        return const Color(0xFF737686);
      case 'board':
        return const Color(0xFF2563EB);
      case 'ride':
        return const Color(0xFF006A61);
      case 'transfer':
        return const Color(0xFF943700);
      case 'alight':
        return const Color(0xFF0053DB);
      case 'wait':
        return const Color(0xFF737686);
      case 'arrive':
        return const Color(0xFFBA1A1A);
      default:
        return const Color(0xFF2563EB);
    }
  }

  IconData _iconFor(String type) {
    switch (type) {
      case 'walk':
        return Icons.directions_walk;
      case 'board':
        return Icons.directions_bus;
      case 'ride':
        return Icons.directions_transit;
      case 'transfer':
        return Icons.swap_horiz;
      case 'alight':
        return Icons.directions_transit_filled;
      case 'wait':
        return Icons.schedule;
      case 'arrive':
        return Icons.flag;
      default:
        return Icons.circle;
    }
  }
}
