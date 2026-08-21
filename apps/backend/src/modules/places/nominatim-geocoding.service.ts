import { Injectable } from '@nestjs/common';
import { GeocodingService, GeocodingResult } from './geocoding.port';

@Injectable()
export class NominatimGeocodingService implements GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'TRANSUM-IN/1.0 (support@transum-in.id)';

  async forwardSearch(query: string): Promise<GeocodingResult[]> {
    const url =
      `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=10&email=transum-in@noreply.local`;

    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });

    if (!res.ok) return [];

    const raw = await res.json();
    return raw.map((item: any) => this.normalize(item));
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
    const url =
      `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lon}&email=transum-in@noreply.local`;

    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });

    if (!res.ok) return null;

    const item = await res.json();
    return {
      id: item.osm_id?.toString(),
      name: item.display_name || '',
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: 'generic',
      source: 'openstreetmap_nominatim',
      metadata: {
        country: item.address?.country,
        city: item.address?.city || item.address?.town,
        postcode: item.address?.postcode,
      },
    };
  }

  private normalize(item: any): GeocodingResult {
    return {
      id: item.osm_id?.toString(),
      name: item.display_name || '',
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: 'generic',
      source: 'openstreetmap_nominatim',
      metadata: {
        importance: item.importance,
        class: item.class,
        type: item.type,
      },
    };
  }
}
