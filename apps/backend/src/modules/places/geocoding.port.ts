// GeocodingService: abstract contract for geocoding providers.

export interface GeocodingResult {
  id?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: PlaceType;
  source: string;
  metadata?: Record<string, any>;
}

export type PlaceType =
  | 'landmark'
  | 'station'
  | 'stop'
  | 'savedPlace'
  | 'recentSearch'
  | 'generic';

export interface GeocodingService {
  forwardSearch(query: string): Promise<GeocodingResult[]>;
  reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null>;
}

export interface NormalizedPlace {
  id?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: PlaceType;
  source: string;
  metadata?: Record<string, any>;
}
