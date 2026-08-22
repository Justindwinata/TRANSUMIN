export enum SegmentType {
  WALK = 'WALK',
  TRANSIT = 'TRANSIT',
  TRANSFER = 'TRANSFER',
  WAIT = 'WAIT',
}

export enum OptimizationProfile {
  FASTEST = 'fastest',
  FEWEST_TRANSFERS = 'fewestTransfers',
  LEAST_WALKING = 'leastWalking',
  SIMPLEST = 'simplest',
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface Segment {
  type: SegmentType;
  durationSeconds: number;
  distanceMeters?: number;
  instruction: string;
  fromName: string;
  toName: string;
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
  // Transit specific
  routeShortName?: string;
  routeLongName?: string;
  routeColor?: string;
  serviceType?: string;
  agencyName?: string;
  tripHeadsign?: string;
  departureTime?: string;
  arrivalTime?: string;
  intermediateStopsCount?: number;
}

export interface JourneySummary {
  totalDurationSeconds: number;
  transitDurationSeconds: number;
  walkingDurationSeconds: number;
  walkingDistanceMeters: number;
  waitingDurationSeconds: number;
  transferCount: number;
  fareText: string;
  fareAmount?: number;
  badge?: string;
}

export interface Journey {
  id: string;
  origin: LocationPoint;
  destination: LocationPoint;
  requestedDepartureTime: string;
  departureTime: string;
  arrivalTime: string;
  summary: JourneySummary;
  segments: Segment[];
  primaryRankingBadge?: string;
}

export interface RoutingRequestDto {
  origin: LocationPoint;
  destination: LocationPoint;
  departureTime?: string;
  preference?: OptimizationProfile;
}

export interface RoutingResponseDto {
  journeys: Journey[];
  count: number;
  requestedAt: string;
}
