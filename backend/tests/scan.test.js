const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const { connectDB, disconnectDB } = require('../src/config/db');
const Website = require('../src/models/Website');
const Detection = require('../src/models/Detection');

jest.mock('axios');

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
  await Website.deleteMany({});
  await Detection.deleteMany({});
  jest.clearAllMocks();
});

describe('Scan Endpoint Integration Tests', () => {
  describe('POST /api/scan', () => {
    it('should process scan, filter null-confidence snippets, persist detections, and return updated risk score', async () => {
      // Mock Axios response containing 1 dark pattern, 1 normal text, and 1 empty snippet (confidence: null)
      axios.post.mockResolvedValue({
        data: [
          {
            text: 'Hurry! Only 1 item left in stock!',
            isDarkPattern: true,
            confidence: 0.95,
          },
          {
            text: 'Welcome to our online store',
            isDarkPattern: false,
            confidence: 0.88,
          },
          {
            text: '   ',
            isDarkPattern: false,
            confidence: null, // Null confidence snippet to be filtered out
          },
        ],
      });

      const payload = {
        url: 'https://example.com/checkout',
        domain: 'example.com',
        textSnippets: [
          'Hurry! Only 1 item left in stock!',
          'Welcome to our online store',
          '   ',
        ],
      };

      const res = await request(app).post('/api/scan').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.domain).toBe('example.com');
      // scannedCount should be 2 because null confidence snippet was filtered out
      expect(res.body.scannedCount).toBe(2);
      expect(res.body.detectedCount).toBe(1);

      // Bayesian calculation check:
      // PRIOR_DETECTIONS = 1, PRIOR_SCANS = 5
      // totalDetections = 1, totalScans = 2
      // riskScore = Math.min(100, Math.round(((1 + 1) / (2 + 5)) * 100)) = Math.round((2 / 7) * 100) = 29
      expect(res.body.riskScore).toBe(29);

      // Verify Database insertions
      const detections = await Detection.find();
      expect(detections.length).toBe(2); // Only 2 non-null confidence entries stored
      expect(detections.some((d) => d.confidence === null)).toBe(false);

      const website = await Website.findOne({ domain: 'example.com' });
      expect(website).not.toBeNull();
      expect(website.totalScans).toBe(2);
      expect(website.totalDetections).toBe(1);
    });

    it('should handle 502 Bad Gateway when AI Service fails after retries', async () => {
      axios.post.mockRejectedValue(new Error('Connection refused'));

      const payload = {
        url: 'https://example.com/page',
        domain: 'example.com',
        textSnippets: ['Some test snippet'],
      };

      const res = await request(app).post('/api/scan').send(payload);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('BAD_GATEWAY');
      expect(res.body.error.message).toContain('unavailable');
    });

    it('should return 400 for invalid payload (missing domain or invalid url)', async () => {
      const res = await request(app).post('/api/scan').send({
        url: 'invalid-url',
        domain: '',
        textSnippets: [],
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
