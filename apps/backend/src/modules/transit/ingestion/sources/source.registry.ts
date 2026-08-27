import { TransitDataSource } from './transit.data.source';

export interface SourceRegistryConfig {
  [sourceName: string]: {
    type: 'gtfs-static' | 'reference';
    fetchDir: string;
    url?: string;
    license?: string;
    attribution?: string;
    updateFrequency?: string;
    description?: string;
  };
}

export class SourceRegistry {
  private sources: Map<string, TransitDataSource> = new Map();

  register(name: string, source: TransitDataSource): void {
    this.sources.set(name, source);
  }

  get(name: string): TransitDataSource | undefined {
    return this.sources.get(name);
  }

  list(): TransitDataSource[] {
    return Array.from(this.sources.values());
  }

  listNames(): string[] {
    return Array.from(this.sources.keys());
  }

  has(name: string): boolean {
    return this.sources.has(name);
  }
}
