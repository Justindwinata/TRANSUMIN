import { IngestionReport } from '../gtfs.types';

export interface SourceMetadata {
  name: string;
  url: string;
  license?: string;
  sourceType: 'gtfs-static' | 'gtfs-realtime' | 'api' | 'reference';
  sourceStatus: 'active' | 'beta' | 'archived';
  licenseUrl?: string;
  attribution?: string;
  updateFrequency?: string;
}

export interface SourceFetchResult {
  rawData: Buffer | string;
  contentType: string;
  fetchedAt: Date;
  checksum: string;
  sizeBytes: number;
}

export interface SourceAdapterOptions {
  workdir: string;
  dryRun?: boolean;
  version: string;
}

export abstract class TransitDataSource {
  abstract metadata(): SourceMetadata;
  
  abstract fetch(): Promise<SourceFetchResult>;
  
  abstract ingest(options: SourceAdapterOptions): Promise<IngestionReport>;
}
