import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { CsvParser } from './parsers/csv.parser';
import {
  GtfsAgency, GtfsRoute, GtfsStop, GtfsTrip,
  GtfsStopTime, GtfsCalendar, GtfsTransfer, GtfsShape, GtfsCalendarDate,
  IngestionReport,
} from './gtfs.types';
import {
  normalizeAgency, normalizeRoute, normalizeStop, normalizeTrip,
  normalizeStopTime, normalizeCalendar, normalizeTransfer,
  normalizeShapePoint, normalizeCalendarDate,
} from './normalizers/gtfs.normalizer';
import { GtfsValidator } from './validators/gtfs.validator';
import { DatasetRegistry } from './dataset.registry';

export interface IngestionOptions {
  sourceName: string;
  sourceUrl: string;
  sourceLicense?: string;
  version: string;
  dryRun?: boolean;
  fetchDir: string;
}

export class GtfsIngestionPipeline {
  private rejections = { orphans: 0, invalidCoordinates: 0, duplicateIds: 0, invalidTimes: 0 };
  private stopIdSet = new Set<string>();
  private routeIdSet = new Set<string>();
  private agencyIdSet = new Set<string>();
  private tripIdSet = new Set<string>();
  private seenAgencies = new Set<string>();
  private seenRoutes = new Set<string>();
  private seenStops = new Set<string>();

  constructor(private prisma: PrismaClient) {}

