import { PrismaClient, Stop, ServiceCalendar, Transfer } from '@prisma/client';
import {
  Journey, JourneySummary, Segment, SegmentType,
  RoutingRequestDto, OptimizationProfile, LocationPoint,
} from './routing.types';
import {
  ROUTING_WEIGHTS, WALK_SPEED_MPS, BOARDING_PENALTY, TRANSFER_WAIT_PENALTY,
  GeodesicWalkProvider, WalkProvider, haversineDistance,
  parseGtfsTimeToSeconds, secondsToGtfsTime, dateToSeconds,
  AccessibleStop, JourneyStopTime, ExtendedTrip, TransferCandidate,
} from './routing.constants';
import { GtfsValidator } from '../transit/ingestion/validators/gtfs.validator';

const WALK_SEARCH_RADIUS_M = 1500;
const MAX_DIRECT_TRIPS = 30;
const MAX_JOURNEYS = 6;

export class RoutingEngine {
  constructor(
    private prisma: PrismaClient,
    private walkProvider: WalkProvider = new GeodesicWalkProvider(),
  ) {}

  async plan(request: RoutingRequestDto): Promise<{ journeys: Journey[] }> {
    const departureDate = new Date(request.departureTime ?? new Date().toISOString());
    const preference = request.preference ?? OptimizationProfile.FASTEST;

    const serviceIds = await this.getActiveServiceIds(departureDate);
    if (serviceIds.length === 0) {
      return { journeys: [] };
    }

    const originAccess = await this.findNearbyTransitStops(request.origin, WALK_SEARCH_RADIUS_M);
    const destAccess = await this.findNearbyTransitStops(request.destination, WALK_SEARCH_RADIUS_M);

    if (originAccess.length === 0 || destAccess.length === 0) {
      return { journeys: [] };
    }

    const allJourneys: Journey[] = [];
    const exploredKeys = new Set<string>();

    const origins = originAccess.slice(0, 5);
    const dests = destAccess.slice(0, 5);

    for (const originStop of origins) {
      for (const destStop of dests) {
        const directJourney = await this.findDirectJourney(
          originStop, destStop, request.origin, request.destination,
          serviceIds, departureDate, preference,
        );
        if (directJourney && !exploredKeys.has(directJourney.id)) {
          exploredKeys.add(directJourney.id);
          allJourneys.push(directJourney);
        }
      }
    }

    const transferJourneys = await this.findTransferJourneys(
      originAccess.slice(0, 5), destAccess.slice(0, 5),
      request.origin, request.destination,
      serviceIds, departureDate, preference,
    );
    for (const j of transferJourneys) {
      if (!exploredKeys.has(j.id)) {
        exploredKeys.add(j.id);
        allJourneys.push(j);
      }
    }

    const ranked = allJourneys
      .sort((a, b) => this.scoreJourney(a, preference) - this.scoreJourney(b, preference))
      .slice(0, MAX_JOURNEYS)
      .map((j, idx) => ({
        ...j,
        primaryRankingBadge: idx === 0 ? this.badgeLabel(preference) : undefined,
      }));

    return { journeys: ranked };
  }

