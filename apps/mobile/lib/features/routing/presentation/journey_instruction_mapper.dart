import '../domain/models.dart';

enum InstructionKind {
  start,
  walk,
  board,
  ride,
  transfer,
  alight,
  wait,
  arrive,
}

class JourneyInstruction {
  final InstructionKind kind;
  final String title;
  final String subtitle;
  final String? detail;
  final int durationSeconds;
  final double? distanceMeters;
  final String? routeName;
  final String? headsign;
  final String? agencyName;
  final String? routeColor;
  final String? stopName;
  final String? arrivalStopName;
  final double? lat;
  final double? lon;

  const JourneyInstruction({
    required this.kind,
    required this.title,
    required this.subtitle,
    this.detail,
    required this.durationSeconds,
    this.distanceMeters,
    this.routeName,
    this.headsign,
    this.agencyName,
    this.routeColor,
    this.stopName,
    this.arrivalStopName,
    this.lat,
    this.lon,
  });

  String get iconKey {
    switch (kind) {
      case InstructionKind.start:
        return 'start';
      case InstructionKind.walk:
        return 'walk';
      case InstructionKind.board:
        return 'board';
      case InstructionKind.ride:
        return 'ride';
      case InstructionKind.transfer:
        return 'transfer';
      case InstructionKind.alight:
        return 'alight';
      case InstructionKind.wait:
        return 'wait';
      case InstructionKind.arrive:
        return 'arrive';
    }
  }

  bool get isMajor =>
      kind == InstructionKind.board ||
      kind == InstructionKind.alight ||
      kind == InstructionKind.transfer ||
      kind == InstructionKind.arrive;
}

class JourneyInstructionMapper {
  static List<JourneyInstruction> fromJourney(RouteAlternative route) {
    final instructions = <JourneyInstruction>[];

    instructions.add(_startInstruction(route));

    for (var i = 0; i < route.segments.length; i++) {
      final seg = route.segments[i];
      switch (seg.type) {
        case 'WALK':
          instructions.add(_walkInstruction(seg, route, isFirst: i == 0));
          break;
        case 'WAIT':
          instructions.add(_waitInstruction(seg));
          break;
        case 'TRANSIT':
          instructions.add(_boardInstruction(seg));
          instructions.add(_rideInstruction(seg));
          instructions.add(
            _alightInstruction(
              seg,
              route,
              isLast: i == route.segments.length - 1,
            ),
          );
          break;
        case 'TRANSFER':
          instructions.add(_transferInstruction(seg));
          break;
      }
    }

    return instructions;
  }

  static JourneyInstruction _startInstruction(RouteAlternative route) {
    final name = route.origin.name ?? 'Lokasi Awal';
    return JourneyInstruction(
      kind: InstructionKind.start,
      title: 'Mulai dari $name',
      subtitle: _formatTime(route.departureTime),
      detail: route.origin.name != null ? null : 'Lokasi saat ini',
      durationSeconds: 0,
      lat: route.origin.latitude,
      lon: route.origin.longitude,
    );
  }

  static JourneyInstruction _walkInstruction(
    JourneySegment seg,
    RouteAlternative route, {
    bool isFirst = false,
  }) {
    final title =
        isFirst ? 'Berjalan ke ${seg.toName}' : 'Berjalan menuju tujuan';
    final subtitle = _distanceLabel(seg.distanceMeters);
    return JourneyInstruction(
      kind: InstructionKind.walk,
      title: title,
      subtitle: subtitle,
      detail: seg.instruction,
      durationSeconds: seg.durationSeconds,
      distanceMeters: seg.distanceMeters,
      lat: seg.toLat,
      lon: seg.toLon,
      stopName: seg.toName,
    );
  }

  static JourneyInstruction _waitInstruction(JourneySegment seg) {
    return JourneyInstruction(
      kind: InstructionKind.wait,
      title: 'Tunggu kendaraan',
      subtitle: _durationLabel(seg.durationSeconds),
      detail: seg.instruction,
      durationSeconds: seg.durationSeconds,
      lat: seg.fromLat,
      lon: seg.fromLon,
      stopName: seg.fromName,
    );
  }

