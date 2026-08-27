import { SecurityFinding, SecurityFindingSeverity, SecurityFindingStatus, SecurityFindingNormalizer } from './types';
import { createHash } from 'crypto';

export class DefaultFindingNormalizer implements SecurityFindingNormalizer {
  normalize(findings: unknown[], sourceTool: string): SecurityFinding[] {
    return findings
      .map((f) => this.normalizeSingle(f, sourceTool))
      .filter((f): f is SecurityFinding => f !== null);
  }

  private normalizeSingle(raw: unknown, sourceTool: string): SecurityFinding | null {
    const finding = raw as Record<string, unknown>;

    const id = this.extractString(finding, 'id') || this.generateId();
    const title = this.extractString(finding, 'title') || this.extractString(finding, 'name') || 'Untitled Finding';
    const severity = this.extractSeverity(finding);
    const confidence = this.extractConfidence(finding);
    const category = this.extractString(finding, 'category') || this.extractString(finding, 'type') || 'UNKNOWN';
    const description = this.extractString(finding, 'description') || this.extractString(finding, 'detail') || '';
    const affectedFile = this.extractString(finding, 'file') || this.extractString(finding, 'path');
    const affectedEndpoint = this.extractString(finding, 'endpoint') || this.extractString(finding, 'url');
    const evidence = this.extractString(finding, 'evidence') || this.extractString(finding, 'proof') || this.extractString(finding, 'poc');
    const reproductionContext = this.extractString(finding, 'reproduction') || this.extractString(finding, 'steps');
    const remediationRecommendation = this.extractString(finding, 'remediation') || this.extractString(finding, 'fix');
    const affectedComponent = this.extractString(finding, 'component') || this.extractString(finding, 'module');
    const remediationReference = this.extractString(finding, 'remediationReference');
    const waiverReference = this.extractString(finding, 'waiverReference');

    const fingerprint = this.generateFingerprint({
      sourceProvider: sourceTool,
      title,
      severity,
      affectedFile,
      affectedEndpoint,
      affectedComponent,
      evidence,
    });

    const now = new Date();
    const firstSeen = this.extractDate(finding, 'firstSeen') || now;
    const lastSeen = this.extractDate(finding, 'lastSeen') || now;

    const redactedEvidence = this.redactSecrets(evidence);
    const redactedReproduction = this.redactSecrets(reproductionContext);

    const metadata: Record<string, unknown> = { ...finding };
    delete metadata.id;
    delete metadata.title;
    delete metadata.name;
    delete metadata.severity;
    delete metadata.description;
    delete metadata.detail;
    delete metadata.file;
    delete metadata.path;
    delete metadata.endpoint;
    delete metadata.url;
    delete metadata.evidence;
    delete metadata.proof;
    delete metadata.poc;
    delete metadata.reproduction;
    delete metadata.steps;
    delete metadata.remediation;
    delete metadata.fix;
    delete metadata.component;
    delete metadata.module;
    delete metadata.firstSeen;
    delete metadata.lastSeen;
    delete metadata.category;
    delete metadata.type;
    delete metadata.confidence;
    delete metadata.remediationReference;
    delete metadata.waiverReference;

    return {
      id,
      fingerprint,
      sourceProvider: sourceTool,
      title,
      severity,
      confidence,
      category,
      status: SecurityFindingStatus.OPEN,
      description,
      affectedComponent,
      affectedFile,
      affectedEndpoint,
      evidence: redactedEvidence,
      redactedEvidence,
      reproductionContext: redactedReproduction,
      remediationRecommendation,
      remediationReference,
      waiverReference,
      verificationStatus: 'UNVERIFIED',
      firstSeen,
      lastSeen,
      metadata,
    };
  }

