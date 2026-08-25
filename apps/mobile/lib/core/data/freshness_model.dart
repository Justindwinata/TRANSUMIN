/// Data Freshness States
///
/// Defines how current and trustworthy transit data is considered.
/// The exact thresholds are configurable and should be based on actual
/// dataset behavior and GTFS service periods.

class FreshnessState {
  static const String fresh = 'fresh';
  static const String recent = 'recent';
  static const String stale = 'stale';
  static const String unknown = 'unknown';
  static const String unavailable = 'unavailable';
}

/// Freshness thresholds (in hours)
class FreshnessThresholds {
  /// Data was retrieved within this window
  static const int fresh = 24;

  /// Data is within this window after fresh
  static const int recent = 168; // 7 days

  /// Data older than this is considered stale
  static const int stale = 720; // 30 days
}

/// Determine freshness state based on retrievedAt timestamp
String getFreshnessState(DateTime? retrievedAt, DateTime? validatedAt) {
  if (retrievedAt == null) {
    return FreshnessState.unknown;
  }

  final now = DateTime.now();
  final retrievedHours = now.difference(retrievedAt).inHours.toDouble();

  if (retrievedHours <= FreshnessThresholds.fresh) {
    return FreshnessState.fresh;
  } else if (retrievedHours <= FreshnessThresholds.recent) {
    return FreshnessState.recent;
  } else if (retrievedHours <= FreshnessThresholds.stale) {
    return FreshnessState.stale;
  }

  return FreshnessState.stale;
}

/// Human-readable freshness label in Indonesian
String getFreshnessLabel(String state) {
  switch (state) {
    case FreshnessState.fresh:
    case FreshnessState.recent:
      return 'Data terbaru';
    case FreshnessState.stale:
      return 'Data mungkin tidak terkini';
    case FreshnessState.unknown:
      return 'Status data tidak tersedia';
    case FreshnessState.unavailable:
      return 'Data tidak tersedia';
    default:
      return 'Data tidak tersedia';
  }
}

/// Human-readable freshness message in Indonesian
String getFreshnessMessage(String state, {DateTime? retrievedAt}) {
  switch (state) {
    case FreshnessState.fresh:
      return retrievedAt != null ? 'Data diperbarui hari ini' : 'Data terbaru';
    case FreshnessState.recent:
      return 'Data terbaru';
    case FreshnessState.stale:
      return 'Data mungkin tidak mencerminkan situasi terkini';
    case FreshnessState.unknown:
      return 'Kami tidak dapat memastikan kapan data ini diperbarui';
    case FreshnessState.unavailable:
      return 'Data transit saat ini tidak tersedia';
    default:
      return 'Data transit saat ini tidak tersedia';
  }
}

/// Determine if data is fresh enough for routing decisions
bool isFreshEnoughForRouting(String state) {
  return state == FreshnessState.fresh || state == FreshnessState.recent;
}
