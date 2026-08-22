import '../../routing/domain/models.dart';

enum JourneyMapMarkerKind { origin, destination, boarding, alighting, stop }

class JourneyMapMarker {
  final double latitude;
  final double longitude;
  final String label;
  final JourneyMapMarkerKind kind;
  final String? routeColor;

  const JourneyMapMarker({
    required this.latitude,
    required this.longitude,
    required this.label,
    required this.kind,
    this.routeColor,
  });
}

enum JourneySegmentKind { walking, transit, transfer }

class JourneySegmentLine {
  final List<({double lat, double lon})> points;
  final JourneySegmentKind kind;
  final String? routeColor;
  final String? label;

  const JourneySegmentLine({
    required this.points,
    required this.kind,
    this.routeColor,
    this.label,
  });

  bool get isApprox =>
      kind == JourneySegmentKind.walking || kind == JourneySegmentKind.transfer;
}

class JourneyMapModel {
  final List<JourneyMapMarker> markers;
  final List<JourneySegmentLine> segments;
  final ({double lat, double lon})? center;
  final double? zoom;
  final bool hasFullGeometry;

  const JourneyMapModel({
    required this.markers,
    required this.segments,
    this.center,
    this.zoom,
    this.hasFullGeometry = false,
  });

  bool get isEmpty => markers.isEmpty && segments.isEmpty;
}

class JourneyMapBuilder {
  static JourneyMapModel fromJourney(RouteAlternative route) {
    final markers = <JourneyMapMarker>[];
    final lines = <JourneySegmentLine>[];

    markers.add(
      JourneyMapMarker(
        latitude: route.origin.latitude,
        longitude: route.origin.longitude,
        label: route.origin.name ?? 'Asal',
        kind: JourneyMapMarkerKind.origin,
      ),
    );

    markers.add(
      JourneyMapMarker(
        latitude: route.destination.latitude,
        longitude: route.destination.longitude,
        label: route.destination.name ?? 'Tujuan',
        kind: JourneyMapMarkerKind.destination,
      ),
    );

    bool hasFull = true;

    for (final seg in route.segments) {
      switch (seg.type) {
        case 'WALK':
          if (seg.fromLat != null &&
              seg.fromLon != null &&
              seg.toLat != null &&
              seg.toLon != null) {
            lines.add(
              JourneySegmentLine(
                points: [
                  (lat: seg.fromLat!, lon: seg.fromLon!),
                  (lat: seg.toLat!, lon: seg.toLon!),
                ],
                kind: JourneySegmentKind.walking,
                label: 'Jalan kaki',
              ),
            );
          } else {
            hasFull = false;
          }
          break;
        case 'TRANSIT':
          if (seg.fromLat != null &&
              seg.fromLon != null &&
              seg.toLat != null &&
              seg.toLon != null) {
            lines.add(
              JourneySegmentLine(
                points: [
                  (lat: seg.fromLat!, lon: seg.fromLon!),
                  (lat: seg.toLat!, lon: seg.toLon!),
                ],
                kind: JourneySegmentKind.transit,
                routeColor: seg.routeColor,
                label: seg.routeShortName ?? seg.routeLongName,
              ),
            );
            markers.add(
              JourneyMapMarker(
                latitude: seg.fromLat!,
                longitude: seg.fromLon!,
                label: seg.fromName,
                kind: JourneyMapMarkerKind.boarding,
                routeColor: seg.routeColor,
              ),
            );
            markers.add(
              JourneyMapMarker(
                latitude: seg.toLat!,
                longitude: seg.toLon!,
                label: seg.toName,
                kind: JourneyMapMarkerKind.alighting,
                routeColor: seg.routeColor,
              ),
            );
          } else {
            hasFull = false;
          }
          break;
        case 'TRANSFER':
          if (seg.fromLat != null && seg.fromLon != null) {
            lines.add(
              JourneySegmentLine(
                points: [
                  (lat: seg.fromLat!, lon: seg.fromLon!),
                  (lat: seg.fromLat!, lon: seg.fromLon!),
                ],
                kind: JourneySegmentKind.transfer,
                label: 'Transfer',
              ),
            );
            markers.add(
              JourneyMapMarker(
                latitude: seg.fromLat!,
                longitude: seg.fromLon!,
                label: seg.fromName,
                kind: JourneyMapMarkerKind.stop,
              ),
            );
          } else {
            hasFull = false;
          }
          break;
        case 'WAIT':
          if (seg.fromLat != null && seg.fromLon != null) {
            markers.add(
              JourneyMapMarker(
                latitude: seg.fromLat!,
                longitude: seg.fromLon!,
                label: seg.fromName,
                kind: JourneyMapMarkerKind.stop,
              ),
            );
          }
          break;
      }
    }

    final center = _centerOf(markers);

    return JourneyMapModel(
      markers: markers,
      segments: lines,
      center: center,
      zoom: 13.0,
      hasFullGeometry: hasFull,
    );
  }

  static ({double lat, double lon})? _centerOf(List<JourneyMapMarker> markers) {
    if (markers.isEmpty) return null;
    final lats = markers.map((m) => m.latitude);
    final lons = markers.map((m) => m.longitude);
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLon = lons.reduce((a, b) => a < b ? a : b);
    final maxLon = lons.reduce((a, b) => a > b ? a : b);
    return (lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2);
  }
}
