import 'package:flutter/material.dart';

class TransitBadge extends StatelessWidget {
  final String label;
  final TransitMode mode;

  const TransitBadge({Key? key, required this.label, required this.mode})
    : super(key: key);

  Color get backgroundColor {
    switch (mode) {
      case TransitMode.krl:
        return const Color(0xFFBA1A1A);
      case TransitMode.transjakarta:
        return const Color(0xFF0053DB);
      case TransitMode.jaklingko:
        return const Color(0xFF006A61);
      case TransitMode.walk:
        return const Color(0xFF737686);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

enum TransitMode { krl, transjakarta, jaklingko, walk }
