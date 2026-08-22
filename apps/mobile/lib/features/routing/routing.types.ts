export class JourneyRequest {
  origin: { latitude: number; longitude: number; name?: string };
  destination: { latitude: number; longitude: number; name?: string };
  departureTime?: DateTime;
  preference?: string;
}

export class RouteAlternative {
  id: string;
  origin: { latitude: number; longitude: number; name?: string };
  destination: { latitude: number; longitude: number; name?: string };
  departureTime: string;
  arrivalTime: string;
  totalDurationSeconds: number;
  transferCount: number;
  walkingDistanceMeters: number;
  fareText: string;
  badge?: string;
  segments: JourneySegment[];

  static fromJson(json: any): RouteAlternative {
    return {
      id: json.id,
      origin: json.origin,
      destination: json.destination,
      departureTime: json.departureTime,
      arrivalTime: json.arrivalTime,
      totalDurationSeconds: json.summary.totalDurationSeconds,
      transferCount: json.summary.transferCount,
      walkingDistanceMeters: json.summary.walkingDistanceMeters,
      fareText: json.summary.fareText,
      badge: json.primaryRankingBadge,
      segments: (json.segments || []).map((s: any) => ({
        type: s.type,
        duration: s.durationSeconds,
        distance: s.distanceMeters,
        instruction: s.instruction,
        from: s.fromName,
        to: s.toName,
        routeName: s.routeShortName || s.routeLongName,
        departure: s.departureTime,
        arrival: s.arrivalTime,
      })),
    };
  }
}

export class JourneySegment {
  type: string;
  duration: number;
  distance?: number;
  instruction: string;
  from: string;
  to: string;
  routeName?: string;
  departure?: string;
  arrival?: string;
}
