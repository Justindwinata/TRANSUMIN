import { SecurityFinding, SecurityScanResult, SecurityScanStatus } from './types';

export class SecurityReportGenerator {
  generateMarkdownReport(result: SecurityScanResult): string {
    const lines: string[] = [];

    lines.push('# Security Scan Summary\n');
    lines.push(`**Scan ID:** ${result.scanId}`);
    lines.push(`**Provider:** ${result.provider}`);
    lines.push(`**Status:** ${result.status}`);
    lines.push(`**Started:** ${result.startedAt.toISOString()}`);
    if (result.completedAt) {
      lines.push(`**Completed:** ${result.completedAt.toISOString()}`);
      lines.push(`**Duration:** ${result.completedAt.getTime() - result.startedAt.getTime()}ms`);
    }
    lines.push('');

    if (result.error) {
      lines.push(`**Error:** ${result.error}\n`);
    }

    lines.push(this.generateFindingsSummary(result.findings));
    lines.push('');
    lines.push(this.generateFindingsTable(result.findings));

    return lines.join('\n');
  }

  generateJsonReport(result: SecurityScanResult): Record<string, unknown> {
    return {
      scanId: result.scanId,
      provider: result.provider,
      status: result.status,
      startedAt: result.startedAt.toISOString(),
      completedAt: result.completedAt?.toISOString(),
      findings: result.findings.map((f) => this.findingToJson(f)),
      metadata: result.metadata,
      error: result.error,
    };
  }

  private generateFindingsSummary(findings: SecurityFinding[]): string {
    const bySeverity = {
      CRITICAL: findings.filter((f) => f.severity === 'CRITICAL').length,
      HIGH: findings.filter((f) => f.severity === 'HIGH').length,
      MEDIUM: findings.filter((f) => f.severity === 'MEDIUM').length,
      LOW: findings.filter((f) => f.severity === 'LOW').length,
      INFO: findings.filter((f) => f.severity === 'INFO').length,
    };

    const lines = ['## Findings Summary\n'];
    lines.push(`- **Critical:** ${bySeverity.CRITICAL}`);
    lines.push(`- **High:** ${bySeverity.HIGH}`);
    lines.push(`- **Medium:** ${bySeverity.MEDIUM}`);
    lines.push(`- **Low:** ${bySeverity.LOW}`);
    lines.push(`- **Info:** ${bySeverity.INFO}`);
    lines.push(`- **Total:** ${findings.length}`);

    return lines.join('\n');
  }

  private generateFindingsTable(findings: SecurityFinding[]): string {
    if (findings.length === 0) {
      return '## Findings\n\nNo findings detected.';
    }

    const lines = ['## Findings\n'];
    lines.push('| Severity | Title | Status | Component |');
    lines.push('|----------|-------|--------|-----------|');

    for (const f of findings) {
      const component = f.affectedComponent || f.affectedEndpoint || f.affectedFile || 'N/A';
      lines.push(`| ${f.severity} | ${f.title} | ${f.status} | ${component} |`);
    }

    return lines.join('\n');
  }

  private findingToJson(finding: SecurityFinding): Record<string, unknown> {
    return {
      id: finding.id,
      fingerprint: finding.fingerprint,
      sourceTool: finding.sourceTool,
      title: finding.title,
      severity: finding.severity,
      status: finding.status,
      description: finding.description,
      affectedComponent: finding.affectedComponent,
      affectedFile: finding.affectedFile,
      affectedEndpoint: finding.affectedEndpoint,
      evidence: finding.evidence,
      reproductionContext: finding.reproductionContext,
      remediationRecommendation: finding.remediationRecommendation,
      firstSeen: finding.firstSeen.toISOString(),
      lastSeen: finding.lastSeen.toISOString(),
    };
  }
}