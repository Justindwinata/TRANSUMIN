import * as fs from 'fs';
import * as path from 'path';
import {
  GtfsAgency,
  GtfsRoute,
  GtfsStop,
  GtfsTrip,
  GtfsStopTime,
  GtfsCalendar,
  GtfsTransfer,
  IngestionReport,
} from '../gtfs.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class GtfsValidator {
  static validateCoordinates(lat: number, lon: number): boolean {
    // Jabodetabek approximate bounding box: lat -7.0 to -5.8, lon 106.5 to 107.2
    return lat >= -7.5 && lat <= -5.5 && lon >= 106.0 && lon <= 107.8;
  }

  static validateTime(timeStr: string): boolean {
    // GTFS time can exceed 24:00:00 (e.g. 25:30:00)
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
    if (!route.route_type || isNaN(parseInt(route.route_type, 10))) {
      errors.push('Route type is required and must be numeric');
    } else {
      const type = parseInt(route.route_type, 10);
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

  static validateStop(stop: GtfsStop, stopIdSet: Set<string>): ValidationResult {
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

  static validateTrip(trip: GtfsTrip, routeIdSet: Set<string>, serviceIdSet: Set<string>, shapeIdSet: Set<string>): ValidationResult {
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
      const dir = parseInt(trip.direction_id, 10);
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

  static validateStopTime(stopTime: GtfsStopTime, tripIdSet: Set<string>, stopIdSet: Set<string>): ValidationResult {
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
    if (stopTime.stop_sequence === undefined || stopTime.stop_sequence === null || isNaN(parseInt(stopTime.stop_sequence, 10))) {
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
      const val = calendar[day as keyof GtfsCalendar];
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
      const type = parseInt(transfer.transfer_type, 10);
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

  static validateAll(
    agencies: GtfsAgency[],
    routes: GtfsRoute[],
    stops: GtfsStop[],
    trips: GtfsTrip[],
    stopTimes: GtfsStopTime[],
    calendars: GtfsCalendar[],
    transfers: GtfsTransfer[],
    shapeIdSet: Set<string>
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
    };
  } {
    const agencyIdSet = new Set(agencies.map(a => a.agency_id ?? 'default'));
    const routeIdSet = new Set(routes.map(r => r.route_id));
    const stopIdSet = new Set(stops.map(s => s.stop_id));
    const tripIdSet = new Set(trips.map(t => t.trip_id));
    const serviceIdSet = new Set(calendars.map(c => c.service_id));

    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    const agencyResults = agencies.map(a => this.validateAgency(a));
    const routeResults = routes.map(r => this.validateRoute(r, agencyIdSet));
    const stopResults = stops.map(s => this.validateStop(s, stopIdSet));
    const tripResults = trips.map(t => this.validateTrip(t, routeIdSet, serviceIdSet, shapeIdSet));
    const stopTimeResults = stopTimes.map(st => this.validateStopTime(st, tripIdSet, stopIdSet));
    const calendarResults = calendars.map(c => this.validateCalendar(c));
    const transferResults = transfers.map(t => this.validateTransfer(t, stopIdSet));

    // Collect all errors and warnings
    [...agencyResults, ...routeResults, ...stopResults, ...tripResults, ...stopTimeResults, ...calendarResults, ...transferResults]
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
      },
    };
  }
}
