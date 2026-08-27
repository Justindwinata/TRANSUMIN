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
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export class StrixCliProvider implements SecurityScanProvider {
  type = SecurityScanProviderType.STRIX_CLI;
  name = 'Strix OSS CLI Provider';
  private normalizer = new DefaultFindingNormalizer();

  async isAvailable(): Promise<boolean> {
    try {
      await execAsync('strix --version');
      return true;
    } catch {
      return false;
    }
  }

  async validateCredentials(): Promise<ProviderReadiness> {
    const missing = [];
    if (!process.env.STRIX_LLM) missing.push('STRIX_LLM');
    if (!process.env.LLM_API_KEY) missing.push('LLM_API_KEY');
    
    if (missing.length > 0) {
      return { ready: false, provider: this.type, missingRequirements: missing };
    }

    // Check Docker
    try {
      await execAsync('docker info');
      return { ready: true, provider: this.type };
    } catch {
      return { ready: false, provider: this.type, reason: 'Docker not available' };
    }
  }

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
    const startedAt = new Date();
    const runName = `scan_${Date.now()}`;
    const scanDir = path.join('strix_runs', runName);

    try {
      let command = `strix -n -t ${request.target} --scan-mode ${request.scanMode}`;
      if (request.maxBudgetUsd) command += ` --max-budget ${request.maxBudgetUsd}`;
      if (request.instructions) command += ` --instruction "${request.instructions}"`;
      if (request.scopeMode) command += ` --scope-mode ${request.scopeMode}`;
      if (request.diffBase) command += ` --diff-base ${request.diffBase}`;

      await execAsync(command);

      const runJsonPath = path.join(scanDir, 'run.json');
      const runData = JSON.parse(await fs.readFile(runJsonPath, 'utf8'));

      const findingsPath = path.join(scanDir, 'vulnerabilities.json');
      let rawFindings: unknown[] = [];
      try {
        rawFindings = JSON.parse(await fs.readFile(findingsPath, 'utf8'));
      } catch {
        // No findings
      }

      const status = runData.status === 'completed' ? SecurityScanStatus.COMPLETED : SecurityScanStatus.FAILED;
      const findings = this.normalizeFindings(rawFindings);

      return {
        scanId: runName,
        provider: this.type,
        status,
        startedAt,
        completedAt: new Date(),
        findings,
        metadata: {
          targetIdentifier: request.target,
          targetEnvironment: SecurityTargetEnvironment.LOCAL,
          startedAt,
          completedAt: new Date(),
          durationMs: (Date.now() - startedAt.getTime()),
          findingCount: findings.length,
          criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
          highCount: findings.filter(f => f.severity === 'HIGH').length,
          mediumCount: findings.filter(f => f.severity === 'MEDIUM').length,
          lowCount: findings.filter(f => f.severity === 'LOW').length,
          infoCount: findings.filter(f => f.severity === 'INFO').length,
          artifactLocations: [scanDir],
        },
      };
    } catch (error: any) {
      return {
        scanId: runName,
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
          errorCategory: SecurityScanErrorCategory.PROVIDER,
          errorDetails: error.message,
        },
      };
    }
  }

  normalizeFindings(rawFindings: unknown): any[] {
    return this.normalizer.normalize(Array.isArray(rawFindings) ? rawFindings : [], 'strix-cli');
  }
}
