import {
  ProviderReadiness,
  SecurityScanErrorCategory,
  SecurityScanProvider,
  SecurityScanProviderType,
  SecurityScanRequest,
  SecurityScanResult,
  SecurityScanStatus,
  SecurityTargetEnvironment,
} from './types';

export class DisabledSecurityScanProvider implements SecurityScanProvider {
  type = SecurityScanProviderType.DISABLED;
  name = 'Disabled Provider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async validateCredentials(): Promise<ProviderReadiness> {
    return {
      ready: false,
      provider: this.type,
      reason: 'No managed or CLI provider configured',
      missingRequirements: ['STRIX_API_TOKEN or Docker + LLM_API_KEY'],
    };
  }

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    const startedAt = new Date();
    return {
      scanId: `disabled-${Date.now()}`,
      provider: this.type,
      status: SecurityScanStatus.SKIPPED_NOT_CONFIGURED,
      startedAt,
      completedAt: startedAt,
      findings: [],
      metadata: {
        targetIdentifier: request.target,
        targetEnvironment: SecurityTargetEnvironment.LOCAL,
        startedAt,
        completedAt: startedAt,
        durationMs: 0,
        providerVersion: 'n/a',
        findingCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        artifactLocations: [],
        errorCategory: SecurityScanErrorCategory.CONFIGURATION,
        errorDetails: 'No scan provider configured',
      },
    };
  }

  normalizeFindings(): [] {
    return [];
  }
}
