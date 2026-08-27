import { SecurityScanExecutor, SecurityScanProviderType, SecurityScanStatus } from '../src/core/security/scan';

describe('Security Scan Execution Workflow Tests', () => {
  describe('Provider Selection Flow', () => {
    it('should select Disabled provider when no credentials', async () => {
      const executor = new SecurityScanExecutor();
      await executor.selectBestProvider();
      expect(executor.getSelectedProvider().type).toBe(SecurityScanProviderType.DISABLED);
    });

    it('should report provider readiness without executing scan', async () => {
      const executor = new SecurityScanExecutor();
      const readiness = await executor.getProviderReadiness();
      expect(Array.isArray(readiness)).toBe(true);
      readiness.forEach((r) => {
        expect(r).toHaveProperty('ready');
        expect(r).toHaveProperty('provider');
        expect(r).toHaveProperty('missingRequirements');
      });
    });
  });

  describe('Scan Execution States', () => {
    it('should return SKIPPED_NOT_CONFIGURED when no credentials', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.status).toBe(SecurityScanStatus.SKIPPED_NOT_CONFIGURED);
      expect(result.findings.length).toBe(0);
      expect(result.metadata.findingCount).toBe(0);
    });

    it('should populate scan metadata for skipped scan', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: 'http://localhost:3000',
        targetType: 'url',
        scanMode: 'standard',
        maxBudgetUsd: 20,
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata.targetIdentifier).toBe('http://localhost:3000');
      expect(result.metadata.targetEnvironment).toBeDefined();
      expect(result.metadata.errorCategory).toBeDefined();
      expect(result.metadata.findingCount).toBe(0);
      expect(result.metadata.criticalCount).toBe(0);
    });
  });

  describe('Integration Contract', () => {
    it('should never return COMPLETED without real execution', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.status).not.toBe('COMPLETED');
      expect(result.status).not.toBe('RUNNING');
    });

    it('should never fabricate findings', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.findings).toEqual([]);
    });
  });
});