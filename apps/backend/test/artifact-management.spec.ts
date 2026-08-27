import { ArtifactManager } from '../src/core/security/scan';

describe('Artifact Management & Security Tests', () => {
  let manager: ArtifactManager;

  beforeEach(() => {
    manager = new ArtifactManager(1024 * 1024, ['strix_runs', 'security/strix']);
  });

  describe('Artifact Storage', () => {
    it('should store artifact with valid path', async () => {
      const result = await manager.validateAndStoreArtifact('strix_runs/test/findings.json', '{"findings":[]}');
      expect(result.valid).toBe(true);
      expect(result.sizeBytes).toBeGreaterThan(0);
      expect(result.checksum).toBeDefined();
    });

    it('should calculate correct checksum', async () => {
      const content = '{"test":"data"}';
      const result = await manager.validateAndStoreArtifact('strix_runs/test/data.json', content);
      expect(result.checksum).toBeDefined();
      expect(result.checksum.length).toBe(64); // SHA256 hex
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should reject path traversal attacks', async () => {
      await expect(
        manager.validateAndStoreArtifact('../../../etc/passwd', 'data')
      ).rejects.toThrow('Path traversal violation');
    });

    it('should reject absolute paths outside allowlist', async () => {
      await expect(
        manager.validateAndStoreArtifact('/tmp/evil/findings.json', 'data')
      ).rejects.toThrow('Path traversal violation');
    });

    it('should reject non-allowlisted directories', async () => {
      await expect(
        manager.validateAndStoreArtifact('other_dir/findings.json', 'data')
      ).rejects.toThrow('Path traversal violation');
    });
  });

  describe('Size Limits', () => {
    it('should enforce size limits', async () => {
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB > 1MB limit
      await expect(
        manager.validateAndStoreArtifact('strix_runs/large/findings.json', largeContent)
      ).rejects.toThrow('Artifact size limit exceeded');
    });

    it('should accept artifacts within size limit', async () => {
      const content = 'x'.repeat(100 * 1024); // 100KB < 1MB limit
      const result = await manager.validateAndStoreArtifact('strix_runs/ok/findings.json', content);
      expect(result.valid).toBe(true);
    });
  });

  describe('Artifact Reading', () => {
    it('should read stored artifacts', async () => {
      const content = 'test content';
      await manager.validateAndStoreArtifact('strix_runs/test/file.txt', content);
      const read = await manager.readArtifact('strix_runs/test/file.txt');
      expect(read).toBe(content);
    });

    it('should reject reading from outside allowlist', async () => {
      await expect(
        manager.readArtifact('../../../etc/passwd')
      ).rejects.toThrow('Path traversal violation');
    });
  });
});