export interface GtfsAgency {
  agency_id?: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
}

export interface GtfsRoute {
  route_id: string;
  agency_id?: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  route_color?: string;
}

export interface GtfsStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  parent_station?: string;
  wheelchair_boarding?: number;
}

export interface GtfsTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: number;
}

export interface GtfsStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  pickup_type?: number;
  drop_off_type?: number;
}

export interface GtfsCalendar {
  service_id: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  start_date: string;
  end_date: string;
}

export interface GtfsTransfer {
  from_stop_id: string;
  to_stop_id: string;
  transfer_type: number;
  min_transfer_time?: number;
}

export interface IngestionReport {
  sourceName: string;
  version: string;
  fetchedAt: string;
  recordsFetched: {
    agencies: number;
    routes: number;
    stops: number;
    trips: number;
    stopTimes: number;
    calendars: number;
    transfers: number;
  };
  recordsAccepted: {
    agencies: number;
    routes: number;
    stops: number;
    trips: number;
    stopTimes: number;
    calendars: number;
    transfers: number;
  };
  rejections: {
    orphans: number;
    invalidCoordinates: number;
    duplicateIds: number;
    invalidTimes: number;
  };
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}
