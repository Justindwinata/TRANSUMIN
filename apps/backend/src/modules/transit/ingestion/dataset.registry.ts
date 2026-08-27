import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IngestionReport } from './gtfs.types';

export interface DataSourceMetadata {
  sourceName: string;
  sourceUrl: string;
  license?: string;
  sourceType?: string;
  sourceStatus?: string;
  licenseUrl?: string;
  checksum?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface DatasetVersionMetadata {
  version: string;
  sourceName: string;
  checksum: string;
  retrievedAt: Date;
  validatedAt: Date;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  recordCounts: {
    agencies: number;
    routes: number;
    stops: number;
    trips: number;
    stopTimes: number;
    calendars: number;
    transfers: number;
    shapes?: number;
    calendarDates?: number;
  };
  validationResult: 'passed' | 'failed';
  status: 'downloaded' | 'validating' | 'validated' | 'failed' | 'active' | 'superseded';
  sourceAdapterType?: string;
  provenance?: Record<string, unknown>;
}

@Injectable()
export class DatasetRegistry {
  constructor(private prisma: PrismaClient) {}

  async registerDataSource(metadata: DataSourceMetadata) {
    return this.prisma.dataSource.upsert({
      where: { id: metadata.sourceName },
      update: {
        url: metadata.sourceUrl,
        license: metadata.license,
        sourceType: metadata.sourceType || 'gtfs',
        sourceStatus: metadata.sourceStatus || 'active',
        licenseUrl: metadata.licenseUrl,
        lastFetchedAt: new Date(),
        retrievedAt: new Date(),
        validatedAt: new Date(),
        effectiveFrom: metadata.effectiveFrom,
        effectiveTo: metadata.effectiveTo,
        checksum: metadata.checksum,
      },
      create: {
        id: metadata.sourceName,
        name: metadata.sourceName,
        url: metadata.sourceUrl,
        license: metadata.license,
        sourceType: metadata.sourceType || 'gtfs',
        sourceStatus: metadata.sourceStatus || 'active',
        licenseUrl: metadata.licenseUrl,
        lastFetchedAt: new Date(),
        retrievedAt: new Date(),
        validatedAt: new Date(),
        effectiveFrom: metadata.effectiveFrom,
        effectiveTo: metadata.effectiveTo,
        checksum: metadata.checksum,
      },
    });
  }

  async createDatasetVersion(metadata: DatasetVersionMetadata) {
    const source = await this.prisma.dataSource.findUnique({ where: { id: metadata.sourceName } });
    if (!source) throw new Error(`Source not found: ${metadata.sourceName}`);

    return this.prisma.datasetVersion.create({
      data: {
        sourceId: source.id,
        version: metadata.version,
        isActive: false,
        retrievedAt: metadata.retrievedAt,
        validatedAt: metadata.validatedAt,
        checksum: metadata.checksum,
        effectiveFrom: metadata.effectiveFrom,
        effectiveTo: metadata.effectiveTo,
        agenciesCount: metadata.recordCounts.agencies,
        routesCount: metadata.recordCounts.routes,
        stopsCount: metadata.recordCounts.stops,
        tripsCount: metadata.recordCounts.trips,
        stopTimesCount: metadata.recordCounts.stopTimes,
        calendarsCount: metadata.recordCounts.calendars,
        transfersCount: metadata.recordCounts.transfers,
        shapesCount: metadata.recordCounts.shapes ?? 0,
        calendarDatesCount: metadata.recordCounts.calendarDates ?? 0,
        sourceAdapterType: metadata.sourceAdapterType,
        provenanceJson: metadata.provenance ? JSON.stringify(metadata.provenance) : null,
        validationResult: metadata.validationResult,
        status: metadata.status,
      },
    });
  }

  async updateDatasetVersion(datasetId: string, updates: {
    agenciesCount?: number;
    routesCount?: number;
    stopsCount?: number;
    tripsCount?: number;
    stopTimesCount?: number;
    calendarsCount?: number;
    transfersCount?: number;
    shapesCount?: number;
    calendarDatesCount?: number;
    validationResult?: 'passed' | 'failed';
    status?: 'downloaded' | 'validating' | 'validated' | 'failed' | 'active' | 'superseded';
  }) {
    return this.prisma.datasetVersion.update({
      where: { id: datasetId },
      data: updates,
    });
  }

  async activateDataset(datasetId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.datasetVersion.updateMany({
        where: { isActive: true },
        data: { isActive: false, status: 'superseded' },
      });

      await tx.datasetVersion.update({
        where: { id: datasetId },
        data: { isActive: true, status: 'active' },
      });
    });
  }

  async getActiveDataset() {
    return this.prisma.datasetVersion.findFirst({
      where: { isActive: true },
      include: { source: true },
    });
  }

  async listDatasets() {
    return this.prisma.datasetVersion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { source: true },
    });
  }
}