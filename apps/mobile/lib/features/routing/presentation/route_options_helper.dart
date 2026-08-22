import 'package:flutter/material.dart';
import 'package:mobile/features/routing/domain/models.dart';

class RouteOptionsHelper {
  static String formatDuration(int seconds) {
    if (seconds <= 0) return '0 mnt';
    final minutes = (seconds / 60).round();
    if (minutes >= 60) {
      final hours = minutes ~/ 60;
      final remainingMinutes = minutes % 60;
      if (remainingMinutes == 0) {
        return '$hours jam';
      }
      return '$hours jam $remainingMinutes mnt';
    }
    return '$minutes mnt';
  }

  static String formatDistance(double meters) {
    if (meters >= 1000) {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
    return '${meters.round()} m';
  }

  static String formatTime(String gtfsTime) {
    final parts = gtfsTime.split(':');
    if (parts.length < 2) return gtfsTime;
    int hour = int.tryParse(parts[0]) ?? 0;
    final minute = parts[1];
    
    if (hour >= 24) {
      hour = hour % 24;
    }
    
    return '${hour.toString().padLeft(2, '0')}:$minute';
  }

  static Color getRouteColor(String? colorHex) {
    if (colorHex == null || colorHex.isEmpty) {
      return const Color(0xFF2563EB);
    }
    
    try {
      String hex = colorHex.replaceAll('#', '');
      if (hex.length == 6) {
        return Color(int.parse('0xFF$hex'));
      }
      return const Color(0xFF2563EB);
    } catch (_) {
      return const Color(0xFF2563EB);
    }
  }

  static IconData getTransitModeIcon(String mode) {
    final lower = mode.toLowerCase();
    if (lower.contains('krl') || lower.contains('commuter')) {
      return Icons.train;
    }
    if (lower.contains('transjakarta') || lower.contains('brt')) {
      return Icons.directions_bus;
    }
    if (lower.contains('mrt') || lower.contains('lrt')) {
      return Icons.tram;
    }
    if (lower.contains('walk') || lower.contains('jalan')) {
      return Icons.directions_walk;
    }
    return Icons.directions_transit;
  }

  static String getTransferLabel(int count) {
    if (count == 0) return 'Langsung';
    if (count == 1) return '1 transit';
    return '$count transit';
  }

  static String getRankingBadgeLabel(String? badge) {
    if (badge == null) return '';
    
    final badgeMap = {
      'fastest': 'Tercepat',
      'fewestTransfers': 'Minim Transit',
      'leastWalking': 'Minim Jalan',
      'simplest': 'Paling Sederhana',
    };
    
    return badgeMap[badge] ?? badge;
  }

  static List<RouteAlternative> sortByPreference(
    List<RouteAlternative> routes,
    String preference,
  ) {
    final sorted = List<RouteAlternative>.from(routes);
    
    switch (preference) {
      case 'fastest':
        sorted.sort((a, b) => a.totalDurationSeconds.compareTo(b.totalDurationSeconds));
        break;
      case 'fewestTransfers':
        sorted.sort((a, b) => a.transferCount.compareTo(b.transferCount));
        break;
      case 'leastWalking':
        sorted.sort((a, b) => a.walkingDistanceMeters.compareTo(b.walkingDistanceMeters));
        break;
      case 'simplest':
        sorted.sort((a, b) {
          final aScore = a.transferCount * 100 + a.segments.length;
          final bScore = b.transferCount * 100 + b.segments.length;
          return aScore.compareTo(bScore);
        });
        break;
    }
    
    return sorted;
  }

  static bool isValidRoute(RouteAlternative route) {
    if (route.segments.isEmpty) return false;
    if (route.totalDurationSeconds <= 0) return false;
    if (route.departureTime.isEmpty || route.arrivalTime.isEmpty) return false;
    return true;
  }
}
