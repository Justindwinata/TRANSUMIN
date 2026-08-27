import { SecurityScanProvider, SecurityScanProviderType, SecurityScanRequest, SecurityScanResult, SecurityScanStatus } from './types';
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

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    if (!this.apiToken) {
      return {
        scanId: `managed-${Date.now()}`,
        provider: this.type,
        status: SecurityScanStatus.SKIPPED_NOT_CONFIGURED,
        startedAt: new Date(),
        findings: [],
        metadata: { scanMode: request.scanMode, target: request.target },
      };
    }

    try {
      const scanId = await this.launchScan(request);
      const status = await this.pollScanCompletion(scanId);
      const findings = await this.fetchScanFindings(scanId);

      return {
        scanId,
        provider: this.type,
        status,
        startedAt: new Date(),
        completedAt: new Date(),
        findings: this.normalizeFindings(findings),
        metadata: { scanMode: request.scanMode, target: request.target, budgetUsd: request.maxBudgetUsd },
      };
    } catch (error: any) {
      return {
        scanId: `managed-${Date.now()}`,
        provider: this.type,
        status: SecurityScanStatus.FAILED,
        startedAt: new Date(),
        findings: [],
        metadata: { scanMode: request.scanMode, target: request.target },
        error: error.message,
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

    const data = await resp.json() as { scan_id?: string; id?: string };
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

      const data = await resp.json() as { status?: string };
      const status = data.status?.toUpperCase();

      if (status === 'COMPLETED') return SecurityScanStatus.COMPLETED;
      if (status === 'FAILED') return SecurityScanStatus.FAILED;

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    return SecurityScanStatus.FAILED;
  }

  private async fetchScanFindings(scanId: string): Promise<unknown[]> {
    try {
      const resp = await fetch(`${this.apiBase}/scans/${scanId}/findings`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });

      if (!resp.ok) {
        return [];
      }

      const data = await resp.json() as { findings?: unknown[] };
      return data.findings || [];
    } catch {
      return [];
    }
  }
}