  private async findDirectJourney(
    originStop: AccessibleStop,
    destStop: AccessibleStop,
    reqOrigin: LocationPoint,
    reqDest: LocationPoint,
    serviceIds: string[],
    departureTime: Date,
    preference: OptimizationProfile,
  ): Promise<Journey | null> {
    const trips = await this.prisma.trip.findMany({
      where: {
        serviceId: { in: serviceIds },
        stopTimes: { some: { stopId: originStop.stop.id } },
      },
      include: { route: { include: { agency: true } }, stopTimes: { orderBy: { stopSequence: 'asc' } } },
      take: MAX_DIRECT_TRIPS,
    });

    for (const rawTrip of trips) {
      const trip = rawTrip as unknown as ExtendedTrip;
      const stopTimes = trip.stopTimes;
      const originST = stopTimes.find(st => st.stopId === originStop.stop.id);
      const destST = stopTimes.find(st => st.stopId === destStop.stop.id);
      if (!originST || !destST) continue;
      if (originST.stopSequence >= destST.stopSequence) continue;

      const departSec = parseGtfsTimeToSeconds(originST.departureTime);
      const arriveSec = parseGtfsTimeToSeconds(destST.arrivalTime);
      const requestedSec = dateToSeconds(departureTime);

      if (departSec < requestedSec) continue;

      const waitSec = departSec - requestedSec;
      const transitSec = arriveSec - departSec;

      const walkFromOrigin = this.walkProvider.getDurationSeconds(
        { lat: reqOrigin.latitude, lon: reqOrigin.longitude },
        { lat: originStop.stop.lat, lon: originStop.stop.lon },
      );
      const walkToDest = this.walkProvider.getDurationSeconds(
        { lat: destStop.stop.lat, lon: destStop.stop.lon },
        { lat: reqDest.latitude, lon: reqDest.longitude },
      );

      const segments: Segment[] = [
        {
          type: SegmentType.WALK,
          durationSeconds: walkFromOrigin,
          distanceMeters: walkFromOrigin * WALK_SPEED_MPS,
          instruction: `Jalan ke ${originStop.stop.name}`,
          fromName: reqOrigin.name ?? 'Origin',
          toName: originStop.stop.name,
          fromLat: reqOrigin.latitude,
          fromLon: reqOrigin.longitude,
          toLat: originStop.stop.lat,
          toLon: originStop.stop.lon,
        },
        {
          type: SegmentType.WAIT,
          durationSeconds: waitSec,
          instruction: `Tunggu sekitar ${Math.round(waitSec / 60)} menit`,
          fromName: originStop.stop.name,
          toName: originStop.stop.name,
          fromLat: originStop.stop.lat,
          fromLon: originStop.stop.lon,
          toLat: originStop.stop.lat,
          toLon: originStop.stop.lon,
          departureTime: originST.departureTime,
        },
        {
          type: SegmentType.TRANSIT,
          durationSeconds: transitSec,
          instruction: `Naik ${trip.route.shortName ?? trip.route.longName} arah ${trip.headsign}`,
          fromName: originStop.stop.name,
          toName: destStop.stop.name,
          fromLat: originStop.stop.lat,
          fromLon: originStop.stop.lon,
          toLat: destStop.stop.lat,
          toLon: destStop.stop.lon,
          routeShortName: trip.route.shortName ?? undefined,
          routeLongName: trip.route.longName,
          routeColor: trip.route.color ?? undefined,
          serviceType: trip.route.serviceType,
          agencyName: trip.route.agency?.name ?? undefined,
          tripHeadsign: trip.headsign,
          departureTime: originST.departureTime,
          arrivalTime: destST.arrivalTime,
          intermediateStopsCount: destST.stopSequence - originST.stopSequence - 1,
        },
        {
          type: SegmentType.WALK,
          durationSeconds: walkToDest,
          distanceMeters: walkToDest * WALK_SPEED_MPS,
          instruction: `Jalan ke ${reqDest.name ?? 'Destination'}`,
          fromName: destStop.stop.name,
          toName: reqDest.name ?? 'Destination',
          fromLat: destStop.stop.lat,
          fromLon: destStop.stop.lon,
          toLat: reqDest.latitude,
          toLon: reqDest.longitude,
        },
      ];

      const totalWalk = walkFromOrigin + walkToDest;
      const totalDuration = walkFromOrigin + waitSec + transitSec + walkToDest;
      const journey: Journey = {
        id: `direct:${trip.id}:${originStop.stop.id}->${destStop.stop.id}`,
        origin: reqOrigin,
        destination: reqDest,
        requestedDepartureTime: departureTime.toISOString(),
        departureTime: secondsToGtfsTime(departSec),
        arrivalTime: destST.arrivalTime,
        summary: {
          totalDurationSeconds: totalDuration + BOARDING_PENALTY * 2,
          transitDurationSeconds: transitSec,
          walkingDurationSeconds: totalWalk,
          walkingDistanceMeters: totalWalk * WALK_SPEED_MPS,
          waitingDurationSeconds: waitSec,
          transferCount: 0,
          fareText: 'Tarif tidak tersedia',
          badge: this.badgeLabel(preference),
        },
        segments,
        primaryRankingBadge: undefined,
      };

      return journey;
    }

    return null;
  }

