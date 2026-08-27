import {
  GtfsAgency,
  GtfsRoute,
  GtfsStop,
  GtfsTrip,
  GtfsStopTime,
  GtfsCalendar,
  GtfsTransfer,
  GtfsShape,
  GtfsCalendarDate,
} from '../gtfs.types';
import { CsvParser } from '../parsers/csv.parser';

export class IdHasher {
  static hashAgency(sourceName: string, agencyId: string): string {
    return `${sourceName.toLowerCase()}-agency-${agencyId}`;
  }

  static hashRoute(sourceName: string, routeId: string): string {
    return `${sourceName.toLowerCase()}-route-${routeId}`;
  }

  static hashStop(sourceName: string, stopId: string): string {
    return `${sourceName.toLowerCase()}-stop-${stopId}`;
  }

  static hashTrip(sourceName: string, tripId: string): string {
    return `${sourceName.toLowerCase()}-trip-${tripId}`;
  }

  static hashTransfer(fromStopId: string, toStopId: string): string {
    return `${fromStopId}->${toStopId}`;
  }
}

export interface NormalizedAgency {
  id: string;
  name: string;
  shortName: string;
  authority: string;
  website: string;
  sourceUrl: string;
  sourceDatasetId: string;
}

export interface NormalizedRoute {
  id: string;
  agencyId: string;
  shortName: string;
  longName: string;
  routeType: string;
  serviceType: string;
  color?: string;
  sourceDatasetId: string;
}

export interface NormalizedStop {
  id: string;
  agencyId: string;
  name: string;
  lat: number;
  lon: number;
  stationId?: string;
  sourceDatasetId: string;
}

export interface NormalizedTrip {
  id: string;
  routeId: string;
  serviceId: string;
  directionId: number;
  headsign: string;
  sourceDatasetId: string;
}

export interface NormalizedStopTime {
  tripId: string;
  stopId: string;
  arrivalTime: string;
  departureTime: string;
  stopSequence: number;
}

export interface NormalizedCalendar {
  serviceId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startDate: Date;
  endDate: Date;
}

export interface NormalizedTransfer {
  id: string;
  fromStopId: string;
  toStopId: string;
  transferType: number;
  minTransferTime?: number;
  sourceDatasetId: string;
}

export interface NormalizedShapePoint {
  shapeId: string;
  ptLat: number;
  ptLon: number;
  ptSequence: number;
  distTraveled?: number;
  sourceDatasetId: string;
}

export interface NormalizedCalendarDate {
  serviceId: string;
  date: Date;
  exceptionType: number;
  sourceDatasetId: string;
}

export function normalizeAgency(gtfs: GtfsAgency, sourceName: string, datasetId: string): NormalizedAgency {
  return {
    id: IdHasher.hashAgency(sourceName, gtfs.agency_id ?? 'default'),
    name: gtfs.agency_name,
    shortName: gtfs.agency_id ?? 'default',
    authority: sourceName,
    website: gtfs.agency_url,
    sourceUrl: '',
    sourceDatasetId: datasetId,
  };
}

export function normalizeRoute(
  gtfs: GtfsRoute,
  agencyId: string,
  serviceType: string,
  datasetId: string,
): NormalizedRoute {
  return {
    id: gtfs.route_id,
    agencyId,
    shortName: gtfs.route_short_name,
    longName: gtfs.route_long_name,
    routeType: gtfs.route_type,
    serviceType,
    color: gtfs.route_color,
    sourceDatasetId: datasetId,
  };
}

export function normalizeStop(
  gtfs: GtfsStop,
  agencyId: string,
  datasetId: string,
): NormalizedStop {
  return {
    id: gtfs.stop_id,
    agencyId,
    name: gtfs.stop_name,
    lat: parseFloat(gtfs.stop_lat),
    lon: parseFloat(gtfs.stop_lon),
    stationId: gtfs.parent_station,
    sourceDatasetId: datasetId,
  };
}

export function normalizeTrip(gtfs: GtfsTrip, datasetId: string): NormalizedTrip {
  return {
    id: gtfs.trip_id,
    routeId: gtfs.route_id,
    serviceId: gtfs.service_id,
    directionId: gtfs.direction_id ? parseInt(gtfs.direction_id, 10) : 0,
    headsign: gtfs.trip_headsign ?? '',
    sourceDatasetId: datasetId,
  };
}

export function normalizeStopTime(gtfs: GtfsStopTime): NormalizedStopTime {
  return {
    tripId: gtfs.trip_id,
    stopId: gtfs.stop_id,
    arrivalTime: gtfs.arrival_time,
    departureTime: gtfs.departure_time,
    stopSequence: parseInt(gtfs.stop_sequence, 10),
  };
}

export function normalizeCalendar(gtfs: GtfsCalendar): NormalizedCalendar {
  return {
    serviceId: gtfs.service_id,
    monday: gtfs.monday === '1',
    tuesday: gtfs.tuesday === '1',
    wednesday: gtfs.wednesday === '1',
    thursday: gtfs.thursday === '1',
    friday: gtfs.friday === '1',
    saturday: gtfs.saturday === '1',
    sunday: gtfs.sunday === '1',
    startDate: CsvParser.parseDate(gtfs.start_date) ?? new Date(),
    endDate: CsvParser.parseDate(gtfs.end_date) ?? new Date(),
  };
}

export function normalizeTransfer(gtfs: GtfsTransfer, datasetId: string): NormalizedTransfer {
  return {
    id: IdHasher.hashTransfer(gtfs.from_stop_id, gtfs.to_stop_id),
    fromStopId: gtfs.from_stop_id,
    toStopId: gtfs.to_stop_id,
    transferType: parseInt(gtfs.transfer_type, 10),
    minTransferTime: gtfs.min_transfer_time ? parseInt(gtfs.min_transfer_time, 10) : undefined,
    sourceDatasetId: datasetId,
  };
}

export function normalizeShapePoint(gtfs: GtfsShape, datasetId: string): NormalizedShapePoint {
  return {
    shapeId: gtfs.shape_id,
    ptLat: parseFloat(gtfs.shape_pt_lat),
    ptLon: parseFloat(gtfs.shape_pt_lon),
    ptSequence: parseInt(gtfs.shape_pt_sequence, 10),
    distTraveled: gtfs.shape_dist_traveled ? parseFloat(gtfs.shape_dist_traveled) : undefined,
    sourceDatasetId: datasetId,
  };
}

export function normalizeCalendarDate(gtfs: GtfsCalendarDate, datasetId: string): NormalizedCalendarDate {
  return {
    serviceId: gtfs.service_id,
    date: CsvParser.parseDate(gtfs.date) ?? new Date(),
    exceptionType: parseInt(gtfs.exception_type, 10),
    sourceDatasetId: datasetId,
  };
}
