import { SecurityScanProvider, SecurityScanProviderType, SecurityScanRequest, SecurityScanResult, SecurityScanStatus } from './types';

export class DisabledSecurityScanProvider implements SecurityScanProvider {
  type = SecurityScanProviderType.DISABLED;
  name = 'Disabled Provider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    return {
      scanId: `disabled-${Date.now()}`,
      provider: this.type,
      status: SecurityScanStatus.SKIPPED_NOT_CONFIGURED,
      startedAt: new Date(),
      findings: [],
      metadata: {
        scanMode: request.scanMode,
        target: request.target,
      },
    };
  }

  normalizeFindings(rawFindings: unknown): [] {
    return [];
  }
}