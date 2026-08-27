import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TransitDataSource, SourceMetadata, SourceFetchResult, SourceAdapterOptions } from './transit.data.source';
import { IngestionReport } from '../gtfs.types';
import { GtfsIngestionPipeline } from '../gtfs.ingestion';
import { PrismaClient } from '@prisma/client';

export interface ReferenceSourceConfig {
  name: string;
  description: string;
  fetchDir: string;
  attribution: string;
}

export class ReferenceSource extends TransitDataSource {
  constructor(
    private config: ReferenceSourceConfig,
    private prisma: PrismaClient,
  ) {
    super();
  }

  metadata(): SourceMetadata {
    return {
      name: this.config.name,
      url: `reference://${this.config.name}`,
      license: 'CC BY 4.0',
      sourceType: 'reference',
      sourceStatus: 'active',
      attribution: this.config.attribution,
      updateFrequency: 'manual',
    };
  }

  async fetch(): Promise<SourceFetchResult> {
    if (!fs.existsSync(this.config.fetchDir)) {
      throw new Error(`Reference directory does not exist: ${this.config.fetchDir}`);
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
      sourceUrl: `reference://${this.config.name}`,
      sourceLicense: 'CC BY 4.0',
      version: options.version,
      fetchDir: this.config.fetchDir,
      dryRun: options.dryRun,
    });

    return report;
  }
}
