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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class GtfsValidator {
  static validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -7.5 && lat <= -5.5 && lon >= 106.0 && lon <= 107.8;
  }

  static validateTime(timeStr: string): boolean {
    if (!timeStr || typeof timeStr !== 'string') return false;
    const parts = timeStr.split(':');
    if (parts.length !== 3) return false;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    return !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60;
  }

  static validateAgency(agency: GtfsAgency): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!agency.agency_name || agency.agency_name.trim() === '') {
      errors.push('Agency name is required');
    }
    if (!agency.agency_url || agency.agency_url.trim() === '') {
      warnings.push('Agency URL is recommended');
    }
    if (!agency.agency_timezone || agency.agency_timezone.trim() === '') {
      errors.push('Agency timezone is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateRoute(route: GtfsRoute, agencyIdSet: Set<string>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!route.route_id || route.route_id.trim() === '') {
      errors.push('Route ID is required');
    }
    if (!route.agency_id || !agencyIdSet.has(route.agency_id)) {
      errors.push(`Route references unknown agency_id: ${route.agency_id}`);
    }
    if (!route.route_short_name || route.route_short_name.trim() === '') {
      warnings.push('Route short name is recommended');
    }
    if (!route.route_long_name || route.route_long_name.trim() === '') {
      warnings.push('Route long name is recommended');
    }
    const typeStr = route.route_type?.toString();
    if (!route.route_type || !typeStr || isNaN(parseInt(typeStr, 10))) {
      errors.push('Route type is required and must be numeric');
    } else {
      const type = parseInt(typeStr, 10);
      if (type < 0 || type > 7) {
        warnings.push(`Route type ${type} is non-standard`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateStop(stop: GtfsStop, _stopIdSet: Set<string>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!stop.stop_id || stop.stop_id.trim() === '') {
      errors.push('Stop ID is required');
    }
    if (!stop.stop_name || stop.stop_name.trim() === '') {
      warnings.push('Stop name is recommended');
    }
    const lat = parseFloat(stop.stop_lat);
    const lon = parseFloat(stop.stop_lon);
    if (isNaN(lat) || isNaN(lon)) {
      errors.push('Stop coordinates must be valid numbers');
    } else if (!this.validateCoordinates(lat, lon)) {
      warnings.push(`Stop coordinates (${lat}, ${lon}) outside Jabodetabek bounds`);
    }
    if (stop.zone_id && stop.zone_id.trim() !== '') {
      warnings.push('Zone ID provided - ensure fare rules are consistent');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateTrip(
    trip: GtfsTrip,
    routeIdSet: Set<string>,
    serviceIdSet: Set<string>,
    shapeIdSet: Set<string>,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!trip.trip_id || trip.trip_id.trim() === '') {
      errors.push('Trip ID is required');
    }
    if (!trip.route_id || !routeIdSet.has(trip.route_id)) {
      errors.push(`Trip references unknown route_id: ${trip.route_id}`);
    }
    if (!trip.service_id || !serviceIdSet.has(trip.service_id)) {
      errors.push(`Trip references unknown service_id: ${trip.service_id}`);
    }
    if (trip.shape_id && !shapeIdSet.has(trip.shape_id)) {
      warnings.push(`Trip references unknown shape_id: ${trip.shape_id}`);
    }
    if (!trip.trip_headsign || trip.trip_headsign.trim() === '') {
      warnings.push('Trip headsign is recommended');
    }
    if (trip.direction_id !== undefined && trip.direction_id !== null) {
      const dirStr = trip.direction_id.toString();
      const dir = parseInt(dirStr, 10);
      if (isNaN(dir) || (dir !== 0 && dir !== 1)) {
        errors.push('Direction ID must be 0 or 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateStopTime(
    stopTime: GtfsStopTime,
    tripIdSet: Set<string>,
    stopIdSet: Set<string>,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!stopTime.trip_id || !tripIdSet.has(stopTime.trip_id)) {
      errors.push(`StopTime references unknown trip_id: ${stopTime.trip_id}`);
    }
    if (!stopTime.stop_id || !stopIdSet.has(stopTime.stop_id)) {
      errors.push(`StopTime references unknown stop_id: ${stopTime.stop_id}`);
    }
    if (!stopTime.arrival_time || !this.validateTime(stopTime.arrival_time)) {
      errors.push('StopTime arrival_time is required and must be valid HH:MM:SS');
    }
    if (!stopTime.departure_time || !this.validateTime(stopTime.departure_time)) {
      errors.push('StopTime departure_time is required and must be valid HH:MM:SS');
    }
    const seqStr = stopTime.stop_sequence?.toString();
    if (!stopTime.stop_sequence || !seqStr || isNaN(parseInt(seqStr, 10))) {
      errors.push('StopTime stop_sequence is required and must be numeric');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateCalendar(calendar: GtfsCalendar): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!calendar.service_id || calendar.service_id.trim() === '') {
      errors.push('Service ID is required');
    }
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
      const val = calendar[day as keyof GtfsCalendar] as string;
      if (val === undefined || val === null || (val !== '0' && val !== '1')) {
        errors.push(`Calendar ${day} must be 0 or 1`);
      }
    });
    if (!calendar.start_date || calendar.start_date.length !== 8) {
      errors.push('Calendar start_date must be YYYYMMDD');
    }
    if (!calendar.end_date || calendar.end_date.length !== 8) {
      errors.push('Calendar end_date must be YYYYMMDD');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateTransfer(transfer: GtfsTransfer, stopIdSet: Set<string>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!transfer.from_stop_id || !stopIdSet.has(transfer.from_stop_id)) {
      errors.push(`Transfer from_stop_id references unknown stop: ${transfer.from_stop_id}`);
    }
    if (!transfer.to_stop_id || !stopIdSet.has(transfer.to_stop_id)) {
      errors.push(`Transfer to_stop_id references unknown stop: ${transfer.to_stop_id}`);
    }
    if (transfer.transfer_type !== undefined && transfer.transfer_type !== null) {
      const typeStr = transfer.transfer_type.toString();
      const type = parseInt(typeStr, 10);
      if (isNaN(type) || type < 0 || type > 3) {
        errors.push('Transfer type must be 0, 1, 2, or 3');
      }
    }
    if (transfer.min_transfer_time !== undefined && transfer.min_transfer_time !== null && transfer.min_transfer_time !== '') {
      const minTime = parseInt(transfer.min_transfer_time, 10);
      if (isNaN(minTime) || minTime < 0) {
        warnings.push('Min transfer time should be non-negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateShapePoint(shape: GtfsShape): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!shape.shape_id || shape.shape_id.trim() === '') {
      errors.push('Shape point shape_id is required');
    }
    const lat = parseFloat(shape.shape_pt_lat);
    const lon = parseFloat(shape.shape_pt_lon);
    if (isNaN(lat) || isNaN(lon)) {
      errors.push('Shape point coordinates must be valid numbers');
    } else if (!this.validateCoordinates(lat, lon)) {
      warnings.push(`Shape point coordinates (${lat}, ${lon}) outside Jabodetabek bounds`);
    }
    const seqStr = shape.shape_pt_sequence.toString();
    if (isNaN(parseInt(seqStr, 10))) {
      errors.push('Shape point sequence must be numeric');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateCalendarDate(date: GtfsCalendarDate): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!date.service_id || date.service_id.trim() === '') {
      errors.push('Calendar date service_id is required');
    }
    if (!date.date || !/^\d{8}$/.test(date.date)) {
      errors.push('Calendar date must be YYYYMMDD format');
    } else {
      const parsed = this.parseDate(date.date);
      if (!parsed) {
        errors.push(`Calendar date ${date.date} is invalid`);
      }
    }
    const excTypeStr = date.exception_type.toString();
    const excType = parseInt(excTypeStr, 10);
    if (isNaN(excType) || excType < 1 || excType > 2) {
      errors.push('Calendar date exception_type must be 1 (added) or 2 (removed)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static parseDate(yyyymmdd: string): Date | null {
    if (!/^\d{8}$/.test(yyyymmdd)) return null;
    const year = parseInt(yyyymmdd.slice(0, 4), 10);
    const month = parseInt(yyyymmdd.slice(4, 6), 10);
    const day = parseInt(yyyymmdd.slice(6, 8), 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return new Date(year, month - 1, day);
  }

  static validateAll(
    agencies: GtfsAgency[],
    routes: GtfsRoute[],
    stops: GtfsStop[],
    trips: GtfsTrip[],
    stopTimes: GtfsStopTime[],
    calendars: GtfsCalendar[],
    transfers: GtfsTransfer[],
    shapes: GtfsShape[] = [],
    calendarDates: GtfsCalendarDate[] = [],
  ): {
    overall: ValidationResult;
    details: {
      agencies: ValidationResult[];
      routes: ValidationResult[];
      stops: ValidationResult[];
      trips: ValidationResult[];
      stopTimes: ValidationResult[];
      calendars: ValidationResult[];
      transfers: ValidationResult[];
      shapes: ValidationResult[];
      calendarDates: ValidationResult[];
    };
  } {
    const agencyIdSet = new Set(Array.isArray(agencies) ? agencies.map(a => a.agency_id ?? 'default') : []);
    const routeIdSet = new Set(Array.isArray(routes) ? routes.map(r => r.route_id) : []);
    const stopIdSet = new Set(Array.isArray(stops) ? stops.map(s => s.stop_id) : []);
    const tripIdSet = new Set(Array.isArray(trips) ? trips.map(t => t.trip_id) : []);
    const shapeIds = Array.isArray(shapes) ? shapes.map(sh => sh.shape_id) : [];
    const serviceIdSet = new Set([
      ...(Array.isArray(calendars) ? calendars.map(c => c.service_id) : []),
      ...(Array.isArray(calendarDates) ? calendarDates.map(d => d.service_id) : []),
    ]);

    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const agencyResults = agencies.map(a => this.validateAgency(a));
    const routeResults = Array.isArray(routes) ? routes.map(r => this.validateRoute(r, agencyIdSet)) : [];
    const stopResults = Array.isArray(stops) ? stops.map(s => this.validateStop(s, stopIdSet)) : [];
    const tripResults = Array.isArray(trips) ? trips.map(t => this.validateTrip(t, routeIdSet, serviceIdSet, new Set(shapeIds))) : [];
    const stopTimeResults = Array.isArray(stopTimes) ? stopTimes.map(st => this.validateStopTime(st, tripIdSet, stopIdSet)) : [];
    const calendarResults = Array.isArray(calendars) ? calendars.map(c => this.validateCalendar(c)) : [];
    const transferResults = Array.isArray(transfers) ? transfers.map(t => this.validateTransfer(t, stopIdSet)) : [];
    const shapeResults = Array.isArray(shapes) ? shapes.map(sh => this.validateShapePoint(sh)) : [];
    const calendarDateResults = Array.isArray(calendarDates) ? calendarDates.map(d => this.validateCalendarDate(d)) : [];

    [...agencyResults, ...routeResults, ...stopResults, ...tripResults, ...stopTimeResults, ...calendarResults, ...transferResults, ...shapeResults, ...calendarDateResults]
      .forEach(r => {
        allErrors.push(...r.errors);
        allWarnings.push(...r.warnings);
      });

    return {
      overall: {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
      },
      details: {
        agencies: agencyResults,
        routes: routeResults,
        stops: stopResults,
        trips: tripResults,
        stopTimes: stopTimeResults,
        calendars: calendarResults,
        transfers: transferResults,
        shapes: shapeResults,
        calendarDates: calendarDateResults,
      },
    };
  }
}
