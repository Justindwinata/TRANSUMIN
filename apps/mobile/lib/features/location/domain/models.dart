class Coordinate {
  final double latitude;
  final double longitude;

  Coordinate({required this.latitude, required this.longitude});

  @override
  String toString() => 'Coordinate($latitude, $longitude)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Coordinate &&
          runtimeType == other.runtimeType &&
          latitude == other.latitude &&
          longitude == other.longitude;

  @override
  int get hashCode => latitude.hashCode ^ longitude.hashCode;
}

class Location extends Coordinate {
  final DateTime timestamp;
  final double? accuracy;
  final double? altitude;
  final double? speed;

  Location({
    required double latitude,
    required double longitude,
    required this.timestamp,
    this.accuracy,
    this.altitude,
    this.speed,
  }) : super(latitude: latitude, longitude: longitude);
}

enum PlaceType { landmark, station, stop, savedPlace, recentSearch, generic }

class Place {
  final String? id;
  final String name;
  final String? address;
  final double latitude;
  final double longitude;
  final PlaceType type;
  final String source;
  final Map<String, dynamic>? metadata;

  Place({
    this.id,
    required this.name,
    this.address,
    required this.latitude,
    required this.longitude,
    required this.type,
    required this.source,
    this.metadata,
  });

  @override
  String toString() =>
      'Place(id: $id, name: $name, lat: $latitude, lon: $longitude, type: $type)';
}

class SearchResult {
  final Place place;
  final double? distance;
  final bool isTransitRelevant;

  SearchResult({
    required this.place,
    this.distance,
    this.isTransitRelevant = false,
  });
}

class JourneyLocation {
  final String? id;
  final String? name;
  final String? address;
  final double latitude;
  final double longitude;
  final String source;

  JourneyLocation({
    this.id,
    this.name,
    this.address,
    required this.latitude,
    required this.longitude,
    required this.source,
  });

  factory JourneyLocation.fromPlace(Place place) {
    return JourneyLocation(
      id: place.id,
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      source: place.source,
    );
  }

  factory JourneyLocation.fromLocation(Location location, {String? name}) {
    return JourneyLocation(
      latitude: location.latitude,
      longitude: location.longitude,
      name: name,
      source: 'current_location',
    );
  }

  @override
  String toString() =>
      'JourneyLocation(id: $id, name: $name, lat: $latitude, lon: $longitude)';
}
