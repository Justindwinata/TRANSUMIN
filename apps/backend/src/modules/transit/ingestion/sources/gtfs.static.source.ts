import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TransitDataSource, SourceMetadata, SourceFetchResult, SourceAdapterOptions } from './transit.data.source';
import { IngestionReport } from '../gtfs.types';
import { GtfsIngestionPipeline } from '../gtfs.ingestion';
import { PrismaClient } from '@prisma/client';

export interface GtfsStaticSourceConfig {
  name: string;
  url: string;
  fetchDir: string;
  license?: string;
  licenseUrl?: string;
  attribution?: string;
  updateFrequency?: string;
}

export class GtfsStaticSource extends TransitDataSource {
  constructor(
    private config: GtfsStaticSourceConfig,
    private prisma: PrismaClient,
  ) {
    super();
  }

  metadata(): SourceMetadata {
    return {
      name: this.config.name,
      url: this.config.url,
      license: this.config.license,
      sourceType: 'gtfs-static',
      sourceStatus: 'active',
      licenseUrl: this.config.licenseUrl,
      attribution: this.config.attribution,
      updateFrequency: this.config.updateFrequency,
    };
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!fs.existsSync(this.config.fetchDir)) {
      throw new Error(`Fetch directory does not exist: ${this.config.fetchDir}`);
    }

    const files = fs.readdirSync(this.config.fetchDir);
    const concatenatedContent = files
      .filter(f => f.endsWith('.txt'))
      .sort()
      .map(f => fs.readFileSync(path.join(this.config.fetchDir, f), 'utf8'))
      .join('\n');

    const checksum = crypto.createHash('sha256').update(concatenatedContent).digest('hex');
    const fetchedAt = new Date();

    return {
      rawData: concatenatedContent,
      contentType: 'text/csv',
      fetchedAt,
      checksum,
      sizeBytes: concatenatedContent.length,
    };
  }

  async ingest(options: SourceAdapterOptions): Promise<IngestionReport> {
    const pipeline = new GtfsIngestionPipeline(this.prisma);
    const fetchResult = await this.fetch();

    const report = await pipeline.run({
      sourceName: this.config.name,
      sourceUrl: this.config.url,
      sourceLicense: this.config.license,
      version: options.version,
      fetchDir: this.config.fetchDir,
      dryRun: options.dryRun,
    });

    return report;
  }
}
