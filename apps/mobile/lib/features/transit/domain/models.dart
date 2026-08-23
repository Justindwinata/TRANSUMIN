enum TransitMode { rail, brt, mikrotrans, feeder, walk, transfer }

class TransitOperator {
  final String id;
  final String name;
  final String shortName;
  final String? website;
  final String? logoUrl;

  TransitOperator({
    required this.id,
    required this.name,
    required this.shortName,
    this.website,
    this.logoUrl,
  });

  factory TransitOperator.fromJson(Map<String, dynamic> json) {
    return TransitOperator(
      id: json['id'] as String,
      name: json['name'] as String,
      shortName: json['shortName'] as String,
      website: json['website'] as String?,
      logoUrl: json['logoUrl'] as String?,
    );
  }

  @override
  String toString() => 'TransitOperator(id: $id, name: $name)';
}

class TransitRoute {
  final String id;
  final String operatorId;
  final String shortName;
  final String longName;
  final String routeType;
  final String serviceType;
  final String? color;
  final bool isActive;

  TransitRoute({
    required this.id,
    required this.operatorId,
    required this.shortName,
    required this.longName,
    required this.routeType,
    required this.serviceType,
    this.color,
    required this.isActive,
  });

  factory TransitRoute.fromJson(Map<String, dynamic> json) {
    return TransitRoute(
      id: json['id'] as String,
      operatorId: json['agencyId'] as String,
      shortName: json['shortName'] as String,
      longName: json['longName'] as String,
      routeType: json['routeType'] as String,
      serviceType: json['serviceType'] as String,
      color: json['color'] as String?,
      isActive: json['isActive'] ?? true,
    );
  }

  TransitMode get mode {
    switch (serviceType) {
      case 'KRL':
        return TransitMode.rail;
      case 'TRANSJAKARTA_BRT':
        return TransitMode.brt;
      case 'MIKROTRANS':
        return TransitMode.mikrotrans;
      case 'TRANSJAKARTA_FEEDER':
        return TransitMode.feeder;
      default:
        return TransitMode.walk;
    }
  }

  @override
  String toString() => 'TransitRoute(id: $id, name: $longName)';
}

class TransitStop {
  final String id;
  final String operatorId;
  final String name;
  final double latitude;
  final double longitude;
  final String? stationId;
  final double? distance;

  TransitStop({
    required this.id,
    required this.operatorId,
    required this.name,
    required this.latitude,
    required this.longitude,
    this.stationId,
    this.distance,
  });

  factory TransitStop.fromJson(Map<String, dynamic> json) {
    return TransitStop(
      id: json['id'] as String,
      operatorId: json['agencyId'] as String,
      name: json['name'] as String,
      latitude: (json['lat'] as num).toDouble(),
      longitude: (json['lon'] as num).toDouble(),
      stationId: json['stationId'] as String?,
      distance: (json['distance'] as num?)?.toDouble(),
    );
  }

  @override
  String toString() => 'TransitStop(id: $id, name: $name)';
}

class TransitStation {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String operator;
  final double? distance;

  TransitStation({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.operator,
    this.distance,
  });

  factory TransitStation.fromJson(Map<String, dynamic> json) {
    return TransitStation(
      id: json['id'] as String,
      name: json['name'] as String,
      latitude: (json['lat'] as num).toDouble(),
      longitude: (json['lon'] as num).toDouble(),
      operator: json['operator'] as String,
      distance: (json['distance'] as num?)?.toDouble(),
    );
  }

  @override
  String toString() => 'TransitStation(id: $id, name: $name)';
}

class NearbyTransitResult {
  final List<TransitStop> stops;
  final List<TransitStation> stations;

  NearbyTransitResult({required this.stops, required this.stations});

  factory NearbyTransitResult.fromJson(Map<String, dynamic> json) {
    return NearbyTransitResult(
      stops:
          (json['stops'] as List?)
              ?.map((e) => TransitStop.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      stations:
          (json['stations'] as List?)
              ?.map((e) => TransitStation.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  List<TransitStop> get allStops =>
      stops..sort((a, b) => (a.distance ?? 0).compareTo(b.distance ?? 0));
  List<TransitStation> get allStations =>
      stations..sort((a, b) => (a.distance ?? 0).compareTo(b.distance ?? 0));
}
