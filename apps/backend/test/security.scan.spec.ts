import { DefaultFindingNormalizer, SecurityFindingSeverity, SecurityFindingStatus, DefaultSecurityGatePolicy, SecurityReportGenerator, SecurityScanStatus, SecurityScanProviderType } from '../src/core/security/scan';

describe('Security Scan Abstraction & Normalization Tests', () => {
  const normalizer = new DefaultFindingNormalizer();
  const gatePolicy = new DefaultSecurityGatePolicy();
  const reportGen = new SecurityReportGenerator();

  describe('Finding Normalizer', () => {
    it('should normalize raw findings into standard security findings', () => {
      const raw = [
        {
          id: 'test-1',
          title: 'SQL Injection in Login',
          severity: 'critical',
          description: 'Unparameterized query in email field',
          file: 'src/modules/auth/auth.service.ts',
          evidence: 'SELECT * FROM users WHERE email = \'admin@example.com\'',
          remediation: 'Use Prisma parameterized queries',
        },
      ];

      const normalized = normalizer.normalize(raw, 'strix-cli');

      expect(normalized.length).toBe(1);
      expect(normalized[0].id).toBe('test-1');
      expect(normalized[0].severity).toBe(SecurityFindingSeverity.CRITICAL);
      expect(normalized[0].sourceProvider).toBe('strix-cli');
      expect(normalized[0].status).toBe(SecurityFindingStatus.OPEN);
      expect(normalized[0].fingerprint).toBeDefined();
    });

    it('should generate stable fingerprints and deduplicate findings', () => {
      const f1 = {
        sourceTool: 'strix-cli',
        severity: SecurityFindingSeverity.HIGH,
        affectedFile: 'src/app.controller.ts',
        evidence: 'Bearer secret_token_123',
      };

      const f2 = {
        sourceTool: 'strix-cli',
        severity: SecurityFindingSeverity.HIGH,
        affectedFile: 'src/app.controller.ts',
        evidence: 'Bearer secret_token_456',
      };

      const fp1 = normalizer.generateFingerprint(f1);
      const fp2 = normalizer.generateFingerprint(f2);

      // Evidence is normalized/redacted before fingerprinting, so similar findings share fingerprints
      expect(fp1).toBe(fp2);

      const findings = [
        {
          id: '1',
          fingerprint: fp1,
          sourceTool: 'strix-cli',
          title: 'Issue A',
          severity: SecurityFindingSeverity.HIGH,
          status: SecurityFindingStatus.OPEN,
          description: 'Test',
          firstSeen: new Date('2026-01-01'),
          lastSeen: new Date('2026-01-01'),
          metadata: {},
        },
        {
          id: '2',
          fingerprint: fp1,
          sourceTool: 'strix-cli',
          title: 'Issue A updated',
          severity: SecurityFindingSeverity.HIGH,
          status: SecurityFindingStatus.OPEN,
          description: 'Test updated',
          firstSeen: new Date('2026-01-02'),
          lastSeen: new Date('2026-01-02'),
          metadata: {},
        },
      ];

      const deduplicated = normalizer.deduplicate(findings);
      expect(deduplicated.length).toBe(1);
      expect(deduplicated[0].firstSeen).toEqual(new Date('2026-01-01'));
      expect(deduplicated[0].lastSeen).toEqual(new Date('2026-01-02'));
    });

    it('should redact sensitive data in evidence', () => {
      const raw = [
        {
          title: 'Secret Leak',
          severity: 'low',
          evidence: 'Password=SuperSecret123 token=Bearer abcdef 192.168.1.50 test@example.com',
        },
      ];

      const normalized = normalizer.normalize(raw, 'test');
      expect(normalized[0].evidence).not.toContain('SuperSecret123');
      expect(normalized[0].evidence).toContain('[REDACTED]');
      expect(normalized[0].evidence).toContain('[IP]');
      expect(normalized[0].evidence).toContain('[EMAIL]');
    });
  });

  describe('Security Gate Policy', () => {
    it('should pass when no blocking findings exist', () => {
      const findings = [
        {
          id: '1',
          fingerprint: 'fp1',
          sourceTool: 'test',
          title: 'Info notice',
          severity: SecurityFindingSeverity.INFO,
          status: SecurityFindingStatus.OPEN,
          description: '',
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {},
        },
      ];

      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
      expect(result.blockingFindings.length).toBe(0);
    });

    it('should block when open critical or high findings exist', () => {
      const findings = [
        {
          id: '1',
          fingerprint: 'fp1',
          sourceTool: 'test',
          title: 'Critical bug',
          severity: SecurityFindingSeverity.CRITICAL,
          status: SecurityFindingStatus.OPEN,
          description: '',
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {},
        },
      ];

      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(false);
      expect(result.blockingFindings.length).toBe(1);
    });

    it('should ignore false positives and accepted risks', () => {
      const findings = [
        {
          id: '1',
          fingerprint: 'fp1',
          sourceTool: 'test',
          title: 'Critical bug',
          severity: SecurityFindingSeverity.CRITICAL,
          status: SecurityFindingStatus.FALSE_POSITIVE,
          description: '',
          firstSeen: new Date(),
          lastSeen: new Date(),
          metadata: {},
        },
      ];

      const result = gatePolicy.evaluate(findings);
      expect(result.passed).toBe(true);
    });
  });

  describe('Report Generator', () => {
    it('should generate valid markdown and json reports', () => {
      const scanResult = {
        scanId: 'scan-123',
        provider: SecurityScanProviderType.STRIX_CLI,
        status: SecurityScanStatus.COMPLETED,
        startedAt: new Date('2026-08-27T10:00:00Z'),
        completedAt: new Date('2026-08-27T10:05:00Z'),
        findings: [
          {
            id: 'f-1',
            fingerprint: 'abc',
            sourceTool: 'strix-cli',
            title: 'Test Finding',
            severity: SecurityFindingSeverity.MEDIUM,
            status: SecurityFindingStatus.OPEN,
            description: 'Desc',
            affectedEndpoint: '/api/v1/test',
            firstSeen: new Date(),
            lastSeen: new Date(),
            metadata: {},
          },
        ],
        metadata: { scanMode: 'quick', target: './' },
      };

      const md = reportGen.generateMarkdownReport(scanResult);
      expect(md).toContain('Security Scan Summary');
      expect(md).toContain('scan-123');
      expect(md).toContain('Test Finding');

      const json = reportGen.generateJsonReport(scanResult);
      expect(json.scanId).toBe('scan-123');
      expect((json.findings as any[]).length).toBe(1);
    });
  });
});