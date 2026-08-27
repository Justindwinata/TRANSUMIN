import { TargetValidator, SecurityTargetEnvironment } from '../src/core/security/scan';

describe('Target Authorization Tests', () => {
  let validator: TargetValidator;

  beforeEach(() => {
    validator = new TargetValidator(['https://staging-api.transumin.test']);
  });

  describe('Local Development Targets', () => {
    it('should allow local repository targets', () => {
      const result = validator.validateTarget('./', 'repository');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.LOCAL);
    });

    it('should allow relative paths', () => {
      const result = validator.validateTarget('./apps/backend', 'repository');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.LOCAL);
    });

    it('should allow localhost URLs', () => {
      const result = validator.validateTarget('http://localhost:3000', 'url');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.LOCAL);
    });

    it('should allow 127.0.0.1', () => {
      const result = validator.validateTarget('http://127.0.0.1:3000', 'url');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.LOCAL);
    });
  });

  describe('Staging Targets', () => {
    it('should allow staging URLs in allowlist', () => {
      const result = validator.validateTarget('https://staging-api.transumin.test', 'url');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.STAGING);
    });

    it('should allow URLs with staging keyword', () => {
      const result = validator.validateTarget('https://api.staging.transumin.test', 'url');
      expect(result.allowed).toBe(true);
      expect(result.environment).toBe(SecurityTargetEnvironment.STAGING);
    });
  });

  describe('Production Protection', () => {
    it('should block production URLs', () => {
      const result = validator.validateTarget('https://api.transumin.com', 'url');
      expect(result.allowed).toBe(false);
      expect(result.environment).toBe(SecurityTargetEnvironment.PRODUCTION);
    });

    it('should block prod subdomains', () => {
      const result = validator.validateTarget('https://prod-api.example.com', 'url');
      expect(result.allowed).toBe(false);
    });

    it('should block arbitrary external URLs', () => {
      const result = validator.validateTarget('https://malicious-site.com', 'url');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Invalid Targets', () => {
    it('should reject empty targets', () => {
      const result = validator.validateTarget('', 'url');
      expect(result.allowed).toBe(false);
    });

    it('should reject null targets', () => {
      const result = validator.validateTarget(null as any, 'url');
      expect(result.allowed).toBe(false);
    });
  });
});