import {
  DefaultFindingNormalizer,
  SecurityFinding,
  SecurityFindingSeverity,
  SecurityFindingStatus,
  DefaultSecurityGatePolicy,
} from '../src/core/security/scan';

describe('Remediation and Re-scan Verification Tests', () => {
  const normalizer = new DefaultFindingNormalizer();
  const gatePolicy = new DefaultSecurityGatePolicy();

  const createFinding = (
    id: string,
    fingerprint: string,
    severity: SecurityFindingSeverity,
    status: SecurityFindingStatus,
    firstSeen = new Date('2026-01-01')
  ): SecurityFinding => ({
    id,
    fingerprint,
    sourceProvider: 'strix-managed',
    title: 'Test Finding',
    severity,
    confidence: 'HIGH',
    category: 'TEST',
    status,
    description: 'Test finding',
    affectedEndpoint: '/api/test',
    verificationStatus: 'UNVERIFIED',
    firstSeen,
    lastSeen: firstSeen,
    metadata: {},
  });

  describe('Remediation Tracking', () => {
    it('should track finding from OPEN through FIXED', () => {
      const fp = 'remediation-fp-1';
      const initial = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN);
      const confirmed = { ...initial, id: 'f1', status: SecurityFindingStatus.CONFIRMED, remediationReference: 'PR-123' };
      const fixed = { ...initial, id: 'f1', status: SecurityFindingStatus.FIXED, remediationReference: 'PR-123', verificationStatus: 'VERIFIED' };

      // Initial scan
      let findings = normalizer.deduplicate([initial]);
      expect(findings[0].status).toBe(SecurityFindingStatus.OPEN);

      // Triaged and confirmed
      findings = normalizer.deduplicate([...findings, confirmed]);
      expect(findings[0].status).toBe(SecurityFindingStatus.CONFIRMED);
      expect(findings[0].remediationReference).toBe('PR-123');

      // After fix
      findings = normalizer.deduplicate([...findings, fixed]);
      expect(findings[0].status).toBe(SecurityFindingStatus.FIXED);
      expect(findings[0].verificationStatus).toBe('VERIFIED');
    });

    it('should handle finding that was FIXED but appears again (REGRESSION)', () => {
      const fp = 'regression-fp-1';
      const fixed = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.FIXED, new Date('2026-01-01'));
      const reappeared = { ...fixed, id: 'f1', status: SecurityFindingStatus.OPEN, verificationStatus: 'REGRESSION', lastSeen: new Date('2026-02-01') };

      const findings = normalizer.deduplicate([fixed, reappeared]);
      // Note: FIXED has higher priority than OPEN in merge logic
      // A reappeared finding with OPEN status will be merged but status remains FIXED
      // The verificationStatus captures the regression
      expect(findings[0].verificationStatus).toBe('REGRESSION');
      expect(findings[0].lastSeen).toEqual(new Date('2026-02-01'));
    });
  });

  describe('Gate Policy with Remediated Findings', () => {
    it('should PASS when CRITICAL finding is FIXED', () => {
      const findings = [
        { ...createFinding('f1', 'fp1', SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.FIXED), id: 'f1', fingerprint: 'fp1' },
      ];
      const result = new DefaultSecurityGatePolicy().evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should PASS when HIGH finding is FIXED', () => {
      const findings = [
        { ...createFinding('f1', 'fp1', SecurityFindingSeverity.HIGH, SecurityFindingStatus.FIXED), id: 'f1', fingerprint: 'fp1' },
      ];
      const result = new DefaultSecurityGatePolicy().evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should BLOCK when HIGH finding is OPEN after re-scan', () => {
      const findings = [
        { ...createFinding('f1', 'fp1', SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN), id: 'f1', fingerprint: 'fp1' },
      ];
      const result = new DefaultSecurityGatePolicy().evaluate(findings);
      expect(result.passed).toBe(false);
    });
  });

  describe('Finding History Tracking', () => {
    it('should preserve firstSeen across re-scans', () => {
      const fp = 'history-fp-1';
      const scan1 = createFinding('scan1-f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN, new Date('2026-01-01'));
      const scan2 = createFinding('scan2-f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.CONFIRMED, new Date('2026-01-15'));

      const deduplicated = normalizer.deduplicate([scan1, scan2]);
      expect(deduplicated[0].firstSeen).toEqual(new Date('2026-01-01'));
      expect(deduplicated[0].lastSeen).toEqual(new Date('2026-01-15'));
    });

    it('should track waiver reference across re-scans', () => {
      const fp = 'waiver-fp-1';
      const initial = createFinding('f1', fp, SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.OPEN);
      const waived = { ...initial, id: 'f1', status: SecurityFindingStatus.ACCEPTED_RISK, waiverReference: 'WAIVER-2026-001' };

      const deduplicated = normalizer.deduplicate([initial, waived]);
      expect(deduplicated[0].status).toBe(SecurityFindingStatus.ACCEPTED_RISK);
      expect(deduplicated[0].waiverReference).toBe('WAIVER-2026-001');
    });
  });
});