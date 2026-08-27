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
import { DefaultFindingNormalizer } from './finding-normalizer';

export class StrixManagedProvider implements SecurityScanProvider {
  type = SecurityScanProviderType.STRIX_MANAGED;
  name = 'Strix Managed Cloud Provider';
  private apiToken: string | undefined;
  private apiBase = 'https://app.strix.ai/api/v1';
  private normalizer = new DefaultFindingNormalizer();

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.STRIX_API_TOKEN;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiToken;
  }

  async validateCredentials(): Promise<ProviderReadiness> {
    if (!this.apiToken) {
      return {
        ready: false,
        provider: this.type,
        missingRequirements: ['STRIX_API_TOKEN'],
      };
    }

    try {
      const resp = await fetch(`${this.apiBase}/health`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      if (resp.ok) {
        return { ready: true, provider: this.type, providerVersion: '1.0' };
      } else {
        return {
          ready: false,
          provider: this.type,
          reason: `API returned ${resp.status}`,
          missingRequirements: ['Valid STRIX_API_TOKEN'],
        };
      }
    } catch (error: any) {
      return {
        ready: false,
        provider: this.type,
        reason: error.message,
        missingRequirements: ['Network connectivity to app.strix.ai'],
      };
    }
  }

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    const startedAt = new Date();

    if (!this.apiToken) {
      return {
        scanId: `managed-${Date.now()}`,
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
          findingCount: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          infoCount: 0,
          artifactLocations: [],
          errorCategory: SecurityScanErrorCategory.CONFIGURATION,
          errorDetails: 'STRIX_API_TOKEN not configured',
        },
      };
    }

    try {
      const scanId = await this.launchScan(request);
      const status = await this.pollScanCompletion(scanId);
      const findings = await this.fetchScanFindings(scanId);
      const normalized = this.normalizeFindings(findings);

      return {
        scanId,
        provider: this.type,
        status,
        startedAt,
        completedAt: new Date(),
        findings: normalized,
        metadata: {
          targetIdentifier: request.target,
          targetEnvironment: SecurityTargetEnvironment.LOCAL,
          startedAt,
          completedAt: new Date(),
          durationMs: Date.now() - startedAt.getTime(),
          findingCount: normalized.length,
          criticalCount: normalized.filter(f => f.severity === 'CRITICAL').length,
          highCount: normalized.filter(f => f.severity === 'HIGH').length,
          mediumCount: normalized.filter(f => f.severity === 'MEDIUM').length,
          lowCount: normalized.filter(f => f.severity === 'LOW').length,
          infoCount: normalized.filter(f => f.severity === 'INFO').length,
          artifactLocations: [`${this.apiBase}/scans/${scanId}`],
        },
      };
    } catch (error: any) {
      const errorCategory = error.message.includes('timeout')
        ? SecurityScanErrorCategory.TIMEOUT
        : SecurityScanErrorCategory.PROVIDER;

      return {
        scanId: `managed-${Date.now()}`,
        provider: this.type,
        status: SecurityScanStatus.FAILED,
        startedAt,
        findings: [],
        metadata: {
          targetIdentifier: request.target,
          targetEnvironment: SecurityTargetEnvironment.LOCAL,
          startedAt,
          findingCount: 0,
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          infoCount: 0,
          artifactLocations: [],
          errorCategory,
          errorDetails: error.message,
        },
      };
    }
  }

  normalizeFindings(rawFindings: unknown): any[] {
    return this.normalizer.normalize(Array.isArray(rawFindings) ? rawFindings : [], 'strix-managed');
  }

  private async launchScan(request: SecurityScanRequest): Promise<string> {
    const payload = {
      target: request.target,
      scanMode: request.scanMode,
      maxBudgetUsd: request.maxBudgetUsd || 20,
      instructions: request.instructions,
    };

    const resp = await fetch(`${this.apiBase}/scans`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`Failed to launch scan: ${resp.statusText}`);
    }

    const data = (await resp.json()) as { scan_id?: string; id?: string };
    return data.scan_id || data.id || '';
  }

  private async pollScanCompletion(scanId: string, maxWaitMs = 3600000): Promise<SecurityScanStatus> {
    const startTime = Date.now();
    const pollIntervalMs = 5000;

    while (Date.now() - startTime < maxWaitMs) {
      const resp = await fetch(`${this.apiBase}/scans/${scanId}`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      if (!resp.ok) {
        throw new Error(`Failed to poll scan: ${resp.statusText}`);
      }

      const data = (await resp.json()) as { status?: string };
      const status = data.status?.toUpperCase();

      if (status === 'COMPLETED') return SecurityScanStatus.COMPLETED;
      if (status === 'FAILED') return SecurityScanStatus.FAILED;

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    return SecurityScanStatus.TIMED_OUT;
  }

  private async fetchScanFindings(scanId: string): Promise<unknown[]> {
    try {
      const resp = await fetch(`${this.apiBase}/scans/${scanId}/findings`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      if (!resp.ok) {
        return [];
      }

      const data = (await resp.json()) as { findings?: unknown[] };
      return data.findings || [];
    } catch {
      return [];
    }
  }
}
