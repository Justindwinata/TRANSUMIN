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
  READY = 'READY',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMED_OUT = 'TIMED_OUT',
  SKIPPED_NOT_CONFIGURED = 'SKIPPED_NOT_CONFIGURED',
  BLOCKED = 'BLOCKED',
  UNAVAILABLE = 'UNAVAILABLE',
  UNSUPPORTED = 'UNSUPPORTED',
}

export enum SecurityScanProviderType {
  STRIX_MANAGED = 'STRIX_MANAGED',
  STRIX_CLI = 'STRIX_CLI',
  DISABLED = 'DISABLED',
}

export enum SecurityTargetEnvironment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum SecurityScanErrorCategory {
  CONFIGURATION = 'CONFIGURATION',
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  PROVIDER = 'PROVIDER',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  POLICY = 'POLICY',
  UNKNOWN = 'UNKNOWN',
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

export interface SecurityScanMetadata {
  providerVersion?: string;
  scanId?: string;
  targetIdentifier: string;
  targetEnvironment: SecurityTargetEnvironment;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  findingCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  artifactLocations: string[];
  errorCategory?: SecurityScanErrorCategory;
  errorDetails?: string;
}

export interface SecurityScanResult {
  scanId: string;
  provider: SecurityScanProviderType;
  status: SecurityScanStatus;
  startedAt: Date;
  completedAt?: Date;
  findings: SecurityFinding[];
  metadata: SecurityScanMetadata;
  error?: string;
}

export interface SecurityFinding {
  id: string;
  fingerprint: string;
  sourceProvider: string;
  title: string;
  severity: SecurityFindingSeverity;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  status: SecurityFindingStatus;
  description: string;
  affectedComponent?: string;
  affectedFile?: string;
  affectedEndpoint?: string;
  evidence?: string;
  redactedEvidence?: string;
  reproductionContext?: string;
  remediationRecommendation?: string;
  remediationReference?: string;
  waiverReference?: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FALSE_POSITIVE' | 'REGRESSION';
  firstSeen: Date;
  lastSeen: Date;
  metadata: Record<string, unknown>;
}

export interface SecurityScanProvider {
  type: SecurityScanProviderType;
  name: string;
  isAvailable(): Promise<boolean>;
  validateCredentials(): Promise<ProviderReadiness>;
  executeScan(request: SecurityScanRequest): Promise<SecurityScanResult>;
  normalizeFindings(rawFindings: unknown): SecurityFinding[];
}

export interface ProviderReadiness {
  ready: boolean;
  provider: SecurityScanProviderType;
  providerVersion?: string;
  reason?: string;
  missingRequirements?: string[];
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
  waiversApplied: WaiverApplication[];
}

export interface WaiverApplication {
  findingId: string;
  fingerprint: string;
  waiverId: string;
  justification: string;
  expiresAt: Date;
  approvedBy: string;
  isExpired: boolean;
}