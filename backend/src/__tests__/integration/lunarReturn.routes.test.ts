/**
 * Lunar Return API Integration Tests
 * Testing lunar return endpoints end-to-end
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import request from 'supertest';
import app from '../../server';
import db from '../../config/database';
import { generateToken } from '../../utils/auth';

// Mock database
jest.mock('../../db');

// Mock Swiss Ephemeris to avoid native module issues
jest.mock('swisseph', () => ({
  swe_calc_ut: jest.fn(() => ({
    error: '',
    data: [120.5, 5.2, 1.0, 0.5],
  })),
  swe_set_ephe_path: jest.fn(),
  SEFLG_SWIEPH: 2,
  SEFLG_SPEED: 4,
  swe_get_ayanamsa: jest.fn(() => ({ error: '', data: [24.5] })),
}));

const mockDb = db as jest.MockedFunction<typeof db>;

describe('Lunar Return API Integration Tests', () => {
  let authToken: string;
  const mockUserId = 'user_123';

  beforeEach(() => {
    // Create mock user and token
    authToken = generateToken(mockUserId, 'test@example.com');

    // Mock database responses
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue([{ id: 1 }]),
      del: jest.fn().mockResolvedValue(1),
      count: jest.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/lunar-return/next', () => {
    test('should return next lunar return date', async () => {
      // Mock natal chart
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      const response = await request(app)
        .get('/api/lunar-return/next')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('nextReturn');
      expect(response.body.data).toHaveProperty('natalMoon');
      expect(response.body.data.nextReturn).toBeInstanceOf(Date);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/lunar-return/next')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 if no natal chart exists', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/api/lunar-return/next')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Natal chart not found');
    });
  });

  describe('GET /api/lunar-return/current', () => {
    test('should return current lunar return info', async () => {
      const response = await request(app)
        .get('/api/lunar-return/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('returnDate');
      expect(response.body.data).toHaveProperty('daysUntil');
      expect(response.body.data.daysUntil).toBeGreaterThan(0);
      expect(response.body.data.daysUntil).toBeLessThan(30);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/lunar-return/current')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/lunar-return/chart', () => {
    test('should return lunar return chart for given date', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      const response = await request(app)
        .post('/api/lunar-return/chart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          returnDate: '2026-02-15T00:00:00Z',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('returnDate');
      expect(response.body.data).toHaveProperty('moonPosition');
      expect(response.body.data).toHaveProperty('moonPhase');
      expect(response.body.data).toHaveProperty('housePlacement');
      expect(response.body.data).toHaveProperty('aspects');
      expect(response.body.data).toHaveProperty('theme');
      expect(response.body.data).toHaveProperty('intensity');
    });

    test('should return 400 if returnDate is missing', async () => {
      const response = await request(app)
        .post('/api/lunar-return/chart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('returnDate is required');
    });

    test('should return 400 if date format is invalid', async () => {
      const response = await request(app)
        .post('/api/lunar-return/chart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          returnDate: 'invalid-date',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid date format');
    });
  });

  describe('POST /api/lunar-return/forecast', () => {
    test('should return monthly forecast', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      (mockDb().where().first as jest.Mock).mockResolvedValue(undefined); // No existing forecast

      const response = await request(app)
        .post('/api/lunar-return/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          returnDate: '2026-02-15T00:00:00Z',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('returnDate');
      expect(response.body.data).toHaveProperty('theme');
      expect(response.body.data).toHaveProperty('intensity');
      expect(response.body.data).toHaveProperty('emotionalTheme');
      expect(response.body.data).toHaveProperty('actionAdvice');
      expect(response.body.data).toHaveProperty('keyDates');
      expect(response.body.data).toHaveProperty('predictions');
      expect(response.body.data).toHaveProperty('rituals');
      expect(response.body.data).toHaveProperty('journalPrompts');
    });

    test('should calculate next lunar return if date not provided', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      (mockDb().where().first as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/lunar-return/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('returnDate');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/lunar-return/forecast')
        .send({
          returnDate: '2026-02-15T00:00:00Z',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/lunar-return/history', () => {
    test('should return lunar return history', async () => {
      const mockReturns = [
        {
          id: 'lr_1',
          userId: mockUserId,
          returnDate: '2026-02-15T00:00:00Z',
          theme: 'Test Theme',
          intensity: 7,
          emotionalTheme: 'Test Emotional Theme',
          actionAdvice: '["advice1", "advice2"]',
          keyDates: '[]',
          predictions: '[]',
          rituals: '[]',
          journalPrompts: '["prompt1"]',
          createdAt: '2026-02-01T00:00:00Z',
        },
      ];

      (mockDb().orderBy().limit().offset as jest.Mock).mockResolvedValue(mockReturns);
      (mockDb().where().count as jest.Mock).mockResolvedValue([{ count: 1 }]);

      const response = await request(app)
        .get('/api/lunar-return/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('returns');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.returns)).toBe(true);
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    test('should support pagination parameters', async () => {
      const mockReturns = [];
      (mockDb().orderBy().limit().offset as jest.Mock).mockResolvedValue(mockReturns);
      (mockDb().where().count as jest.Mock).mockResolvedValue([{ count: 0 }]);

      const response = await request(app)
        .get('/api/lunar-return/history?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('DELETE /api/lunar-return/:id', () => {
    test('should delete lunar return', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'lr_1',
        userId: mockUserId,
      });

      const response = await request(app)
        .delete('/api/lunar-return/lr_1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    test('should return 404 if lunar return not found', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/lunar-return/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/lunar-return/lr_1')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/lunar-return/calculate', () => {
    test('should calculate custom lunar return with forecast', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      const response = await request(app)
        .post('/api/lunar-return/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          returnDate: '2026-03-15T00:00:00Z',
          includeForecast: true,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('chart');
      expect(response.body.data).toHaveProperty('returnDate');
      expect(response.body.data).toHaveProperty('forecast');
    });

    test('should calculate custom lunar return without forecast', async () => {
      (mockDb().where().first as jest.Mock).mockResolvedValue({
        id: 'chart_1',
        userId: mockUserId,
        isBirthChart: true,
        moonSign: 'leo',
        moonDegree: 15,
        moonMinute: 30,
        moonSecond: 0,
      });

      const response = await request(app)
        .post('/api/lunar-return/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          returnDate: '2026-03-15T00:00:00Z',
          includeForecast: false,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('chart');
      expect(response.body.data).toHaveProperty('returnDate');
      expect(response.body.data).not.toHaveProperty('forecast');
    });

    test('should return 400 if returnDate is missing', async () => {
      const response = await request(app)
        .post('/api/lunar-return/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('returnDate is required');
    });
  });
});
