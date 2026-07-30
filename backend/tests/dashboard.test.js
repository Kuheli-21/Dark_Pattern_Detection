const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const Website = require('../src/models/Website');
const Detection = require('../src/models/Detection');
const User = require('../src/models/User');

let mongoServer;
let authToken;

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
  await Website.deleteMany({});
  await Detection.deleteMany({});
  await User.deleteMany({});

  // Setup authenticated user for protected dashboard routes
  const signupRes = await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'dashboarduser@example.com',
      password: 'password123',
    });

  authToken = signupRes.body.accessToken;
});

describe('Dashboard Integration Tests & Bayesian Math Assertions', () => {
  describe('Bayesian Risk Score Formula Assertions', () => {
    it('should assert Bayesian risk score for 1/1 scans (score: 33)', async () => {
      const website = await Website.upsertAndRecalculateScore('domain1.com', 1, 1);
      expect(website.riskScore).toBe(33);
    });

    it('should assert Bayesian risk score for 10/10 scans (score: 73)', async () => {
      const website = await Website.upsertAndRecalculateScore('domain10.com', 10, 10);
      expect(website.riskScore).toBe(73);
    });

    it('should assert Bayesian risk score for 50/50 scans (score: 93)', async () => {
      const website = await Website.upsertAndRecalculateScore('domain50.com', 50, 50);
      expect(website.riskScore).toBe(93);
    });
  });

  describe('GET /api/dashboard/overview', () => {
    it('should return aggregated summary, top pattern types, and binary model note', async () => {
      // Seed websites and detections
      const site1 = await Website.upsertAndRecalculateScore('site1.com', 10, 8);
      const site2 = await Website.upsertAndRecalculateScore('site2.com', 5, 1);

      await Detection.create([
        {
          websiteId: site1._id,
          snippetText: 'Dark pattern snippet 1',
          patternType: 'dark-pattern',
          isDarkPattern: true,
          confidence: 0.92,
          sourceUrl: 'https://site1.com',
        },
        {
          websiteId: site2._id,
          snippetText: 'Dark pattern snippet 2',
          patternType: 'dark-pattern',
          isDarkPattern: true,
          confidence: 0.89,
          sourceUrl: 'https://site2.com',
        },
      ]);

      const res = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalWebsitesScanned).toBe(2);
      expect(res.body.summary.totalScansPerformed).toBe(15);
      expect(res.body.summary.totalDarkPatternsDetected).toBe(9);
      expect(res.body.topPatternTypes).toBeDefined();
      expect(res.body.binaryModelNote).toContain('binary classifier');
    });

    it('should return 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/dashboard/overview');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/scores (Leaderboard)', () => {
    it('should return paginated websites sorted by riskScore descending', async () => {
      await Website.upsertAndRecalculateScore('highrisk.com', 50, 50); // 93
      await Website.upsertAndRecalculateScore('lowrisk.com', 10, 0); // 7

      const res = await request(app)
        .get('/api/dashboard/scores')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.websites.length).toBe(2);
      expect(res.body.websites[0].domain).toBe('highrisk.com');
      expect(res.body.websites[1].domain).toBe('lowrisk.com');
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return time series trend aggregation', async () => {
      const site = await Website.upsertAndRecalculateScore('trendsite.com', 5, 2);
      await Detection.create({
        websiteId: site._id,
        snippetText: 'Trend test snippet',
        patternType: 'dark-pattern',
        isDarkPattern: true,
        confidence: 0.9,
        sourceUrl: 'https://trendsite.com',
      });

      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.trends).toBeDefined();
      expect(res.body.trends.length).toBeGreaterThan(0);
      expect(res.body.trends[0]).toHaveProperty('date');
      expect(res.body.trends[0]).toHaveProperty('scannedSnippets');
      expect(res.body.trends[0]).toHaveProperty('darkPatternsDetected');
    });
  });
});
