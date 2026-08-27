import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ArtifactMetadata {
  sourceName: string;
  version: string;
  checksum: string;
  fetchedAt: Date;
  contentType: string;
  sizeBytes: number;
  format: string;
  versionIdentifier: string;
  license?: string;
  licenseUrl?: string;
}

export class ArtifactStore {
  constructor(private storageDir: string) {}

  async storeRawArtifact(metadata: ArtifactMetadata, rawData: Buffer): Promise<string> {
    const artifactDir = path.join(this.storageDir, metadata.sourceName, metadata.version);
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    const filename = `${metadata.versionIdentifier || 'raw'}.bin`;
    const filepath = path.join(artifactDir, filename);

    fs.writeFileSync(filepath, rawData);

    const metadataPath = filepath.replace('.bin', '.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      ...metadata,
      fetchedAt: metadata.fetchedAt.toISOString(),
      storedAt: new Date().toISOString(),
    }, null, 2));

    return filepath;
  }

  async verifyArtifact(filepath: string, expectedChecksum: string): Promise<boolean> {
    if (!fs.existsSync(filepath)) return false;
    const content = fs.readFileSync(filepath);
    const actualChecksum = crypto.createHash('sha256').update(content).digest('hex');
    return actualChecksum === expectedChecksum;
  }

  getMetadataPath(filepath: string): string {
    return filepath.replace('.bin', '.json');
  }

  loadMetadata(filepath: string): ArtifactMetadata | null {
    const metadataPath = this.getMetadataPath(filepath);
    if (!fs.existsSync(metadataPath)) return null;
    const content = fs.readFileSync(metadataPath, 'utf8');
    return JSON.parse(content) as ArtifactMetadata;
  }
}