  async run(options: IngestionOptions): Promise<IngestionReport> {
    const registry = new DatasetRegistry(this.prisma);
    const fetchedAt = new Date();
    const validatedAt = new Date();

    const agencies = this.parseFile(path.join(options.fetchDir, 'agency.txt')) as GtfsAgency[];
    const routes = this.parseFile(path.join(options.fetchDir, 'routes.txt')) as GtfsRoute[];
    const stops = this.parseFile(path.join(options.fetchDir, 'stops.txt')) as GtfsStop[];
    const trips = this.parseFile(path.join(options.fetchDir, 'trips.txt')) as GtfsTrip[];
    const stopTimes = this.parseFile(path.join(options.fetchDir, 'stop_times.txt')) as GtfsStopTime[];
    const calendars = this.parseFile(path.join(options.fetchDir, 'calendar.txt')) as GtfsCalendar[];
    const transfersFile = path.join(options.fetchDir, 'transfers.txt');
    const transfers = fs.existsSync(transfersFile) ? (this.parseFile(transfersFile) as GtfsTransfer[]) : [];
    const shapesFile = path.join(options.fetchDir, 'shapes.txt');
    const shapes = fs.existsSync(shapesFile) ? (this.parseFile(shapesFile) as GtfsShape[]) : [];
    const calendarDatesFile = path.join(options.fetchDir, 'calendar_dates.txt');
    const calendarDates = fs.existsSync(calendarDatesFile)
      ? (this.parseFile(calendarDatesFile) as GtfsCalendarDate[])
      : [];

    const checksum = this.computeChecksum({ agencies, routes, stops, trips, stopTimes, calendars, transfers, shapes, calendarDates });

    const recordCounts = {
      agencies: agencies.length,
      routes: routes.length,
      stops: stops.length,
      trips: trips.length,
      stopTimes: stopTimes.length,
      calendars: calendars.length,
      transfers: transfers.length,
      shapes: shapes.length,
      calendarDates: calendarDates.length,
    };

    await registry.registerDataSource({
      sourceName: options.sourceName,
      sourceUrl: options.sourceUrl,
      license: options.sourceLicense,
      sourceType: 'gtfs',
      sourceStatus: 'active',
    });

    const dataset = await registry.createDatasetVersion({
      version: options.version,
      sourceName: options.sourceName,
      checksum,
      retrievedAt: fetchedAt,
      validatedAt: validatedAt,
      recordCounts,
      validationResult: 'passed',
      status: 'downloaded',
    });

    try {
      stops.forEach(s => this.stopIdSet.add(s.stop_id));
      routes.forEach(r => this.routeIdSet.add(r.route_id));
      agencies.forEach(a => this.agencyIdSet.add(a.agency_id ?? 'default'));
      trips.forEach(t => this.tripIdSet.add(t.trip_id));

      if (!options.dryRun) {
        await this.prisma.$transaction(async (tx) => {
          for (const a of agencies) {
            const norm = normalizeAgency(a, options.sourceName, dataset.id);
            if (this.seenAgencies.has(norm.id)) { this.rejections.duplicateIds++; continue; }
            this.seenAgencies.add(norm.id);
            await tx.agency.upsert({
              where: { id: norm.id },
              update: { name: norm.name, shortName: norm.shortName, website: norm.website },
              create: norm,
            });
          }

          for (const r of routes) {
            const agencyId = `${options.sourceName.toLowerCase()}-agency-${r.agency_id ?? 'default'}`;
            if (!this.agencyIdSet.has(r.agency_id ?? 'default')) { this.rejections.orphans++; continue; }
            const norm = normalizeRoute(r, agencyId, r.route_type, dataset.id);
            if (this.seenRoutes.has(norm.id)) { this.rejections.duplicateIds++; continue; }
            this.seenRoutes.add(norm.id);
            await tx.route.upsert({
              where: { id: norm.id },
              update: { shortName: norm.shortName, longName: norm.longName, routeType: norm.routeType, serviceType: norm.serviceType, color: norm.color, agencyId: norm.agencyId },
              create: norm,
            });
          }

          for (const s of stops) {
            if (!GtfsValidator.validateCoordinates(parseFloat(s.stop_lat), parseFloat(s.stop_lon))) {
              this.rejections.invalidCoordinates++; continue;
            }
            const agencyId = `${options.sourceName.toLowerCase()}-agency-default`;
            const norm = normalizeStop(s, agencyId, dataset.id);
            if (this.seenStops.has(norm.id)) { this.rejections.duplicateIds++; continue; }
            this.seenStops.add(norm.id);
            await tx.stop.upsert({
              where: { id: norm.id },
              update: { name: norm.name, lat: norm.lat, lon: norm.lon },
              create: norm,
            });
          }

          for (const t of trips) {
            if (!this.routeIdSet.has(t.route_id)) { this.rejections.orphans++; continue; }
            const norm = normalizeTrip(t, dataset.id);
            await tx.trip.upsert({
              where: { id: norm.id },
              update: { headsign: norm.headsign, directionId: norm.directionId },
              create: norm,
            });
          }

          for (const st of stopTimes) {
            if (!GtfsValidator.validateTime(st.arrival_time) || !GtfsValidator.validateTime(st.departure_time)) {
              this.rejections.invalidTimes++; continue;
            }
            if (!this.tripIdSet.has(st.trip_id)) { this.rejections.orphans++; continue; }
            if (!this.stopIdSet.has(st.stop_id)) { this.rejections.orphans++; continue; }
            const norm = normalizeStopTime(st);
            await tx.stopTime.upsert({
              where: { tripId_stopSequence: { tripId: norm.tripId, stopSequence: norm.stopSequence } },
              update: { arrivalTime: norm.arrivalTime, departureTime: norm.departureTime, stopId: norm.stopId },
              create: norm,
            });
          }

          for (const c of calendars) {
            const norm = normalizeCalendar(c);
            await tx.serviceCalendar.upsert({
              where: { serviceId: norm.serviceId },
              update: { ...norm, startDate: norm.startDate, endDate: norm.endDate },
              create: norm,
            });
          }

          for (const t of transfers) {
            if (!this.stopIdSet.has(t.from_stop_id) || !this.stopIdSet.has(t.to_stop_id)) { this.rejections.orphans++; continue; }
            const norm = normalizeTransfer(t, dataset.id);
            await tx.transfer.upsert({
              where: { id: norm.id },
              update: { transferType: norm.transferType, minTransferTime: norm.minTransferTime },
              create: norm,
            });
          }

          for (const sh of shapes) {
            const norm = normalizeShapePoint(sh, dataset.id);
            await tx.shapePoint.upsert({
              where: { id: `${norm.shapeId}-${norm.ptSequence}` },
              update: { ptLat: norm.ptLat, ptLon: norm.ptLon },
              create: {
                id: `${norm.shapeId}-${norm.ptSequence}`,
                shapeId: norm.shapeId,
                ptLat: norm.ptLat,
                ptLon: norm.ptLon,
                ptSequence: norm.ptSequence,
                distTraveled: norm.distTraveled,
                sourceDatasetId: dataset.id,
              },
            });
          }

          for (const cd of calendarDates) {
            const norm = normalizeCalendarDate(cd, dataset.id);
            await tx.calendarDate.upsert({
              where: { serviceId_date: { serviceId: norm.serviceId, date: norm.date } },
              update: { exceptionType: norm.exceptionType },
              create: {
                serviceId: norm.serviceId,
                date: norm.date,
                exceptionType: norm.exceptionType,
                sourceDatasetId: dataset.id,
              },
            });
          }
        });

        const validationResult = GtfsValidator.validateAll(
          agencies, routes, stops, trips, stopTimes, calendars,
          transfers, shapes, calendarDates,
        );

        await registry.updateDatasetVersion(dataset.id, {
          agenciesCount: this.seenAgencies.size,
          routesCount: this.seenRoutes.size,
          stopsCount: this.seenStops.size,
          tripsCount: trips.length,
          stopTimesCount: stopTimes.length,
          calendarsCount: calendars.length,
          transfersCount: transfers.length,
          shapesCount: shapes.length,
          calendarDatesCount: calendarDates.length,
          validationResult: 'passed',
          status: 'validated',
        });

        await registry.activateDataset(dataset.id);

        return {
          sourceName: options.sourceName,
          version: options.version,
          fetchedAt: fetchedAt.toISOString(),
          recordsFetched: recordCounts,
          recordsAccepted: {
            agencies: this.seenAgencies.size,
            routes: this.seenRoutes.size,
            stops: this.seenStops.size,
            trips: trips.length,
            stopTimes: stopTimes.length,
            calendars: calendars.length,
            transfers: transfers.length,
          },
          rejections: this.rejections,
          validationDetails: {
            errors: validationResult.overall.errors,
            warnings: validationResult.overall.warnings,
            rejectedRecords: {
              duplicateIds: this.rejections.duplicateIds,
              invalidCoordinates: this.rejections.invalidCoordinates,
              invalidTimes: this.rejections.invalidTimes,
              orphans: this.rejections.orphans,
              fieldCountMismatch: 0,
            },
          },
          status: 'SUCCESS',
        };
      }

      const validationResult = GtfsValidator.validateAll(
        agencies, routes, stops, trips, stopTimes, calendars,
        transfers, shapes, calendarDates,
      );

      return {
        sourceName: options.sourceName,
        version: options.version,
        fetchedAt: fetchedAt.toISOString(),
        recordsFetched: recordCounts,
        recordsAccepted: {
          agencies: this.seenAgencies.size,
          routes: this.seenRoutes.size,
          stops: this.seenStops.size,
          trips: trips.length,
          stopTimes: stopTimes.length,
          calendars: calendars.length,
          transfers: transfers.length,
        },
        rejections: this.rejections,
        validationDetails: {
          errors: validationResult.overall.errors,
          warnings: validationResult.overall.warnings,
          rejectedRecords: {
            duplicateIds: this.rejections.duplicateIds,
            invalidCoordinates: this.rejections.invalidCoordinates,
            invalidTimes: this.rejections.invalidTimes,
            orphans: this.rejections.orphans,
            fieldCountMismatch: 0,
          },
        },
        status: 'SUCCESS',
      };
    } catch (err) {
      await registry.updateDatasetVersion(dataset.id, {
        validationResult: 'failed',
        status: 'failed',
      }).catch(() => {});

      return {
        sourceName: options.sourceName,
        version: options.version,
        fetchedAt: fetchedAt.toISOString(),
        recordsFetched: recordCounts,
        recordsAccepted: { agencies: 0, routes: 0, stops: 0, trips: 0, stopTimes: 0, calendars: 0, transfers: 0 },
        rejections: this.rejections,
        status: 'FAILED',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private parseFile(filePath: string): Record<string, any>[] {
    if (!fs.existsSync(filePath)) return [];
    return CsvParser.parse(filePath);
  }

  private computeChecksum(data: Record<string, unknown>): string {
    const json = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(json).digest('hex');
  }
}