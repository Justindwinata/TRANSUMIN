import { Test, TestingModule } from '@nestjs/testing';
import { GtfsStaticSource } from '../src/modules/transit/ingestion/sources/gtfs.static.source';
import { ReferenceSource } from '../src/modules/transit/ingestion/sources/reference.source';
import { SourceRegistry } from '../src/modules/transit/ingestion/sources/source.registry';
import * as path from 'path';

describe('Source Adapters and Registry', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      dataSource: {
        upsert: jest.fn().mockResolvedValue({ id: 'transjakarta' }),
        findUnique: jest.fn().mockResolvedValue({ id: 'transjakarta' }),
      },
      datasetVersion: {
        create: jest.fn().mockResolvedValue({ id: 'dataset-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb({
        agency: { upsert: jest.fn() },
        route: { upsert: jest.fn() },
        stop: { upsert: jest.fn() },
        trip: { upsert: jest.fn() },
        stopTime: { upsert: jest.fn() },
        serviceCalendar: { upsert: jest.fn() },
        transfer: { upsert: jest.fn() },
        datasetVersion: { updateMany: jest.fn(), update: jest.fn() },
      })),
    };
  });

  describe('GtfsStaticSource', () => {
    it('should expose metadata and fetch raw data', async () => {
      const fetchDir = path.join(__dirname, 'fixtures/transjakarta');
      const source = new GtfsStaticSource({
        name: 'transjakarta',
        url: 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip',
        fetchDir,
        license: 'CC BY 4.0',
      }, prismaMock);

      const meta = source.metadata();
      expect(meta.name).toBe('transjakarta');
      expect(meta.sourceType).toBe('gtfs-static');
      expect(meta.license).toBe('CC BY 4.0');

      const fetchResult = await source.fetch();
      expect(fetchResult.rawData).toBeDefined();
      expect(fetchResult.checksum).toBeDefined();
      expect(fetchResult.sizeBytes).toBeGreaterThan(0);
    });

    it('should run ingestion pipeline', async () => {
      const fetchDir = path.join(__dirname, 'fixtures/transjakarta');
      const source = new GtfsStaticSource({
        name: 'transjakarta',
        url: 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip',
        fetchDir,
      }, prismaMock);

      const report = await source.ingest({ workdir: fetchDir, version: 'v1.0.0', dryRun: true });
      expect(report.status).toBe('SUCCESS');
      expect(report.recordsFetched.routes).toBe(2);
    });
  });

  describe('ReferenceSource', () => {
    it('should handle reference data sources', async () => {
      const fetchDir = path.join(__dirname, 'fixtures/transjakarta');
      const source = new ReferenceSource({
        name: 'transjakarta-ref',
        description: 'Reference TransJakarta feed',
        fetchDir,
        attribution: 'PT Transjakarta / OpenStreetMap',
      }, prismaMock);

      const meta = source.metadata();
      expect(meta.sourceType).toBe('reference');
      expect(meta.attribution).toContain('Transjakarta');

      const report = await source.ingest({ workdir: fetchDir, version: 'v1.0.0', dryRun: true });
      expect(report.status).toBe('SUCCESS');
    });
  });

  describe('SourceRegistry', () => {
    it('should register and retrieve sources', () => {
      const registry = new SourceRegistry();
      const fetchDir = path.join(__dirname, 'fixtures/transjakarta');
      const source = new GtfsStaticSource({
        name: 'transjakarta',
        url: 'https://example.com/gtfs.zip',
        fetchDir,
      }, prismaMock);

      registry.register('transjakarta', source);
      expect(registry.has('transjakarta')).toBe(true);
      expect(registry.get('transjakarta')).toBe(source);
      expect(registry.listNames()).toContain('transjakarta');
    });
  });
});
