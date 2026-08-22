import 'package:flutter/material.dart';
import 'package:mobile/features/routing/domain/models.dart';
import 'package:mobile/features/routing/ui/route_options_screen.dart';
import 'package:mobile/features/routing/ui/journey_detail_screen.dart';

class AppRouter {
  static MaterialPageRoute<T> routeToRouteOptions<T>(JourneyRequest request) {
    return MaterialPageRoute<T>(
      builder: (_) => RouteOptionsScreen(request: request),
    );
  }

  static MaterialPageRoute<T> routeToJourneyDetail<T>(RouteAlternative route) {
    return MaterialPageRoute<T>(
      builder: (_) => JourneyDetailScreen(route: route),
    );
  }
}