  private async findTransferJourneys(
    origins: AccessibleStop[],
    dests: AccessibleStop[],
    reqOrigin: LocationPoint,
    reqDest: LocationPoint,
    serviceIds: string[],
    departureTime: Date,
    preference: OptimizationProfile,
  ): Promise<Journey[]> {
    const journeys: Journey[] = [];

    for (const originStop of origins.slice(0, 3)) {
      const firstLegTrips = await this.prisma.trip.findMany({
        where: {
          serviceId: { in: serviceIds },
          stopTimes: { some: { stopId: originStop.stop.id } },
        },
        include: { route: { include: { agency: true } }, stopTimes: { orderBy: { stopSequence: 'asc' } } },
        take: 20,
      });

      for (const rawTrip of firstLegTrips) {
        const trip = rawTrip as unknown as ExtendedTrip;
        const stopTimes = trip.stopTimes;
        const boardST = stopTimes.find(st => st.stopId === originStop.stop.id);
        if (!boardST) continue;

        const departSec = parseGtfsTimeToSeconds(boardST.departureTime);
        const requestedSec = dateToSeconds(departureTime);
        if (departSec < requestedSec) continue;

        for (const destStop of dests.slice(0, 3)) {
          const alightST = stopTimes.find(st => st.stopId === destStop.stop.id);
          if (alightST && boardST.stopSequence < alightST.stopSequence) continue;

          // Find transfer candidates at this stop
          const transferCandidates = await this.findTransferCandidates(
            boardST, stopTimes, alightST, trip, originStop, destStop,
            serviceIds, departSec, reqOrigin, reqDest, preference,
          );

          for (const tc of transferCandidates) {
            const journey = await this.buildTransferJourney(
              originStop, destStop, reqOrigin, reqDest,
              trip, boardST, tc, stopTimes, preference,
            );
            if (journey) journeys.push(journey);
          }
        }
      }
    }

    return journeys.slice(0, MAX_JOURNEYS);
  }

  private async findTransferCandidates(
    boardST: JourneyStopTime,
    stopTimes: JourneyStopTime[],
    _alightST: JourneyStopTime | undefined,
    trip: ExtendedTrip,
    originStop: AccessibleStop,
    destStop: AccessibleStop,
    serviceIds: string[],
    departSec: number,
    reqOrigin: LocationPoint,
    reqDest: LocationPoint,
    preference: OptimizationProfile,
  ): Promise<TransferCandidate[]> {
    const candidates: TransferCandidate[] = [];

    // Transfer stops: stops shared between this trip and other trips
    const transferStops = new Set<string>();
    for (const st of stopTimes) {
      if (st.stopId === boardST.stopId) continue;
      transferStops.add(st.stopId);
    }

    if (transferStops.size === 0) return [];

    // Find alternate trips serving these transfer stops
    const alternateTrips = await this.prisma.trip.findMany({
      where: {
        serviceId: { in: serviceIds },
        stopTimes: { some: { stopId: { in: Array.from(transferStops) } } },
      },
      include: { route: { include: { agency: true } }, stopTimes: { orderBy: { stopSequence: 'asc' } } },
      take: 60,
    });

    for (const altRaw of alternateTrips) {
      if (altRaw.id === trip.id) continue;
      const altTrip = altRaw as unknown as ExtendedTrip;

      for (const st of altTrip.stopTimes) {
        if (st.stopId === boardST.stopId) continue;
        if (st.stopSequence <= boardST.stopSequence) continue;

        for (const destST of altTrip.stopTimes) {
          if (destST.stopId !== destStop.stop.id) continue;
          if (destST.stopSequence <= st.stopSequence) continue;

          const transferST = st;
          const transferTime = parseGtfsTimeToSeconds(transferST.arrivalTime);
          const transferWait = transferTime - departSec;
          if (transferWait < 0) continue;

          const altDepartSec = parseGtfsTimeToSeconds(destST.departureTime);
          const altArriveSec = parseGtfsTimeToSeconds(destST.arrivalTime);

          const walkDist = haversineDistance(
            boardST.stopLat, boardST.stopLon,
            transferST.stopLat, transferST.stopLon,
          );

          candidates.push({
            fromTripId: trip.id,
            toTripId: altTrip.id,
            transferStopId: transferST.stopId,
            waitSeconds: transferWait,
            walkDistance: walkDist,
          });
        }
      }
    }

    return candidates.slice(0, 5);
  }

