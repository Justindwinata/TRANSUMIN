import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('API Endpoint Hardening', () => {
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

  describe('Unauthenticated Endpoints', () => {
    it('should not allow access to history without token', async () => {
      await request(app.getHttpServer())
        .get('/history')
        .expect(401);
    });

    it('should not allow access to saved-places without token', async () => {
      await request(app.getHttpServer())
        .get('/saved-places')
        .expect(401);
    });
  });

  describe('CORS Hardening', () => {
    it('should reject unauthorized origin', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'http://malicious.com');

      // Should not include Access-Control-Allow-Origin: http://malicious.com
      expect(res.headers['access-control-allow-origin']).not.toBe('http://malicious.com');
    });
  });
});
