import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';

describe('Auth Security Flow', () => {
  let app: INestApplication;
  const jwtSecret = 'transumin-dev-secret-CHANGE-IN-PRODUCTION-USE-A-LONG-RANDOM-STRING';

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

  it('should not return password hash in register response', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-user-security@example.test',
        fullName: 'Test Security',
        password: 'Password123',
      })
      .expect(201);

    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });

  it('should not return password hash in login response', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test-user-security@example.test',
        password: 'Password123',
      })
      .expect(200);

    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test-user-security@example.test',
        password: 'WrongPassword',
      })
      .expect(400);
  });
});