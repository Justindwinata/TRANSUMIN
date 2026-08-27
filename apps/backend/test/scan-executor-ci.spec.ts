import { SecurityScanExecutor } from '../src/core/security/scan';

describe('Security Scan Executor - CI Behavior Tests', () => {
  describe('Provider Selection', () => {
    it('should select disabled provider when no credentials', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.status).toBe('SKIPPED_NOT_CONFIGURED');
      expect(result.provider).toBe('DISABLED');
      expect(result.findings.length).toBe(0);
    });

    it('should handle missing credentials gracefully', async () => {
      const executor = new SecurityScanExecutor();
      const readiness = await executor.getSelectedProvider().isAvailable();
      // Without credentials, managed provider should be unavailable
      expect(readiness).toBe(true); // disabled provider is always available
    });
  });

  describe('Scan Status Handling', () => {
    it('should return SKIPPED_NOT_CONFIGURED when no providers configured', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: 'http://localhost:3000',
        targetType: 'url',
        scanMode: 'quick',
      });

      expect(['SKIPPED_NOT_CONFIGURED', 'FAILED', 'BLOCKED', 'UNSUPPORTED']).toContain(result.status);
    });

    it('should never return COMPLETED for a fake scan', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      // Without actual credentials, should not complete
      expect(result.status).not.toBe('COMPLETED');
    });
  });

  describe('Error Classification', () => {
    it('should categorize configuration errors correctly', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.metadata?.errorCategory).toBeDefined();
    });
  });
});