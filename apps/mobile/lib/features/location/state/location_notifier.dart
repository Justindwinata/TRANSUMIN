import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models.dart';

enum LocationPermissionStatus {
  unknown,
  requesting,
  granted,
  denied,
  permanentlyDenied,
  unavailable,
}

class LocationState {
  final LocationPermissionStatus permissionStatus;
  final Location? currentLocation;
  final String? error;
  final bool isRequesting;
  
  LocationState({
    this.permissionStatus = LocationPermissionStatus.unknown,
    this.currentLocation,
    this.error,
    this.isRequesting = false,
  });

  LocationState copyWith({
    LocationPermissionStatus? permissionStatus,
    Location? currentLocation,
    String? error,
    bool? isRequesting,
  }) {
    return LocationState(
      permissionStatus: permissionStatus ?? this.permissionStatus,
      currentLocation: currentLocation ?? this.currentLocation,
      error: error ?? this.error,
      isRequesting: isRequesting ?? this.isRequesting,
    );
  }
}

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier() : super(LocationState());

  Future<void> requestLocationPermission() async {
    // Platform-specific permission logic will be implemented with geolocator
    // For now, simulate the flow
    state = state.copyWith(isRequesting: true, permissionStatus: LocationPermissionStatus.requesting);
    
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Simulate granted
    state = state.copyWith(
      isRequesting: false,
      permissionStatus: LocationPermissionStatus.granted,
    );
  }

  Future<void> getCurrentLocation() async {
    if (state.permissionStatus != LocationPermissionStatus.granted) {
      await requestLocationPermission();
    }
    
    if (state.permissionStatus == LocationPermissionStatus.granted) {
      // Simulated location (Jakarta area)
      final location = Location(
        latitude: -6.2088,
        longitude: 106.8456,
        timestamp: DateTime.now(),
        accuracy: 10.0,
      );
      state = state.copyWith(currentLocation: location);
    }
  }

  void resetError() {
    state = state.copyWith(error: null);
  }
}

final locationProvider = StateNotifierProvider<LocationNotifier, LocationState>((ref) {
  return LocationNotifier();
});