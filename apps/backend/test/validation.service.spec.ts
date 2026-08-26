import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(() => service.validateEmail('user@example.com')).not.toThrow();
      expect(() => service.validateEmail('test.user+tag@domain.co.uk')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => service.validateEmail('invalid')).toThrow(BadRequestException);
      expect(() => service.validateEmail('user@')).toThrow(BadRequestException);
      expect(() => service.validateEmail('@example.com')).toThrow(BadRequestException);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(() => service.validatePassword('SecurePass123')).not.toThrow();
      expect(() => service.validatePassword('MyP@ssw0rd')).not.toThrow();
    });

    it('should reject short passwords', () => {
      expect(() => service.validatePassword('Short1A')).toThrow(BadRequestException);
    });

    it('should reject passwords without uppercase', () => {
      expect(() => service.validatePassword('lowercase123')).toThrow(BadRequestException);
    });

    it('should reject passwords without lowercase', () => {
      expect(() => service.validatePassword('UPPERCASE123')).toThrow(BadRequestException);
    });

    it('should reject passwords without numbers', () => {
      expect(() => service.validatePassword('NoNumbers')).toThrow(BadRequestException);
    });
  });

  describe('validateCoordinates', () => {
    it('should accept valid coordinates', () => {
      expect(() => service.validateCoordinates(0, 0)).not.toThrow();
      expect(() => service.validateCoordinates(-90, 180)).not.toThrow();
      expect(() => service.validateCoordinates(90, -180)).not.toThrow();
    });

    it('should reject invalid latitude', () => {
      expect(() => service.validateCoordinates(91, 0)).toThrow(BadRequestException);
      expect(() => service.validateCoordinates(-91, 0)).toThrow(BadRequestException);
    });

    it('should reject invalid longitude', () => {
      expect(() => service.validateCoordinates(0, 181)).toThrow(BadRequestException);
      expect(() => service.validateCoordinates(0, -181)).toThrow(BadRequestException);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid https URLs', () => {
      expect(() => service.validateUrl('https://api.example.com/data')).not.toThrow();
      expect(() => service.validateUrl('http://example.com')).not.toThrow();
    });

    it('should reject invalid URL format', () => {
      expect(() => service.validateUrl('not a url')).toThrow(BadRequestException);
    });

    it('should reject private IPs', () => {
      expect(() => service.validateUrl('http://localhost:3000')).toThrow(BadRequestException);
      expect(() => service.validateUrl('http://127.0.0.1')).toThrow(BadRequestException);
      expect(() => service.validateUrl('http://192.168.1.1')).toThrow(BadRequestException);
      expect(() => service.validateUrl('http://10.0.0.1')).toThrow(BadRequestException);
      expect(() => service.validateUrl('http://172.16.0.1')).toThrow(BadRequestException);
    });

    it('should reject non-http protocols', () => {
      expect(() => service.validateUrl('ftp://example.com')).toThrow(BadRequestException);
      expect(() => service.validateUrl('file:///etc/passwd')).toThrow(BadRequestException);
    });

    it('should allow custom protocols', () => {
      expect(() => service.validateUrl('https://example.com', ['https'])).not.toThrow();
      expect(() => service.validateUrl('http://example.com', ['https'])).toThrow(BadRequestException);
    });
  });

  describe('validatePaginationLimit', () => {
    it('should return valid limit within bounds', () => {
      expect(service.validatePaginationLimit(10)).toBe(10);
      expect(service.validatePaginationLimit(50)).toBe(50);
    });

    it('should cap limit at maximum', () => {
      expect(service.validatePaginationLimit(200)).toBe(100);
      expect(service.validatePaginationLimit(1000)).toBe(100);
    });

    it('should enforce minimum limit', () => {
      expect(service.validatePaginationLimit(0)).toBe(1);
      expect(service.validatePaginationLimit(-10)).toBe(1);
    });

    it('should respect custom max limit', () => {
      expect(service.validatePaginationLimit(50, 30)).toBe(30);
      expect(service.validatePaginationLimit(20, 30)).toBe(20);
    });
  });
});
