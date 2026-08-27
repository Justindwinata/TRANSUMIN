import { SecurityFinding, SecurityFindingSeverity, SecurityGatePolicy, SecurityGateResult } from './types';

export interface SecurityGatePolicyConfig {
  blockOnCritical: boolean;
  blockOnNewHigh: boolean;
  blockOnNewMedium: boolean;
  warnOnNewLow: boolean;
}

export class DefaultSecurityGatePolicy implements SecurityGatePolicy {
  private config: SecurityGatePolicyConfig;

  constructor(config: Partial<SecurityGatePolicyConfig> = {}) {
    this.config = {
      blockOnCritical: config.blockOnCritical ?? true,
      blockOnNewHigh: config.blockOnNewHigh ?? true,
      blockOnNewMedium: config.blockOnNewMedium ?? false,
      warnOnNewLow: config.warnOnNewLow ?? false,
    };
  }

  evaluate(findings: SecurityFinding[]): SecurityGateResult {
    const blockingFindings: SecurityFinding[] = [];
    const warningFindings: SecurityFinding[] = [];
    const infoFindings: SecurityFinding[] = [];

    for (const finding of findings) {
      if (finding.status === 'FALSE_POSITIVE' || finding.status === 'ACCEPTED_RISK') {
        continue;
      }

      if (
        this.config.blockOnCritical &&
        finding.severity === SecurityFindingSeverity.CRITICAL &&
        finding.status === 'OPEN'
      ) {
        blockingFindings.push(finding);
      } else if (
        this.config.blockOnNewHigh &&
        finding.severity === SecurityFindingSeverity.HIGH &&
        finding.status === 'OPEN'
      ) {
        blockingFindings.push(finding);
      } else if (
        this.config.blockOnNewMedium &&
        finding.severity === SecurityFindingSeverity.MEDIUM &&
        finding.status === 'OPEN'
      ) {
        blockingFindings.push(finding);
      } else if (
        this.config.warnOnNewLow &&
        (finding.severity === SecurityFindingSeverity.LOW || finding.severity === SecurityFindingSeverity.INFO) &&
        finding.status === 'OPEN'
      ) {
        warningFindings.push(finding);
      } else if (finding.severity === SecurityFindingSeverity.INFO) {
        infoFindings.push(finding);
      }
    }

    const passed = blockingFindings.length === 0;
    const reason = passed ? 'No blocking findings' : `${blockingFindings.length} blocking finding(s) detected`;

    return { passed, blockingFindings, warningFindings, infoFindings, reason };
  }
}