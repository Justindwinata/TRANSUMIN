import { DefaultSecurityGatePolicy, SecurityFindingSeverity, SecurityFindingStatus, WaiverApplication } from '../src/core/security/scan';

describe('Security Gate Policy & Waiver Tests', () => {
  let policy: DefaultSecurityGatePolicy;

  beforeEach(() => {
    policy = new DefaultSecurityGatePolicy();
  });

  const createFinding = (severity: SecurityFindingSeverity, status: SecurityFindingStatus) => ({
    id: 'f1',
    fingerprint: 'fp1',
    sourceProvider: 'test',
    title: 'Test Finding',
    severity,
    confidence: 'MEDIUM' as const,
    category: 'TEST',
    status,
    description: 'Test',
    verificationStatus: 'UNVERIFIED' as const,
    firstSeen: new Date(),
    lastSeen: new Date(),
    metadata: {},
  });

  describe('Critical Findings', () => {
    it('should block on open critical findings', () => {
      const findings = [createFinding(SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.OPEN)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });

    it('should pass when critical finding is marked false positive', () => {
      const findings = [createFinding(SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.FALSE_POSITIVE)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
      expect(result.blockingFindings.length).toBe(0);
    });

    it('should pass when critical finding is accepted risk', () => {
      const findings = [createFinding(SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.ACCEPTED_RISK)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
      expect(result.blockingFindings.length).toBe(0);
    });
  });

  describe('High Findings', () => {
    it('should block on open high findings', () => {
      const findings = [createFinding(SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });

    it('should pass when high finding is fixed', () => {
      const findings = [createFinding(SecurityFindingSeverity.HIGH, SecurityFindingStatus.FIXED)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
    });
  });

  describe('Medium/Low/Info Findings', () => {
    it('should not block on medium findings', () => {
      const findings = [createFinding(SecurityFindingSeverity.MEDIUM, SecurityFindingStatus.OPEN)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
      expect(result.warningFindings.length).toBe(0);
    });

    it('should not block on low findings', () => {
      const findings = [createFinding(SecurityFindingSeverity.LOW, SecurityFindingStatus.OPEN)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should not block on info findings', () => {
      const findings = [createFinding(SecurityFindingSeverity.INFO, SecurityFindingStatus.OPEN)];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
      expect(result.infoFindings.length).toBe(1);
    });
  });

  describe('Mixed Scenarios', () => {
    it('should pass with only medium and low findings', () => {
      const findings = [
        createFinding(SecurityFindingSeverity.MEDIUM, SecurityFindingStatus.OPEN),
        createFinding(SecurityFindingSeverity.LOW, SecurityFindingStatus.OPEN),
      ];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should block if any critical or high is open', () => {
      const findings = [
        createFinding(SecurityFindingSeverity.MEDIUM, SecurityFindingStatus.OPEN),
        createFinding(SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.OPEN),
      ];
      const result = policy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should pass on empty findings', () => {
      const result = policy.evaluate([]);
      expect(result.passed).toBe(true);
      expect(result.blockingFindings.length).toBe(0);
    });
  });
});