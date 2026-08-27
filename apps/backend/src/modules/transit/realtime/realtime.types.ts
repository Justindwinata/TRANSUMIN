export enum RealtimeSourceStatus {
  ACTIVE = 'active',
  STALE = 'stale',
  UNAVAILABLE = 'unavailable',
  ERROR = 'error',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  SKIPPED = 'SKIPPED',
  UNKNOWN = 'UNKNOWN',
}

export interface RealtimeVehiclePosition {
  vehicleId: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  timestamp: Date;
  occupancyStatus?: 'EMPTY' | 'MANY_SEATS' | 'FEW_SEATS' | 'STANDING_ROOM' | 'CRUSHED' | 'FULL' | 'NOT_ACCEPTING_PASSENGERS';
  currentStopSequence?: number;
  stopId?: string;
  source: string;
}

export interface RealtimeTripUpdate {
  tripId: string;
  routeId: string;
  startDate?: string;
  startTime?: string;
  scheduleRelationship: 'SCHEDULED' | 'ADDED' | 'UNSCHEDULED' | 'CANCELLED';
  vehicle?: {
    id: string;
    label?: string;
  };
  stopTimeUpdates: Array<{
    stopSequence: number;
    stopId: string;
    arrival?: {
      delay: number;
      time: number;
      uncertainty: number;
    };
    departure?: {
      delay: number;
      time: number;
      uncertainty: number;
    };
    scheduleRelationship: 'SCHEDULED' | 'SKIPPED' | 'NO_DATA';
  }>;
  source: string;
}

export interface RealtimeServiceAlert {
  alertId: string;
  cause: string;
  effect: string;
  severityLevel: number;
  headerText: string;
  descriptionText: string;
  url?: string;
  activePeriod: Array<{
    start: Date;
    end?: Date;
  }>;
  informedEntity: Array<{
    routeId?: string;
    stopId?: string;
    tripId?: string;
    directionId?: number;
  }>;
  source: string;
}

export interface RealtimeProvider {
  name: string;
  status: RealtimeSourceStatus;
  lastUpdate?: Date;
  getVehiclePositions?(): Promise<RealtimeVehiclePosition[]>;
  getTripUpdates?(): Promise<RealtimeTripUpdate[]>;
  getServiceAlerts?(): Promise<RealtimeServiceAlert[]>;
  isHealthy(): boolean;
}

export interface DisabledRealtimeProvider extends RealtimeProvider {
  name: 'disabled';
  status: RealtimeSourceStatus.UNAVAILABLE;
}

export function createDisabledRealtimeProvider(): DisabledRealtimeProvider {
  return {
    name: 'disabled',
    status: RealtimeSourceStatus.UNAVAILABLE,
    isHealthy: () => false,
  };
}