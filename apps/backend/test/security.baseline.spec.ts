import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';

describe('Security Baseline Tests — Authentication & Authorization', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtSecret = 'test-jwt-secret';

  const testUser1 = {
    id: 'user-1',
    email: 'security-user@example.test',
    password: 'Test@1234567',
  };

  const testUser2 = {
    id: 'user-2',
    email: 'security-user2@example.test',
    password: 'Test@1234567',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Import AppModule
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('1. Authentication — JWT Token Validation', () => {
    it('should reject requests without authorization header', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .expect(401);

      expect(res.body.message).toContain('Missing or invalid authorization header');
    });

    it('should reject requests with invalid bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.message).toContain('Invalid or expired token');
    });

    it('should reject requests with malformed authorization header', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', 'NotBearer token')
        .expect(401);

      expect(res.body.message).toContain('Missing or invalid authorization header');
    });

    it('should accept valid JWT token', async () => {
      const token = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '7d' },
      );

      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('2. Authorization — Ownership Checks (IDOR Prevention)', () => {
    let user1Token: string;
    let user2Token: string;
    let savedPlaceId: string;

    beforeAll(async () => {
      user1Token = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '7d' },
      );

      user2Token = jwt.sign(
        { sub: testUser2.id, email: testUser2.email },
        jwtSecret,
        { expiresIn: '7d' },
      );

      const place = await prisma.savedPlace.create({
        data: {
          userId: testUser1.id,
          name: 'Test Place',
          address: '123 Test St',
          lat: 0,
          lon: 0,
        },
      });
      savedPlaceId = place.id;
    });

    it('should allow user to retrieve own saved places', async () => {
      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.some((p: any) => p.id === savedPlaceId)).toBe(true);
    });

    it('should prevent user from accessing another user saved place directly', async () => {
      const res = await request(app.getHttpServer())
        .get(`/saved-places/${savedPlaceId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(res.body.message).toContain('Not your saved place');
    });

    it('should prevent user from updating another user saved place', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/saved-places/${savedPlaceId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacked Place' })
        .expect(403);

      expect(res.body.message).toContain('Not your saved place');
    });

    it('should prevent user from deleting another user saved place', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/saved-places/${savedPlaceId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(res.body.message).toContain('Not your saved place');
    });

    it('should allow user to modify own saved place', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/saved-places/${savedPlaceId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Updated Place' })
        .expect(200);

      expect(res.body.name).toBe('Updated Place');
    });
  });

  describe('3. Input Validation — SQL Injection Prevention', () => {
    let validToken: string;

    beforeAll(() => {
      validToken = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '7d' },
      );
    });

    it('should sanitize SQL-like input in saved place name', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: "'; DROP TABLE saved_places; --",
          address: '123 Test St',
          lat: 0,
          lon: 0,
        })
        .expect(201);

      expect(res.body.name).toBe("'; DROP TABLE saved_places; --");
    });

    it('should reject invalid latitude values', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Test',
          address: '123 Test St',
          lat: 'invalid',
          lon: 0,
        })
        .expect(400);
    });

    it('should reject out-of-bounds latitude', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Test',
          address: '123 Test St',
          lat: 91,
          lon: 0,
        })
        .expect(400);
    });
  });

  describe('4. Session Management — Token Expiry', () => {
    it('should reject expired JWT tokens', async () => {
      const expiredToken = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '-1s' },
      );

      const res = await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.message).toContain('Invalid or expired token');
    });
  });

  describe('5. Rate Limiting', () => {
    let validToken: string;

    beforeAll(() => {
      validToken = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '7d' },
      );
    });

    it('should enforce rate limiting on sensitive endpoints', async () => {
      // Attempt multiple rapid requests
      const requests = Array(101)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .get('/saved-places')
            .set('Authorization', `Bearer ${validToken}`),
        );

      const results = await Promise.all(requests);
      const rateLimited = results.some((r) => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });

  describe('6. Data Type Validation', () => {
    let validToken: string;

    beforeAll(() => {
      validToken = jwt.sign(
        { sub: testUser1.id, email: testUser1.email },
        jwtSecret,
        { expiresIn: '7d' },
      );
    });

    it('should reject non-object body', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/json')
        .send('not an object')
        .expect(400);
    });

    it('should reject extra fields (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Test',
          address: '123 Test St',
          lat: 0,
          lon: 0,
          isAdmin: true,
          role: 'admin',
        })
        .expect(201);

      expect(res.body.isAdmin).toBeUndefined();
      expect(res.body.role).toBeUndefined();
    });
  });
});
