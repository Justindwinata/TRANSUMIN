import {
  DefaultFindingNormalizer,
  SecurityFinding,
  SecurityFindingSeverity,
  SecurityFindingStatus,
  SecurityGatePolicyConfig,
  DefaultSecurityGatePolicy,
} from '../src/core/security/scan';

describe('Finding Lifecycle Tests', () => {
  const normalizer = new DefaultFindingNormalizer();
  const gatePolicy = new DefaultSecurityGatePolicy({
    blockOnCritical: true,
    blockOnNewHigh: true,
    blockOnNewMedium: false,
    warnOnNewLow: false,
  });

  const createFinding = (
    id: string,
    fingerprint: string,
    severity: SecurityFindingSeverity,
    status: SecurityFindingStatus
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
    verificationStatus: 'UNVERIFIED',
    firstSeen: new Date('2026-01-01'),
    lastSeen: new Date('2026-01-01'),
    metadata: {},
  });

  describe('State Transitions', () => {
    it('should track OPEN → CONFIRMED → FIXED → REGRESSION_VERIFIED', () => {
      const fp = 'fp1';
      const openFinding = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN);
      const confirmedFinding = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.CONFIRMED);
      const fixedFinding = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.FIXED);
      const verifiedFinding = createFinding('f1', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.REGRESSION_VERIFIED);

      // Simulate lifecycle progression
      const findings = [openFinding];
      const normalized = normalizer.deduplicate(findings);
      expect(normalized[0].status).toBe(SecurityFindingStatus.OPEN);

      const withConfirmed = normalizer.deduplicate([...findings, confirmedFinding]);
      expect(withConfirmed[0].status).toBe(SecurityFindingStatus.CONFIRMED);

      const withFixed = normalizer.deduplicate([...withConfirmed, fixedFinding]);
      expect(withFixed[0].status).toBe(SecurityFindingStatus.FIXED);

      const withVerified = normalizer.deduplicate([...withFixed, verifiedFinding]);
      expect(withVerified[0].status).toBe(SecurityFindingStatus.REGRESSION_VERIFIED);
    });

    it('should handle FALSE_POSITIVE classification', () => {
      const fp = 'fp2';
      const openFinding = createFinding('f2', fp, SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.OPEN);
      const fpFinding = createFinding('f2', fp, SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.FALSE_POSITIVE);

      const result = normalizer.deduplicate([openFinding, fpFinding]);
      expect(result[0].status).toBe(SecurityFindingStatus.FALSE_POSITIVE);
    });

    it('should handle ACCEPTED_RISK with waiver', () => {
      const fp = 'fp3';
      const openFinding = createFinding('f3', fp, SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN);
      const waivedFinding = {
        ...openFinding,
        id: 'f3',
        fingerprint: fp,
        status: SecurityFindingStatus.ACCEPTED_RISK,
        waiverReference: 'waiver-123',
        remediationReference: 'PR-456',
      };

      const result = normalizer.deduplicate([openFinding, waivedFinding]);
      expect(result[0].status).toBe(SecurityFindingStatus.ACCEPTED_RISK);
      expect(result[0].waiverReference).toBe('waiver-123');
    });
  });

  describe('Fingerprint Stability', () => {
    it('should generate identical fingerprints for same vulnerability', () => {
      const findingA = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.HIGH,
        affectedEndpoint: '/api/saved-places',
        evidence: 'Bearer token used',
      };

      const findingB = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.HIGH,
        affectedEndpoint: '/api/saved-places',
        evidence: 'Bearer token used',
      };

      const fpA = normalizer.generateFingerprint(findingA);
      const fpB = normalizer.generateFingerprint(findingB);

      expect(fpA).toBe(fpB);
    });

    it('should produce different fingerprints for different endpoints', () => {
      const findingA = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.HIGH,
        affectedEndpoint: '/api/saved-places',
        evidence: 'evidence',
      };

      const findingB = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.HIGH,
        affectedEndpoint: '/api/saved-journeys',
        evidence: 'evidence',
      };

      const fpA = normalizer.generateFingerprint(findingA);
      const fpB = normalizer.generateFingerprint(findingB);

      expect(fpA).not.toBe(fpB);
    });

    it('should produce different fingerprints for different severities', () => {
      const findingA = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.HIGH,
        affectedEndpoint: '/api/test',
        evidence: 'evidence',
      };

      const findingB = {
        sourceProvider: 'strix-managed',
        severity: SecurityFindingSeverity.MEDIUM,
        affectedEndpoint: '/api/test',
        evidence: 'evidence',
      };

      const fpA = normalizer.generateFingerprint(findingA);
      const fpB = normalizer.generateFingerprint(findingB);

      expect(fpA).not.toBe(fpB);
    });
  });

  describe('Deduplication Across Scans', () => {
    it('should merge findings with same fingerprint across scans', () => {
      const fp = 'abc123';
      const scan1Finding = {
        id: 'scan1-f1',
        fingerprint: fp,
        sourceProvider: 'strix-managed',
        title: 'IDOR in saved-places',
        severity: SecurityFindingSeverity.HIGH,
        confidence: 'HIGH',
        category: 'IDOR',
        status: SecurityFindingStatus.OPEN,
        description: 'Scan 1',
        affectedEndpoint: '/api/saved-places',
        firstSeen: new Date('2026-01-01'),
        lastSeen: new Date('2026-01-01'),
        metadata: { scan: 1 },
      };

      const scan2Finding = {
        id: 'scan2-f1',
        fingerprint: fp,
        sourceProvider: 'strix-managed',
        title: 'IDOR in saved-places',
        severity: SecurityFindingSeverity.HIGH,
        confidence: 'HIGH',
        category: 'IDOR',
        status: SecurityFindingStatus.CONFIRMED,
        description: 'Scan 2',
        affectedEndpoint: '/api/saved-places',
        firstSeen: new Date('2026-01-02'),
        lastSeen: new Date('2026-01-02'),
        metadata: { scan: 2 },
      };

      const deduplicated = normalizer.deduplicate([scan1Finding, scan2Finding]);

      expect(deduplicated.length).toBe(1);
      expect(deduplicated[0].status).toBe(SecurityFindingStatus.CONFIRMED);
      expect(deduplicated[0].firstSeen).toEqual(new Date('2026-01-01'));
      expect(deduplicated[0].lastSeen).toEqual(new Date('2026-01-02'));
    });
  });

  describe('Security Gate Evaluation', () => {
    it('should BLOCK on open CRITICAL finding', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.OPEN)];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });

    it('should BLOCK on open HIGH finding', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.HIGH, SecurityFindingStatus.OPEN)];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });

    it('should PASS on FALSE_POSITIVE CRITICAL finding', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.FALSE_POSITIVE)];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should PASS on ACCEPTED_RISK HIGH finding', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.HIGH, SecurityFindingStatus.ACCEPTED_RISK)];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should PASS on FIXED finding', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.FIXED)];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should PASS on MEDIUM/LOW/INFO only findings', () => {
      const findings = [
        createFinding('f1', 'fp1', SecurityFindingSeverity.MEDIUM, SecurityFindingStatus.OPEN),
        createFinding('f2', 'fp2', SecurityFindingSeverity.LOW, SecurityFindingStatus.OPEN),
        createFinding('f3', 'fp3', SecurityFindingSeverity.INFO, SecurityFindingStatus.OPEN),
      ];
      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
    });

    it('should track waivers applied', () => {
      const findings = [createFinding('f1', 'fp1', SecurityFindingSeverity.CRITICAL, SecurityFindingStatus.ACCEPTED_RISK)];
      const result = gatePolicy.evaluate(findings);
      expect(result.waiversApplied).toBeDefined();
      expect(Array.isArray(result.waiversApplied)).toBe(true);
    });
  });

  describe('Confidence and Category', () => {
    it('should extract confidence from raw finding', () => {
      const raw = [{ confidence: 'high', severity: 'high', title: 'Test' }];
      const normalized = normalizer.normalize(raw, 'test');

      expect(normalized[0].confidence).toBe('HIGH');
    });

    it('should default to MEDIUM confidence', () => {
      const raw = [{ severity: 'high', title: 'Test' }];
      const normalized = normalizer.normalize(raw, 'test');

      expect(normalized[0].confidence).toBe('MEDIUM');
    });

    it('should extract category from raw finding', () => {
      const raw = [{ category: 'IDOR', severity: 'high', title: 'Test' }];
      const normalized = normalizer.normalize(raw, 'test');

      expect(normalized[0].category).toBe('IDOR');
    });
  });
});