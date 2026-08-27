import { SourceSecurityValidator } from '../src/modules/transit/ingestion/security/source.security';

describe('SourceSecurityValidator', () => {
  it('should validate allowed HTTPS domains', () => {
    expect(SourceSecurityValidator.validateSourceUrl('https://gtfs.transjakarta.co.id/feed.zip').valid).toBe(true);
    expect(SourceSecurityValidator.validateSourceUrl('http://gtfs.transjakarta.co.id/feed.zip').valid).toBe(false);
    expect(SourceSecurityValidator.validateSourceUrl('https://malicious.com/feed.zip').valid).toBe(false);
  });

  it('should reject non-whitelisted domains', () => {
    expect(SourceSecurityValidator.validateSourceUrl('https://evil.com/feed.zip').valid).toBe(false);
  });

  it('should validate file size', () => {
    expect(SourceSecurityValidator.validateFileSize(100).valid).toBe(true);
    expect(SourceSecurityValidator.validateFileSize(600 * 1024 * 1024).valid).toBe(false);
  });

  it('should detect path traversal in archive extraction', () => {
    expect(SourceSecurityValidator.validateArchivePath('data/gtfs/agency.txt').valid).toBe(true);
    expect(SourceSecurityValidator.validateArchivePath('../../../etc/passwd').valid).toBe(false);
  });
});
