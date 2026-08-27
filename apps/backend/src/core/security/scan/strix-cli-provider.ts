import { SecurityScanProvider, SecurityScanProviderType, SecurityScanRequest, SecurityScanResult, SecurityScanStatus } from './types';
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

  async executeScan(request: SecurityScanRequest): Promise<SecurityScanResult> {
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
        // No findings file might mean no findings or scan failure
      }

      const status = runData.status === 'completed' ? SecurityScanStatus.COMPLETED : SecurityScanStatus.FAILED;

      return {
        scanId: runName,
        provider: this.type,
        status,
        startedAt: new Date(runData.startedAt),
        completedAt: new Date(),
        findings: this.normalizeFindings(rawFindings),
        metadata: {
          scanMode: request.scanMode,
          target: request.target,
          budgetUsd: request.maxBudgetUsd,
          rawOutputPath: scanDir,
        },
      };
    } catch (error: any) {
      return {
        scanId: runName,
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
    return this.normalizer.normalize(Array.isArray(rawFindings) ? rawFindings : [], 'strix-cli');
  }
}