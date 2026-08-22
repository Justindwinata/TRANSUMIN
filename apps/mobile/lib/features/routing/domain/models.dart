class JourneyRequest {
  final JourneyPoint origin;
  final JourneyPoint destination;
  final DateTime? departureTime;
  final String preference;

  JourneyRequest({
    required this.origin,
    required this.destination,
    this.departureTime,
    this.preference = 'fastest',
  });

  Map<String, dynamic> toJson() => {
    'origin': {
      'latitude': origin.latitude,
      'longitude': origin.longitude,
      if (origin.name != null) 'name': origin.name,
    },
    'destination': {
      'latitude': destination.latitude,
      'longitude': destination.longitude,
      if (destination.name != null) 'name': destination.name,
    },
    if (departureTime != null)
      'departureTime': departureTime!.toIso8601String(),
    'preference': preference,
  };
}

class JourneyPoint {
  final double latitude;
  final double longitude;
  final String? name;

  JourneyPoint({required this.latitude, required this.longitude, this.name});

  factory JourneyPoint.fromJson(Map<String, dynamic> json) {
    return JourneyPoint(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      name: json['name'] as String?,
    );
  }
}

class RouteAlternative {
  final String id;
  final JourneyPoint origin;
  final JourneyPoint destination;
  final String departureTime;
  final String arrivalTime;
  final int totalDurationSeconds;
  final int transitDurationSeconds;
  final int walkingDurationSeconds;
  final double walkingDistanceMeters;
  final int waitingDurationSeconds;
  final int transferCount;
  final String fareText;
  final String? badge;
  final List<JourneySegment> segments;

  RouteAlternative({
    required this.id,
    required this.origin,
    required this.destination,
    required this.departureTime,
    required this.arrivalTime,
    required this.totalDurationSeconds,
    required this.transitDurationSeconds,
    required this.walkingDurationSeconds,
    required this.walkingDistanceMeters,
    required this.waitingDurationSeconds,
    required this.transferCount,
    required this.fareText,
    this.badge,
    required this.segments,
  });

  factory RouteAlternative.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>? ?? {};
    return RouteAlternative(
      id: json['id'] as String? ?? 'journey-1',
      origin: JourneyPoint.fromJson(
        json['origin'] as Map<String, dynamic>? ?? {},
      ),
      destination: JourneyPoint.fromJson(
        json['destination'] as Map<String, dynamic>? ?? {},
      ),
      departureTime: json['departureTime'] as String? ?? '08:00',
      arrivalTime: json['arrivalTime'] as String? ?? '09:00',
      totalDurationSeconds:
          (summary['totalDurationSeconds'] as num?)?.toInt() ?? 0,
      transitDurationSeconds:
          (summary['transitDurationSeconds'] as num?)?.toInt() ?? 0,
      walkingDurationSeconds:
          (summary['walkingDurationSeconds'] as num?)?.toInt() ?? 0,
      walkingDistanceMeters:
          (summary['walkingDistanceMeters'] as num?)?.toDouble() ?? 0.0,
      waitingDurationSeconds:
          (summary['waitingDurationSeconds'] as num?)?.toInt() ?? 0,
      transferCount: (summary['transferCount'] as num?)?.toInt() ?? 0,
      fareText: summary['fareText'] as String? ?? 'Tarif tidak tersedia',
      badge:
          json['primaryRankingBadge'] as String? ?? summary['badge'] as String?,
      segments:
          (json['segments'] as List?)
              ?.map((s) => JourneySegment.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  String get durationText {
    final mins = (totalDurationSeconds / 60).round();
    if (mins >= 60) {
      final hours = mins ~/ 60;
      final rem = mins % 60;
      return '$hours jam $rem mnt';
    }
    return '$mins mnt';
  }

  List<String> get transitModes {
    final modes = <String>[];
    for (var s in segments) {
      if (s.type == 'TRANSIT') {
        final name = s.routeName ?? s.serviceType ?? 'Transit';
        if (!modes.contains(name)) modes.add(name);
      }
    }
    if (modes.isEmpty) modes.add('Jalan Kaki');
    return modes;
  }

  String get walkDistanceText {
    if (walkingDistanceMeters >= 1000) {
      return '${(walkingDistanceMeters / 1000).toStringAsFixed(1)} km jalan kaki';
    }
    return '${walkingDistanceMeters.round()} m jalan kaki';
  }
}

class JourneySegment {
  final String type; // WALK, TRANSIT, TRANSFER, WAIT
  final int durationSeconds;
  final double? distanceMeters;
  final String instruction;
  final String fromName;
  final String toName;
  final double? fromLat;
  final double? fromLon;
  final double? toLat;
  final double? toLon;
  final String? routeShortName;
  final String? routeLongName;
  final String? routeColor;
  final String? serviceType;
  final String? agencyName;
  final String? tripHeadsign;
  final String? departureTime;
  final String? arrivalTime;
  final int? intermediateStopsCount;

  JourneySegment({
    required this.type,
    required this.durationSeconds,
    this.distanceMeters,
    required this.instruction,
    required this.fromName,
    required this.toName,
    this.fromLat,
    this.fromLon,
    this.toLat,
    this.toLon,
    this.routeShortName,
    this.routeLongName,
    this.routeColor,
    this.serviceType,
    this.agencyName,
    this.tripHeadsign,
    this.departureTime,
    this.arrivalTime,
    this.intermediateStopsCount,
  });

  factory JourneySegment.fromJson(Map<String, dynamic> json) {
    return JourneySegment(
      type: json['type'] as String? ?? 'WALK',
      durationSeconds: (json['durationSeconds'] as num?)?.toInt() ?? 0,
      distanceMeters: (json['distanceMeters'] as num?)?.toDouble(),
      instruction: json['instruction'] as String? ?? '',
      fromName: json['fromName'] as String? ?? '',
      toName: json['toName'] as String? ?? '',
      fromLat: (json['fromLat'] as num?)?.toDouble(),
      fromLon: (json['fromLon'] as num?)?.toDouble(),
      toLat: (json['toLat'] as num?)?.toDouble(),
      toLon: (json['toLon'] as num?)?.toDouble(),
      routeShortName: json['routeShortName'] as String?,
      routeLongName: json['routeLongName'] as String?,
      routeColor: json['routeColor'] as String?,
      serviceType: json['serviceType'] as String?,
      agencyName: json['agencyName'] as String?,
      tripHeadsign: json['tripHeadsign'] as String?,
      departureTime: json['departureTime'] as String?,
      arrivalTime: json['arrivalTime'] as String?,
      intermediateStopsCount: (json['intermediateStopsCount'] as num?)?.toInt(),
    );
  }
}
