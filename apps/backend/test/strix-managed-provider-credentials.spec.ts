import { StrixManagedProvider, SecurityScanProviderType } from '../src/core/security/scan';

describe('StrixManagedProvider - Credential Readiness Tests', () => {
  describe('Without Credentials', () => {
    it('should report not ready when no API token provided', async () => {
      const provider = new StrixManagedProvider();
      const readiness = await provider.validateCredentials();

      expect(readiness.ready).toBe(false);
      expect(readiness.provider).toBe(SecurityScanProviderType.STRIX_MANAGED);
      expect(readiness.missingRequirements).toContain('STRIX_API_TOKEN');
      expect(readiness.missingRequirements.length).toBeGreaterThan(0);
    });

    it('should report not ready when empty token provided', async () => {
      const provider = new StrixManagedProvider('');
      const readiness = await provider.validateCredentials();

      expect(readiness.ready).toBe(false);
      expect(readiness.missingRequirements).toContain('STRIX_API_TOKEN');
      expect(readiness.missingRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('Honest Reporting', () => {
    it('should never claim ready without valid credentials', async () => {
      const provider = new StrixManagedProvider();

      const readiness = await provider.validateCredentials();

      expect(readiness.ready).toBe(false);
      expect(readiness.missingRequirements).toBeDefined();
      expect(readiness.missingRequirements.length).toBeGreaterThan(0);
    });
  });
});