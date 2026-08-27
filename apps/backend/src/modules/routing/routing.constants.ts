import { LocationPoint, OptimizationProfile } from './routing.types';
import { Stop, Trip } from '@prisma/client';

export const ROUTING_WEIGHTS: Record<string, { travelTime: number; transfer: number; walk: number; wait: number }> = {
  [OptimizationProfile.FASTEST]: { travelTime: 1.0, transfer: 50, walk: 2, wait: 2 },
  [OptimizationProfile.FEWEST_TRANSFERS]: { travelTime: 0.3, transfer: 500, walk: 5, wait: 5 },
  [OptimizationProfile.LEAST_WALKING]: { travelTime: 0.8, transfer: 50, walk: 0.5, wait: 3 },
  [OptimizationProfile.SIMPLEST]: { travelTime: 0.5, transfer: 200, walk: 3, wait: 3 },
};

export const WALK_SPEED_MPS = 1.4;
export const BOARDING_PENALTY = 30;
export const TRANSFER_WAIT_PENALTY = 60;

export interface WalkProvider {
  getDistanceMeters(from: { lat: number; lon: number }, to: { lat: number; lon: number }): number;
  getDurationSeconds(from: { lat: number; lon: number }, to: { lat: number; lon: number }): number;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class GeodesicWalkProvider implements WalkProvider {
  getDistanceMeters(from: { lat: number; lon: number }, to: { lat: number; lon: number }): number {
    return haversineDistance(from.lat, from.lon, to.lat, to.lon);
  }
  getDurationSeconds(from: { lat: number; lon: number }, to: { lat: number; lon: number }): number {
    const meters = this.getDistanceMeters(from, to);
    return Math.round(meters / WALK_SPEED_MPS);
  }
}

export interface AccessibleStop {
  stop: Stop;
  distance: number;
  walkDuration: number;
}

export function parseGtfsTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToGtfsTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function dateToSeconds(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

export interface JourneyStopTime {
  stopId: string;
  arrivalTime: string;
  departureTime: string;
  stopSequence: number;
  stopName: string;
  stopLat: number;
  stopLon: number;
}

export interface ExtendedTrip extends Trip {
  stopTimes: JourneyStopTime[];
  route: {
    shortName: string | null;
    longName: string;
    color: string | null;
    serviceType: string;
    agency?: { name: string } | null;
  };
}

export interface TransferCandidate {
  fromTripId: string;
  toTripId: string;
  transferStopId: string;
  toStopId?: string;
  waitSeconds: number;
  walkDistance: number;
  minTransferTime?: number;
  fromOperator?: string;
  toOperator?: string;
  confidence?: number;
}
