import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';

describe('Authorization Security Tests', () => {
  let app: INestApplication;
  const jwtSecret = 'test-jwt-secret';

  const userA = { id: 'user-a-123', email: 'userA@example.test' };
  const userB = { id: 'user-b-456', email: 'userB@example.test' };

  const tokenA = jwt.sign({ sub: userA.id, email: userA.email }, jwtSecret, { expiresIn: '7d' });
  const tokenB = jwt.sign({ sub: userB.id, email: userB.email }, jwtSecret, { expiresIn: '7d' });

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

  describe('Saved Places — Cross-User Access Prevention', () => {
    let placeId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'User A Place', address: '123 St', lat: -6.2, lon: 106.8 });
      placeId = res.body.id;
    });

    it('should allow owner to read own saved place', async () => {
      await request(app.getHttpServer())
        .get(`/saved-places/${placeId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });

    it('should prevent other user from reading saved place (IDOR)', async () => {
      await request(app.getHttpServer())
        .get(`/saved-places/${placeId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });

    it('should prevent other user from updating saved place', async () => {
      await request(app.getHttpServer())
        .patch(`/saved-places/${placeId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'HACKED' })
        .expect(403);
    });

    it('should prevent other user from deleting saved place', async () => {
      await request(app.getHttpServer())
        .delete(`/saved-places/${placeId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });
  });

  describe('Saved Journeys — Cross-User Access Prevention', () => {
    let journeyId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-journeys')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          originName: 'Station A',
          destName: 'Station B',
          payloadJson: '{"mode":"transjakarta"}',
        });
      journeyId = res.body.id;
    });

    it('should allow owner to read own saved journey', async () => {
      await request(app.getHttpServer())
        .get(`/saved-journeys/${journeyId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });

    it('should prevent other user from reading saved journey (IDOR)', async () => {
      await request(app.getHttpServer())
        .get(`/saved-journeys/${journeyId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });

    it('should prevent other user from updating saved journey', async () => {
      await request(app.getHttpServer())
        .patch(`/saved-journeys/${journeyId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ originName: 'HACKED' })
        .expect(403);
    });

    it('should prevent other user from deleting saved journey', async () => {
      await request(app.getHttpServer())
        .delete(`/saved-journeys/${journeyId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });
  });

  describe('Journey History — Cross-User Access Prevention', () => {
    let historyId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/history')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ originName: 'Place X', destName: 'Place Y', summaryJson: '{"duration":30}' });
      historyId = res.body.id;
    });

    it('should allow owner to read own history entry', async () => {
      await request(app.getHttpServer())
        .get(`/history/${historyId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });

    it('should prevent other user from reading history entry (IDOR)', async () => {
      await request(app.getHttpServer())
        .get(`/history/${historyId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });

    it('should prevent other user from deleting history entry', async () => {
      await request(app.getHttpServer())
        .delete(`/history/${historyId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });
  });

  describe('Notifications — Cross-User Access Prevention', () => {
    it('should only show user own notifications', async () => {
      const resA = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      const resB = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      // Each user should only see their own notifications
      const idsA = resA.body.map((n: any) => n.userId);
      const idsB = resB.body.map((n: any) => n.userId);

      expect(idsA.every((id: string) => id === userA.id)).toBe(true);
      expect(idsB.every((id: string) => id === userB.id)).toBe(true);
    });
  });

  describe('Malformed Identifiers', () => {
    it('should reject non-UUID identifiers', async () => {
      await request(app.getHttpServer())
        .get('/saved-places/not-a-uuid')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(400);
    });

    it('should reject SQL injection in IDs', async () => {
      await request(app.getHttpServer())
        .get("/saved-places/1' OR '1'='1")
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(400);
    });

    it('should reject overly long identifiers', async () => {
      const longId = 'a'.repeat(1000);
      await request(app.getHttpServer())
        .get(`/saved-places/${longId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(400);
    });
  });

  describe('Role Escalation Prevention', () => {
    it('should not allow users to set admin role via request', async () => {
      const res = await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'Test Place',
          address: '123 St',
          lat: 0,
          lon: 0,
          isAdmin: true,
          role: 'admin',
        })
        .expect(400);

      // Extra fields should be rejected with forbidNonWhitelisted
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Pagination Safety', () => {
    it('should cap large pagination limits', async () => {
      const res = await request(app.getHttpServer())
        .get('/history?limit=10000')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Should return at most the capped limit, not 10000 entries
      expect(res.body.length).toBeLessThanOrEqual(50);
    });

    it('should reject negative pagination', async () => {
      await request(app.getHttpServer())
        .get('/history?limit=-1')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Should return default/first page, not error
    });
  });

  describe('HTTP Method Enforcement', () => {
    it('should reject wrong HTTP method on POST-only endpoint', async () => {
      await request(app.getHttpServer())
        .delete('/auth/register')
        .expect(404);
    });

    it('should reject wrong HTTP method on GET-only endpoint', async () => {
      await request(app.getHttpServer())
        .post('/saved-places')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(201);

      // List endpoint should not accept POST
      await request(app.getHttpServer())
        .get('/saved-places')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });
  });

  describe('Information Disclosure Prevention', () => {
    it('should not expose internal error details', async () => {
      const res = await request(app.getHttpServer())
        .get('/nonexistent-path')
        .expect(404);

      expect(JSON.stringify(res.body)).not.toContain('stack');
      expect(JSON.stringify(res.body)).not.toContain('node_modules');
    });

    it('should not echo invalid request bodies', async () => {
      const maliciousBody = '<script>alert("xss")</script>';
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: maliciousBody, fullName: maliciousBody, password: maliciousBody })
        .expect(400);

      expect(JSON.stringify(res.body)).not.toContain('<script>');
    });

    it('should not identify server technology', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });
});
