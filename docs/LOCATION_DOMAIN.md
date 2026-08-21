# Location & Place Domain Models

## Core Concepts

### Coordinate
Represents a geographic point.

```dart
class Coordinate {
  final double latitude;
  final double longitude;
  
  Coordinate({required this.latitude, required this.longitude});
}
```

### Location
Represents a precise geographic location (typically current device location).

```dart
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
```

### Place
Represents a searchable destination or point of interest.

```dart
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
}

enum PlaceType {
  landmark,
  station,
  stop,
  savedPlace,
  recentSearch,
  generic,
}
```

### SearchResult
Represents a single search result.

```dart
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
```

### JourneyLocation
Represents an origin or destination for journey planning.

```dart
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
}
```
