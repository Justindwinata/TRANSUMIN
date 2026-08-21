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
}
