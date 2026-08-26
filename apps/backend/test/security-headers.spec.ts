import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Security Headers', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Import AppModule
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should set X-Content-Type-Options header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set X-Frame-Options header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('should set X-XSS-Protection header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
  });

  it('should set Strict-Transport-Security header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
  });

  it('should set Referrer-Policy header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should set Content-Security-Policy header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('should not expose X-Powered-By header', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