  generateFingerprint(finding: Partial<SecurityFinding>): string {
    const parts = [
      finding.sourceProvider || 'unknown',
      finding.severity || 'unknown',
      finding.affectedComponent || finding.affectedFile || finding.affectedEndpoint || 'unknown',
      this.normalizeEvidence(finding.evidence || ''),
    ];

    const normalized = parts
      .map((p) => p.toLowerCase().trim().replace(/\s+/g, '_'))
      .join('|');

    return createHash('sha256').update(normalized).digest('hex').substring(0, 32);
  }

  deduplicate(findings: SecurityFinding[]): SecurityFinding[] {
    const seen = new Map<string, SecurityFinding>();

    for (const finding of findings) {
      const existing = seen.get(finding.fingerprint);

      if (!existing) {
        seen.set(finding.fingerprint, finding);
      } else {
        const merged = this.mergeFindings(existing, finding);
        seen.set(finding.fingerprint, merged);
      }
    }

    return Array.from(seen.values());
  }

  private mergeFindings(existing: SecurityFinding, newer: SecurityFinding): SecurityFinding {
    const firstSeen = existing.firstSeen < newer.firstSeen ? existing.firstSeen : newer.firstSeen;
    const lastSeen = existing.lastSeen > newer.lastSeen ? existing.lastSeen : newer.lastSeen;

    return {
      ...newer,
      id: existing.id,
      firstSeen,
      lastSeen,
      status: this.mergeStatus(existing.status, newer.status),
      evidence: existing.evidence || newer.evidence,
      redactedEvidence: existing.redactedEvidence || newer.redactedEvidence,
      reproductionContext: existing.reproductionContext || newer.reproductionContext,
      metadata: { ...existing.metadata, ...newer.metadata },
    };
  }

  private mergeStatus(existing: SecurityFindingStatus, newer: SecurityFindingStatus): SecurityFindingStatus {
    const priority: SecurityFindingStatus[] = [
      SecurityFindingStatus.CONFIRMED,
      SecurityFindingStatus.TRIAGED,
      SecurityFindingStatus.OPEN,
      SecurityFindingStatus.FALSE_POSITIVE,
      SecurityFindingStatus.ACCEPTED_RISK,
      SecurityFindingStatus.FIXED,
      SecurityFindingStatus.REGRESSION_VERIFIED,
    ];

    const existingIdx = priority.indexOf(existing);
    const newerIdx = priority.indexOf(newer);

    return existingIdx <= newerIdx ? existing : newer;
  }

  private extractString(obj: Record<string, unknown>, key: string): string | undefined {
    const val = obj[key];
    return typeof val === 'string' ? val : undefined;
  }

  private extractConfidence(obj: Record<string, unknown>): 'HIGH' | 'MEDIUM' | 'LOW' {
    const val = obj.confidence;
    if (typeof val === 'string') {
      const upper = val.toUpperCase();
      if (['HIGH', 'MEDIUM', 'LOW'].includes(upper)) {
        return upper as 'HIGH' | 'MEDIUM' | 'LOW';
      }
    }
    return 'MEDIUM';
  }

  private extractSeverity(obj: Record<string, unknown>): SecurityFindingSeverity {
    const val = obj.severity || obj.risk || obj.level;
    if (typeof val === 'string') {
      const upper = val.toUpperCase();
      if (Object.values(SecurityFindingSeverity).includes(upper as SecurityFindingSeverity)) {
        return upper as SecurityFindingSeverity;
      }
    }
    return SecurityFindingSeverity.INFO;
  }

  private extractDate(obj: Record<string, unknown>, key: string): Date | undefined {
    const val = obj[key];
    if (val instanceof Date) return val;
    if (typeof val === 'string' || typeof val === 'number') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
  }

  private generateId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private normalizeEvidence(evidence: string): string {
    return evidence
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]')
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
      .replace(/secret[=:]\s*\S+/gi, 'secret=[REDACTED]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .trim();
  }

  private redactSecrets(text: string | undefined): string | undefined {
    if (!text) return text;
    return this.normalizeEvidence(text);
  }
}
