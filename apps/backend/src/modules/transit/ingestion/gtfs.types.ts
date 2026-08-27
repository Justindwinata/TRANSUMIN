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
  stop_lat: string;
  stop_lon: string;
  parent_station?: string;
  zone_id?: string;
  wheelchair_boarding?: string;
}

export interface GtfsTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: string;
  shape_id?: string;
}

export interface GtfsStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
  pickup_type?: string;
  drop_off_type?: string;
}

export interface GtfsCalendar {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string;
  end_date: string;
}

export interface GtfsTransfer {
  from_stop_id: string;
  to_stop_id: string;
  transfer_type: string;
  min_transfer_time?: string;
}

export interface GtfsShape {
  shape_id: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
  shape_pt_sequence: string;
  shape_dist_traveled?: string;
}

export interface GtfsCalendarDate {
  service_id: string;
  date: string;
  exception_type: string;
}

export interface ValidationDetails {
  errors: string[];
  warnings: string[];
  rejectedRecords: {
    duplicateIds: number;
    invalidCoordinates: number;
    invalidTimes: number;
    orphans: number;
    fieldCountMismatch: number;
  };
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
    shapes: number;
    calendarDates: number;
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
  validationDetails?: ValidationDetails;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}
