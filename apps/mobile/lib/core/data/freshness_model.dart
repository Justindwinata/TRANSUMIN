/// Data Freshness States
/// 
/// Defines how current and trustworthy transit data is considered.
/// The exact thresholds are configurable and should be based on actual
/// dataset behavior and GTFS service periods.

export type FreshnessState = 'fresh' | 'recent' | 'stale' | 'unknown' | 'unavailable';

/// Freshness thresholds (in hours)
export const FRESHNESS_THRESHOLDS = {
  /// Data was retrieved within this window
  fresh: 24,
  /// Data is within this window after fresh
  recent: 168, // 7 days
  /// Data older than this is considered stale
  stale: 720, // 30 days
};

/// Determine freshness state based on retrievedAt timestamp
export function getFreshnessState(retrievedAt: Date | null, validatedAt: Date | null): FreshnessState {
  if (!retrievedAt) {
    return 'unknown';
  }

  const now = new Date();
  const retrievedHours = (now.getTime() - retrievedAt.getTime()) / (1000 * 60 * 60);

  if (retrievedHours <= FRESHNESS_THRESHOLDS.fresh) {
    return 'fresh';
  } else if (retrievedHours <= FRESHNESS_THRESHOLDS.recent) {
    return 'recent';
  } else if (retrievedHours <= FRESHNESS_THRESHOLDS.stale) {
    return 'stale';
  }

  return 'stale';
}

/// Human-readable freshness label in Indonesian
export function getFreshnessLabel(state: FreshnessState): string {
  switch (state) {
    case 'fresh':
      return 'Data terbaru';
    case 'recent':
      return 'Data terbaru';
    case 'stale':
      return 'Data mungkin tidak terkini';
    case 'unknown':
      return 'Status data tidak tersedia';
    case 'unavailable':
      return 'Data tidak tersedia';
    default:
      return 'Data tidak tersedia';
  }
}

/// Human-readable freshness message in Indonesian
export function getFreshnessMessage(state: FreshnessState, retrievedAt?: Date): string {
  switch (state) {
    case 'fresh':
      return retrievedAt ? 'Data diperbarui hari ini' : 'Data terbaru';
    case 'recent':
      return retrievedAt ? 'Data diperbarui недавно' : 'Data terbaru';
    case 'stale':
      return 'Data mungkin tidak mencerminkan situasi terkini';
    case 'unknown':
      return 'Kami tidak dapat memastikan kapan data ini diperbarui';
    case 'unavailable':
      return 'Data transit saat ini tidak tersedia';
    default:
      return 'Data transit saat ini tidak tersedia';
  }
}

/// Determine if data is fresh enough for routing decisions
export function isFreshEnoughForRouting(state: FreshnessState): boolean {
  return state === 'fresh' || state === 'recent';
}
