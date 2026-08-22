import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '../../src/core/auth/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let configService: ConfigService;
  const testSecret = 'test-secret';

  beforeEach(() => {
    configService = {
      get: (key: string) => key === 'JWT_SECRET' ? testSecret : undefined,
    } as any;
    guard = new JwtAuthGuard(configService);
  });

  function createMockContext(token?: string): ExecutionContext {
    const request: any = {};
    if (token) {
      request.headers = { authorization: `Bearer ${token}` };
    }
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  }

  it('should allow request with valid token', () => {
    const token = jwt.sign({ sub: 'user-1', email: 'test@test.com', exp: Math.floor(Date.now() / 1000) + 3600 }, testSecret);

    const result = guard.canActivate(createMockContext(token));

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException for missing token', () => {
    expect(() => guard.canActivate(createMockContext())).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid token', () => {
    expect(() => guard.canActivate(createMockContext('invalid-token'))).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for malformed authorization header', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'InvalidFormat' } }),
      }),
    } as any;
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should attach user to request', () => {
    const token = jwt.sign({ sub: 'user-1', email: 'test@test.com', exp: Math.floor(Date.now() / 1000) + 3600 }, testSecret);
    const request: any = { headers: { authorization: `Bearer ${token}` } };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    guard.canActivate(ctx);

    expect(request.user).toBeDefined();
    expect(request.user.id).toBe('user-1');
    expect(request.user.email).toBe('test@test.com');
  });

  it('should throw UnauthorizedException for expired token', () => {
    const token = jwt.sign({ sub: 'user-1', email: 'test@test.com', exp: Math.floor(Date.now() / 1000) - 3600 }, testSecret);

    expect(() => guard.canActivate(createMockContext(token))).toThrow(UnauthorizedException);
  });
});
