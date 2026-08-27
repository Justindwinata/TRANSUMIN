import { SecurityScanExecutor, ProviderReadiness, SecurityScanProviderType } from '../src/core/security/scan';

describe('SecurityScanExecutor - Integration Contract Tests', () => {
  describe('Provider Selection Without Credentials', () => {
    it('should select disabled provider when no credentials available', async () => {
      const executor = new SecurityScanExecutor();
      const readiness = await executor.getProviderReadiness();

      expect(readiness.length).toBeGreaterThan(0);
      expect(readiness.every((r: ProviderReadiness) => !r.ready)).toBe(true);

      const selected = executor.getSelectedProvider();
      expect(selected.type).toBe(SecurityScanProviderType.DISABLED);
    });

    it('should return honest SKIPPED_NOT_CONFIGURED status without credentials', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.status).toBe('SKIPPED_NOT_CONFIGURED');
      expect(result.findings.length).toBe(0);
      expect(result.error).toBeUndefined();
      expect(result.metadata.findingCount).toBe(0);
    });
  });

  describe('Provider Readiness Contract', () => {
    it('should report missing STRIX_API_TOKEN in readiness', async () => {
      const executor = new SecurityScanExecutor();
      const readiness = await executor.getProviderReadiness();

      const managedProvider = readiness.find((r: ProviderReadiness) => r.provider === SecurityScanProviderType.STRIX_MANAGED);
      expect(managedProvider).toBeDefined();
      expect(managedProvider?.ready).toBe(false);
      expect(managedProvider?.missingRequirements).toContain('STRIX_API_TOKEN');
    });

    it('should report Docker requirement in CLI provider readiness', async () => {
      const executor = new SecurityScanExecutor();
      const readiness = await executor.getProviderReadiness();

      const cliProvider = readiness.find((r: ProviderReadiness) => r.provider === SecurityScanProviderType.STRIX_CLI);
      expect(cliProvider).toBeDefined();
      expect(cliProvider?.ready).toBe(false);
    });
  });

  describe('Scan Metadata Completeness', () => {
    it('should populate all metadata fields even when skipped', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: 'http://localhost:3000',
        targetType: 'url',
        scanMode: 'quick',
        maxBudgetUsd: 10,
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata.targetIdentifier).toBe('http://localhost:3000');
      expect(result.metadata.startedAt).toBeDefined();
      expect(result.metadata.findingCount).toBe(0);
      expect(result.metadata.criticalCount).toBe(0);
      expect(result.metadata.highCount).toBe(0);
      expect(result.metadata.mediumCount).toBe(0);
      expect(result.metadata.lowCount).toBe(0);
      expect(result.metadata.infoCount).toBe(0);
      expect(result.metadata.errorCategory).toBeDefined();
      expect(result.metadata.errorDetails).toBeDefined();
    });
  });

  describe('Never Fabricate Scan Status', () => {
    it('should never return COMPLETED without actual execution', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.status).not.toBe('COMPLETED');
      expect(['SKIPPED_NOT_CONFIGURED', 'BLOCKED', 'UNAVAILABLE']).toContain(result.status);
    });

    it('should never return findings without actual scan', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.findings.length).toBe(0);
      expect(result.findings).toEqual([]);
    });

    it('should explicitly report blocker reason', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      expect(result.metadata.errorCategory).toBeDefined();
      expect(result.metadata.errorDetails).toBeDefined();
      expect(result.metadata.errorDetails).toMatch(/no scan provider|not configured|strix/i);
    });
  });

  describe('Scan Request Validation', () => {
    it('should accept valid scan request', async () => {
      const executor = new SecurityScanExecutor();
      const request = {
        target: './',
        targetType: 'repository' as const,
        scanMode: 'quick' as const,
        maxBudgetUsd: 10,
      };

      const result = await executor.executeScan(request);
      expect(result).toBeDefined();
      expect(result.metadata.targetIdentifier).toBe('./');
    });

    it('should populate finding counts from metadata', async () => {
      const executor = new SecurityScanExecutor();
      const result = await executor.executeScan({
        target: './',
        targetType: 'repository',
        scanMode: 'quick',
      });

      const counts = {
        critical: result.metadata.criticalCount,
        high: result.metadata.highCount,
        medium: result.metadata.mediumCount,
        low: result.metadata.lowCount,
        info: result.metadata.infoCount,
      };

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      expect(total).toBe(result.metadata.findingCount);
    });
  });
});