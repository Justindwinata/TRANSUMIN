export enum SecurityFindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum SecurityFindingStatus {
  OPEN = 'OPEN',
  TRIAGED = 'TRIAGED',
  CONFIRMED = 'CONFIRMED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  ACCEPTED_RISK = 'ACCEPTED_RISK',
  FIXED = 'FIXED',
  REGRESSION_VERIFIED = 'REGRESSION_VERIFIED',
}

export enum SecurityScanStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED_NOT_CONFIGURED = 'SKIPPED_NOT_CONFIGURED',
  BLOCKED = 'BLOCKED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum SecurityScanProviderType {
  STRIX_MANAGED = 'STRIX_MANAGED',
  STRIX_CLI = 'STRIX_CLI',
  DISABLED = 'DISABLED',
}

export interface SecurityScanRequest {
  target: string;
  targetType: 'repository' | 'url' | 'openapi' | 'domain';
  scanMode: 'quick' | 'standard' | 'deep';
  maxBudgetUsd?: number;
  instructions?: string;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
  };
  scopeMode?: 'auto' | 'diff' | 'full';
  diffBase?: string;
}

export interface SecurityScanResult {
  scanId: string;
  provider: SecurityScanProviderType;
  status: SecurityScanStatus;
  startedAt: Date;
  completedAt?: Date;
  findings: SecurityFinding[];
  metadata: {
    scanMode: string;
    target: string;
    budgetUsd?: number;
    durationMs?: number;
    rawOutputPath?: string;
  };
  error?: string;
}

export interface SecurityFinding {
  id: string;
  fingerprint: string;
  sourceTool: string;
  title: string;
  severity: SecurityFindingSeverity;
  status: SecurityFindingStatus;
  description: string;
  affectedComponent?: string;
  affectedFile?: string;
  affectedEndpoint?: string;
  evidence?: string;
  reproductionContext?: string;
  remediationRecommendation?: string;
  firstSeen: Date;
  lastSeen: Date;
  metadata: Record<string, unknown>;
}

export interface SecurityScanProvider {
  type: SecurityScanProviderType;
  name: string;
  isAvailable(): Promise<boolean>;
  executeScan(request: SecurityScanRequest): Promise<SecurityScanResult>;
  normalizeFindings(rawFindings: unknown): SecurityFinding[];
}

export interface SecurityFindingNormalizer {
  normalize(findings: unknown[], sourceTool: string): SecurityFinding[];
  generateFingerprint(finding: Partial<SecurityFinding>): string;
  deduplicate(findings: SecurityFinding[]): SecurityFinding[];
}

export interface SecurityGatePolicy {
  evaluate(findings: SecurityFinding[]): SecurityGateResult;
}

export interface SecurityGateResult {
  passed: boolean;
  blockingFindings: SecurityFinding[];
  warningFindings: SecurityFinding[];
  infoFindings: SecurityFinding[];
  reason: string;
}