  static JourneyInstruction _boardInstruction(JourneySegment seg) {
    final name = seg.routeShortName ?? seg.routeLongName ?? 'Transit';
    final agency = seg.agencyName ?? '';
    return JourneyInstruction(
      kind: InstructionKind.board,
      title: 'Naik $name',
      subtitle: agency.isNotEmpty ? '$agency · ${seg.fromName}' : seg.fromName,
      detail:
          seg.tripHeadsign != null
              ? 'Arah ${seg.tripHeadsign}'
              : seg.instruction,
      durationSeconds: 0,
      routeName: name,
      headsign: seg.tripHeadsign,
      agencyName: seg.agencyName,
      routeColor: seg.routeColor,
      lat: seg.fromLat,
      lon: seg.fromLon,
      stopName: seg.fromName,
    );
  }

  static JourneyInstruction _rideInstruction(JourneySegment seg) {
    final stops = seg.intermediateStopsCount ?? 0;
    final subtitle =
        stops > 0
            ? '$stops perhentian · ${_durationLabel(seg.durationSeconds)}'
            : _durationLabel(seg.durationSeconds);
    return JourneyInstruction(
      kind: InstructionKind.ride,
      title: 'Menuju ${seg.toName}',
      subtitle: subtitle,
      detail:
          seg.departureTime != null && seg.arrivalTime != null
              ? '${seg.departureTime} → ${seg.arrivalTime}'
              : null,
      durationSeconds: seg.durationSeconds,
      routeName: seg.routeShortName ?? seg.routeLongName,
      headsign: seg.tripHeadsign,
      agencyName: seg.agencyName,
      routeColor: seg.routeColor,
      lat: seg.toLat,
      lon: seg.toLon,
      stopName: seg.toName,
    );
  }

  static JourneyInstruction _alightInstruction(
    JourneySegment seg,
    RouteAlternative route, {
    bool isLast = false,
  }) {
    final nextSeg = isLast ? null : _nextTransitOrTransfer(route.segments, seg);
    final title =
        nextSeg != null
            ? 'Turun di ${seg.toName}, lanjut transit'
            : 'Turun di ${seg.toName}';
    return JourneyInstruction(
      kind: InstructionKind.alight,
      title: title,
      subtitle:
          nextSeg != null ? 'Siap transit berikutnya' : 'Lanjut jalan kaki',
      detail: seg.arrivalTime != null ? 'Tiba ${seg.arrivalTime}' : null,
      durationSeconds: 0,
      routeName: seg.routeShortName ?? seg.routeLongName,
      agencyName: seg.agencyName,
      routeColor: seg.routeColor,
      lat: seg.toLat,
      lon: seg.toLon,
      stopName: seg.toName,
      arrivalStopName: seg.toName,
    );
  }

  static JourneyInstruction _transferInstruction(JourneySegment seg) {
    return JourneyInstruction(
      kind: InstructionKind.transfer,
      title: 'Transfer',
      subtitle:
          seg.departureTime != null
              ? 'Tunggu keberangkatan ${seg.departureTime}'
              : 'Lanjut ke moda berikutnya',
      detail: seg.instruction,
      durationSeconds: seg.durationSeconds,
      distanceMeters: seg.distanceMeters,
      lat: seg.fromLat,
      lon: seg.fromLon,
      stopName: seg.fromName,
    );
  }

  static JourneySegment? _nextTransitOrTransfer(
    List<JourneySegment> segments,
    JourneySegment current,
  ) {
    final i = segments.indexOf(current);
    if (i < 0 || i == segments.length - 1) return null;
    for (var j = i + 1; j < segments.length; j++) {
      final t = segments[j].type;
      if (t == 'TRANSIT' || t == 'TRANSFER') return segments[j];
    }
    return null;
  }

  static String _distanceLabel(double? meters) {
    if (meters == null) return '';
    if (meters >= 1000) {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
    return '${meters.round()} m';
  }

  static String _durationLabel(int seconds) {
    if (seconds <= 0) return '';
    final mins = (seconds / 60).round();
    if (mins >= 60) {
      final hours = mins ~/ 60;
      final rem = mins % 60;
      return rem > 0 ? '$hours jam $rem mnt' : '$hours jam';
    }
    return '$mins mnt';
  }

  static String _formatTime(String t) {
    final parts = t.split(':');
    if (parts.length < 2) return t;
    return '${parts[0]}:${parts[1]}';
  }
}
