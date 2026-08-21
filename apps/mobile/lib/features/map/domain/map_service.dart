import 'package:flutter/widgets.dart';

/// Map abstraction interface for platform-agnostic map operations.
abstract class MapService {
  /// Request location permissions if needed.
  Future<bool> requestLocationPermission();

  /// Check if location permission is granted.
  Future<bool> hasLocationPermission();

  /// Get current device location.
  Future<Offset?> getCurrentPosition();

  /// Center map on given coordinates.
  void centerOnCoordinates(double latitude, double longitude);

  /// Add a marker at the given coordinates.
  void addMarker(double latitude, double longitude, {String? title, Color? color});

  /// Remove all markers.
  void clearMarkers();

  /// Zoom map in.
  void zoomIn();

  /// Zoom map out.
  void zoomOut();

  /// Set map padding (for safe area).
  void setPadding(double top, double right, double bottom, double left);
}
