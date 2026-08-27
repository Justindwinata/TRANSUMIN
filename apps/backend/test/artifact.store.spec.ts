import { ArtifactStore, ArtifactMetadata } from '../src/modules/transit/ingestion/storage/artifact.store';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ArtifactStore', () => {
  let store: ArtifactStore;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'transum-artifacts-'));
    store = new ArtifactStore(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should store and verify raw artifact', async () => {
    const data = Buffer.from('agency_id,agency_name\r\nTJ,Test\r\n');
    const crypto = await import('crypto');
    const realChecksum = crypto.createHash('sha256').update(data).digest('hex');
    const metadata: ArtifactMetadata = {
      sourceName: 'transjakarta',
      version: 'v1.0.0',
      checksum: realChecksum,
      fetchedAt: new Date(),
      contentType: 'application/zip',
      sizeBytes: data.length,
      format: 'gtfs',
      versionIdentifier: 'v1',
      license: 'CC BY 4.0',
    };

    const filepath = await store.storeRawArtifact(metadata, data);
    expect(fs.existsSync(filepath)).toBe(true);

    const verified = await store.verifyArtifact(filepath, realChecksum);
    expect(verified).toBe(true);
  });

    it('should load metadata after storing', async () => {
    const data = Buffer.from('test data');
    const metadata: ArtifactMetadata = {
      sourceName: 'test',
      version: 'v1',
      checksum: 'xyz789',
      fetchedAt: new Date('2024-01-01T00:00:00Z'),
      contentType: 'text/csv',
      sizeBytes: 9,
      format: 'gtfs',
      versionIdentifier: 'v1',
    };

    const filepath = await store.storeRawArtifact(metadata, data);
    const loaded = store.loadMetadata(filepath);
    expect(loaded).not.toBeNull();
    expect(loaded!.sourceName).toBe('test');
    expect(loaded!.checksum).toBe('xyz789');
  });

  it('should reject invalid checksum', async () => {
    const data = Buffer.from('test');
    const metadata: ArtifactMetadata = {
      sourceName: 'test',
      version: 'v1',
      checksum: 'wrong',
      fetchedAt: new Date(),
      contentType: 'text/plain',
      sizeBytes: 4,
      format: 'gtfs',
      versionIdentifier: 'v1',
    };

    const filepath = await store.storeRawArtifact(metadata, data);
    const verified = await store.verifyArtifact(filepath, 'correct-checksum');
    expect(verified).toBe(false);
  });
});
