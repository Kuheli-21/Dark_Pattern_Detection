const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user and set HTTP-only refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toEqual({
        id: expect.any(String),
        email: 'testuser@example.com',
      });
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('refreshToken=');

      const user = await User.findOne({ email: 'testuser@example.com' });
      expect(user).not.toBeNull();
      expect(user.refreshTokenHash).not.toBeNull();
    });

    it('should return 409 when registering an existing email', async () => {
      await User.create({
        email: 'existing@example.com',
        passwordHash: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'login@example.com',
          password: 'correctpassword',
        });
    });

    it('should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'correctpassword',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/refresh (Token Rotation)', () => {
    it('should rotate tokens successfully on refresh call', async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'refresh@example.com',
          password: 'password123',
        });

      const cookies = signupRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toHaveProperty('accessToken');
      expect(refreshRes.headers['set-cookie']).toBeDefined();

      // Verify token reuse fails
      const reusedRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(reusedRes.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user and revoke refresh token', async () => {
      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'logout@example.com',
          password: 'password123',
        });

      const cookies = signupRes.headers['set-cookie'];

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Logged out successfully');

      const user = await User.findOne({ email: 'logout@example.com' });
      expect(user.refreshTokenHash).toBeNull();
    });
  });
});
