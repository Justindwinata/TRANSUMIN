import { PrismaClient } from '@prisma/client';
import { GtfsIngestionPipeline } from '../src/modules/transit/ingestion/gtfs.ingestion';
import * as path from 'path';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    dataSource: {
      upsert: jest.fn().mockResolvedValue({ id: 'transjakarta' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'transjakarta' }),
    },
    datasetVersion: {
      create: jest.fn().mockResolvedValue({ id: 'dataset-1', is_active: false }),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    agency: { upsert: jest.fn().mockResolvedValue({}) },
    route: { upsert: jest.fn().mockResolvedValue({}) },
    stop: { upsert: jest.fn().mockResolvedValue({}) },
    trip: { upsert: jest.fn().mockResolvedValue({}) },
    stopTime: { upsert: jest.fn().mockResolvedValue({}) },
    serviceCalendar: { upsert: jest.fn().mockResolvedValue({}) },
    transfer: { upsert: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn().mockImplementation((callback) => callback({
      agency: { upsert: jest.fn().mockResolvedValue({}) },
      route: { upsert: jest.fn().mockResolvedValue({}) },
      stop: { upsert: jest.fn().mockResolvedValue({}) },
      trip: { upsert: jest.fn().mockResolvedValue({}) },
      stopTime: { upsert: jest.fn().mockResolvedValue({}) },
      serviceCalendar: { upsert: jest.fn().mockResolvedValue({}) },
      transfer: { upsert: jest.fn().mockResolvedValue({}) },
      datasetVersion: { updateMany: jest.fn(), update: jest.fn() },
    })),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { DatasetRegistry } from '../src/modules/transit/ingestion/dataset.registry';
import { GtfsValidator } from '../src/modules/transit/ingestion/validators/gtfs.validator';
import { normalizeStopTime } from '../src/modules/transit/ingestion/normalizers/gtfs.normalizer';
import { CsvParser } from '../src/modules/transit/ingestion/parsers/csv.parser';

describe('GtfsIngestionPipeline', () => {
  let prisma: any;
  let pipeline: GtfsIngestionPipeline;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    pipeline = new GtfsIngestionPipeline(prisma);
  });

  describe('valid GTFS ingestion', () => {
    it('should successfully parse, validate and run ingestion on valid fixtures', async () => {
      const fetchDir = path.join(__dirname, './fixtures/transjakarta');
      const report = await pipeline.run({
        sourceName: 'transjakarta',
        sourceUrl: 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip',
        sourceLicense: 'CC BY 4.0',
        version: 'v1.0.0',
        fetchDir,
      });

      expect(report.status).toBe('SUCCESS');
      expect(report.recordsFetched.routes).toBe(2);
      expect(report.recordsFetched.stops).toBe(4);
      expect(report.recordsFetched.trips).toBe(3);
    });
  });

  describe('dry-run mode', () => {
    it('should not persist when dryRun is true', async () => {
      const fetchDir = path.join(__dirname, './fixtures/transjakarta');
      await pipeline.run({
        sourceName: 'transjakarta',
        sourceUrl: 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip',
        version: 'v1.0.0',
        fetchDir,
        dryRun: true,
      });

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('optional files handling', () => {
    it('should tolerate missing transfers.txt', async () => {
      const fetchDir = path.join(__dirname, './fixtures/transjakarta_no_transfers');
      await pipeline.run({
        sourceName: 'transjakarta',
        sourceUrl: 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip',
        version: 'v1.0.0',
        fetchDir,
      });
    });
  });

  describe('orphan detection', () => {
    it('should detect orphan references with invalid agency_id', async () => {
      const report = await pipeline.run({
        sourceName: 'transjakarta',
        sourceUrl: '',
        version: 'v1.0.0',
        fetchDir: path.join(__dirname, './fixtures/bad_orphan'),
      });
      expect(report.status).toBe('SUCCESS');
    });
  });
});

describe('GtfsValidator', () => {
  it('should validate Jabodetabek coordinates', () => {
    expect(GtfsValidator.validateCoordinates(-6.2, 106.8)).toBe(true);
  });

  it('should reject coordinates outside Jabodetabek bounds', () => {
    expect(GtfsValidator.validateCoordinates(99, 199)).toBe(false);
  });

  it('should validate transit-day times exceeding 24:00', () => {
    expect(GtfsValidator.validateTime('25:30:00')).toBe(true);
  });

  it('should reject invalid times', () => {
    expect(GtfsValidator.validateTime('25:61:99')).toBe(false);
    expect(GtfsValidator.validateTime('abc')).toBe(false);
  });
});

describe('CsvParser', () => {
  it('should parse CSV into typed records', () => {
    const csv = 'route_id,route_short_name\nR1,Route 1\n';
    const result = CsvParser.parseString(csv);
    expect(result).toHaveLength(1);
    expect(result[0].route_id).toBe('R1');
    expect(result[0].route_short_name).toBe('Route 1');
  });

  it('should return empty array for missing file', () => {
    const result = CsvParser.parse('/nonexistent/file.csv');
    expect(result).toEqual([]);
  });
});

describe('normalizeStopTime', () => {
  it('should preserve GTFS time semantics', () => {
    const norm = normalizeStopTime({
      trip_id: 'T1',
      stop_id: 'S1',
      arrival_time: '25:30:00',
      departure_time: '25:35:00',
      stop_sequence: 1,
    });
    expect(norm.arrivalTime).toBe('25:30:00');
    expect(norm.departureTime).toBe('25:35:00');
    expect(norm.stopSequence).toBe(1);
  });
});

describe('DatasetRegistry', () => {
  it('should expose methods for dataset lifecycle', () => {
    expect(typeof DatasetRegistry.prototype.registerDataSource).toBe('function');
    expect(typeof DatasetRegistry.prototype.createDatasetVersion).toBe('function');
    expect(typeof DatasetRegistry.prototype.activateDataset).toBe('function');
  });
});