  private async buildTransferJourney(
    originStop: AccessibleStop,
    destStop: AccessibleStop,
    reqOrigin: LocationPoint,
    reqDest: LocationPoint,
    firstTrip: ExtendedTrip,
    boardST: JourneyStopTime,
    tc: TransferCandidate,
    firstStopTimes: JourneyStopTime[],
    preference: OptimizationProfile,
  ): Promise<Journey | null> {
    const transferST = firstStopTimes.find(st => st.stopId === tc.transferStopId);
    if (!transferST) return null;

    const altTrip = await this.prisma.trip.findUnique({
      where: { id: tc.toTripId },
      include: { route: { include: { agency: true } }, stopTimes: { orderBy: { stopSequence: 'asc' } } },
    }) as unknown as ExtendedTrip | null;
    if (!altTrip) return null;

    const altBoardST = altTrip.stopTimes.find(st => st.stopId === tc.transferStopId);
    const altAlightST = altTrip.stopTimes.find(st => st.stopId === destStop.stop.id);
    if (!altBoardST || !altAlightST) return null;
    if (altBoardST.stopSequence >= altAlightST.stopSequence) return null;

    const departSec = parseGtfsTimeToSeconds(boardST.departureTime);
    const transferArriveSec = parseGtfsTimeToSeconds(transferST.arrivalTime);
    const altDepartSec = parseGtfsTimeToSeconds(altBoardST.departureTime);
    const altArriveSec = parseGtfsTimeToSeconds(altAlightST.arrivalTime);

    const wait1 = transferArriveSec - departSec;
    const transferWalk = this.walkProvider.getDurationSeconds(
      { lat: transferST.stopLat, lon: transferST.stopLon },
      { lat: transferST.stopLat, lon: transferST.stopLon },
    );
    const waitAtTransfer = altDepartSec - transferArriveSec;
    const transit1 = transferArriveSec - departSec;
    const transit2 = altArriveSec - altDepartSec;

    const walkFromOrigin = this.walkProvider.getDurationSeconds(
      { lat: reqOrigin.latitude, lon: reqOrigin.longitude },
      { lat: originStop.stop.lat, lon: originStop.stop.lon },
    );
    const walkToDest = this.walkProvider.getDurationSeconds(
      { lat: destStop.stop.lat, lon: destStop.stop.lon },
      { lat: reqDest.latitude, lon: reqDest.longitude },
    );

    const segments: Segment[] = [
      {
        type: SegmentType.WALK,
        durationSeconds: walkFromOrigin,
        distanceMeters: walkFromOrigin * WALK_SPEED_MPS,
        instruction: `Jalan ke ${originStop.stop.name}`,
        fromName: reqOrigin.name ?? 'Origin',
        toName: originStop.stop.name,
        fromLat: reqOrigin.latitude,
        fromLon: reqOrigin.longitude,
        toLat: originStop.stop.lat,
        toLon: originStop.stop.lon,
      },
      {
        type: SegmentType.WAIT,
        durationSeconds: 0,
        instruction: `Tunggu naik ${firstTrip.route.shortName ?? firstTrip.route.longName}`,
        fromName: originStop.stop.name,
        toName: originStop.stop.name,
        fromLat: originStop.stop.lat,
        fromLon: originStop.stop.lon,
        toLat: originStop.stop.lat,
        toLon: originStop.stop.lon,
        departureTime: boardST.departureTime,
      },
      {
        type: SegmentType.TRANSIT,
        durationSeconds: transit1,
        instruction: `Naik ${firstTrip.route.shortName ?? firstTrip.route.longName} arah ${firstTrip.headsign} ke ${transferST.stopName}`,
        fromName: originStop.stop.name,
        toName: transferST.stopName,
        fromLat: originStop.stop.lat,
        fromLon: originStop.stop.lon,
        toLat: transferST.stopLat,
        toLon: transferST.stopLon,
        routeShortName: firstTrip.route.shortName ?? undefined,
        routeLongName: firstTrip.route.longName,
        routeColor: firstTrip.route.color ?? undefined,
        serviceType: firstTrip.route.serviceType,
        agencyName: firstTrip.route.agency?.name ?? undefined,
        tripHeadsign: firstTrip.headsign,
        departureTime: boardST.departureTime,
        arrivalTime: transferST.arrivalTime,
      },
      {
        type: SegmentType.TRANSFER,
        durationSeconds: transferWalk + waitAtTransfer,
        distanceMeters: WALK_SPEED_MPS * transferWalk,
        instruction: `Transfer ke ${altTrip.route.shortName ?? altTrip.route.longName}`,
        fromName: transferST.stopName,
        toName: transferST.stopName,
        fromLat: transferST.stopLat,
        fromLon: transferST.stopLon,
        toLat: transferST.stopLat,
        toLon: transferST.stopLon,
        departureTime: altBoardST.departureTime,
      },
      {
        type: SegmentType.TRANSIT,
        durationSeconds: transit2,
        instruction: `Naik ${altTrip.route.shortName ?? altTrip.route.longName} arah ${altTrip.headsign}`,
        fromName: transferST.stopName,
        toName: destStop.stop.name,
        fromLat: transferST.stopLat,
        fromLon: transferST.stopLon,
        toLat: destStop.stop.lat,
        toLon: destStop.stop.lon,
        routeShortName: altTrip.route.shortName ?? undefined,
        routeLongName: altTrip.route.longName,
        routeColor: altTrip.route.color ?? undefined,
        serviceType: altTrip.route.serviceType,
        agencyName: altTrip.route.agency?.name ?? undefined,
        tripHeadsign: altTrip.headsign,
        departureTime: altBoardST.departureTime,
        arrivalTime: altAlightST.arrivalTime,
      },
      {
        type: SegmentType.WALK,
        durationSeconds: walkToDest,
        distanceMeters: walkToDest * WALK_SPEED_MPS,
        instruction: `Jalan ke ${reqDest.name ?? 'Destination'}`,
        fromName: destStop.stop.name,
        toName: reqDest.name ?? 'Destination',
        fromLat: destStop.stop.lat,
        fromLon: destStop.stop.lon,
        toLat: reqDest.latitude,
        toLon: reqDest.longitude,
      },
    ];

    const totalWalk = walkFromOrigin + transferWalk + walkToDest;
    const totalDuration = walkFromOrigin + transit1 + transferWalk + waitAtTransfer + transit2 + walkToDest + BOARDING_PENALTY * 2;

    const journey: Journey = {
      id: `transfer:${firstTrip.id}->${altTrip.id}:${originStop.stop.id}->${transferST.stopId}->${destStop.stop.id}`,
      origin: reqOrigin,
      destination: reqDest,
      requestedDepartureTime: new Date().toISOString(),
      departureTime: boardST.departureTime,
      arrivalTime: altAlightST.arrivalTime,
      summary: {
        totalDurationSeconds: totalDuration,
        transitDurationSeconds: transit1 + transit2,
        walkingDurationSeconds: totalWalk,
        walkingDistanceMeters: totalWalk * WALK_SPEED_MPS,
        waitingDurationSeconds: waitAtTransfer,
        transferCount: 1,
        fareText: 'Tarif tidak tersedia',
        badge: this.badgeLabel(preference),
      },
      segments,
      primaryRankingBadge: undefined,
    };

    return journey;
  }

