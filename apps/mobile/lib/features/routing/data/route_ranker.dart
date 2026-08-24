import '../domain/models.dart';

/// Route preference ranking helper.
///
/// Applies a deterministic client-side ranking based on the user's selected
/// preference. This is used as a fallback when the backend does not yet
/// support per-preference ranking, and as a safety net so the preference always
/// affects the visible ordering of route alternatives.
class RouteRanker {
  /// Sorts the given routes according to [preference].
  ///
  /// Valid preference values: `fastest`, `minTransfers`, `minWalking`.
  /// Any unknown value falls back to `fastest`.
  static List<RouteAlternative> rank(
    List<RouteAlternative> routes,
    String preference,
  ) {
    final sorted = List<RouteAlternative>.from(routes);
    switch (preference) {
      case 'minTransfers':
        sorted.sort((a, b) {
          final c = a.transferCount.compareTo(b.transferCount);
          if (c != 0) return c;
          return a.totalDurationSeconds.compareTo(b.totalDurationSeconds);
        });
        break;
      case 'minWalking':
        sorted.sort((a, b) {
          final c = a.walkingDistanceMeters.compareTo(b.walkingDistanceMeters);
          if (c != 0) return c;
          return a.totalDurationSeconds.compareTo(b.totalDurationSeconds);
        });
        break;
      case 'fastest':
      default:
        sorted.sort(
          (a, b) => a.totalDurationSeconds.compareTo(b.totalDurationSeconds),
        );
        break;
    }
    return sorted;
  }
}