  private async findNearbyTransitStops(point: LocationPoint, radiusM: number): Promise<AccessibleStop[]> {
    const latDelta = radiusM / 111000;
    const lonDelta = radiusM / (111000 * Math.cos((point.latitude * Math.PI) / 180));

    const stops = await this.prisma.stop.findMany({
      where: {
        lat: { gte: point.latitude - latDelta, lte: point.latitude + latDelta },
        lon: { gte: point.longitude - lonDelta, lte: point.longitude + lonDelta },
      },
    });

    return stops
      .map(stop => {
        const distance = haversineDistance(point.latitude, point.longitude, stop.lat, stop.lon);
        const walkDuration = Math.round(distance / WALK_SPEED_MPS);
        return { stop, distance, walkDuration };
      })
      .filter(s => s.distance <= radiusM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }

  private async getActiveServiceIds(date: Date): Promise<string[]> {
    const dayOfWeek = date.getDay();
    const dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Prisma boolean field name for day of week
    const dayField = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][(dayOfWeek + 6) % 7];

    const calendars = await this.prisma.serviceCalendar.findMany({
      where: {
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
      },
    });

    // Filter by day of week in application layer
    return calendars
      .filter(c => c[dayField as keyof ServiceCalendar] === true)
      .map(c => c.serviceId);
  }

  private scoreJourney(journey: Journey, preference: OptimizationProfile): number {
    const w = ROUTING_WEIGHTS[preference];
    if (!w) return journey.summary.totalDurationSeconds;

    let score = 0;
    score += journey.summary.totalDurationSeconds * w.travelTime;
    score += journey.summary.transferCount * w.transfer;
    score += journey.summary.walkingDurationSeconds * w.walk;
    score += journey.summary.waitingDurationSeconds * w.wait;
    return score;
  }

  private badgeLabel(preference: OptimizationProfile): string {
    switch (preference) {
      case OptimizationProfile.FASTEST: return 'Tercepat';
      case OptimizationProfile.FEWEST_TRANSFERS: return 'Minim Transit';
      case OptimizationProfile.LEAST_WALKING: return 'Minim Jalan';
      case OptimizationProfile.SIMPLEST: return 'Paling Sederhana';
      default: return 'Tercepat';
    }
  }
}
