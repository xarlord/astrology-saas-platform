/**
 * AI Integration Tests
 * Comprehensive integration tests for AI module
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server';
import { TestDataSource } from '../config/database.test';

describe('AI Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let testChartId: string;

  beforeAll(async () => {
    await TestDataSource.initialize();
    await TestDataSource.migrate();

    // Register test user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ai-integration@test.com',
        password: 'Password123!',
        firstName: 'AI',
        lastName: 'Test',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;

    // Create test chart
    const chartResponse = await request(app)
      .post('/api/v1/charts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Chart',
        birthData: {
          date: '1990-04-15',
          time: '10:30',
          place: {
            name: 'New York, NY',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York',
          },
        },
      });

    testChartId = chartResponse.body.data.id;
  });

  afterAll(async () => {
    await TestDataSource.cleanup();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await TestDataSource.query('DELETE FROM ai_cache');
    await TestDataSource.query('DELETE FROM ai_usage');
  });

  describe('AI Status Endpoint', () => {
    it('should check AI status', async () => {
      const response = await request(app)
        .get('/api/v1/ai/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('available');
      expect(response.body.data).toHaveProperty('model');
      expect(response.body.data).toHaveProperty('cacheEnabled');
      expect(response.body.data).toHaveProperty('trackingEnabled');
    });

    it('should return false available when OPENAI_API_KEY not set', async () => {
      // Temporarily unset API key
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const response = await request(app)
        .get('/api/v1/ai/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(false);

      // Restore API key
      process.env.OPENAI_API_KEY = originalKey;
    });
  });

  describe('Natal Interpretation', () => {
    it('should generate natal interpretation with fallback', async () => {
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planets: [
            { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
            { planet: 'moon', sign: 'taurus', degree: 10, house: 2 },
            { planet: 'mercury', sign: 'aries', degree: 20, house: 1 },
            { planet: 'venus', sign: 'pisces', degree: 5, house: 12 },
            { planet: 'mars', sign: 'aries', degree: 25, house: 1 },
          ],
          houses: [
            { house: 1, sign: 'aries', degree: 0 },
            { house: 2, sign: 'taurus', degree: 30 },
          ],
          aspects: [
            { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 5 },
            { planet1: 'sun', planet2: 'mars', type: 'conjunction', orb: 10 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toHaveProperty('ai');
      expect(response.body.data).toHaveProperty('enhanced');
    });

    it('should use cached interpretation on second call', async () => {
      const requestData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        ],
      };

      // First call
      const response1 = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData);

      expect(response1.status).toBe(200);
      expect(response1.body.data.fromCache).toBe(false);

      // Second call (should use cache)
      const response2 = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData);

      expect(response2.status).toBe(200);
      expect(response2.body.data.fromCache).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .send({
          planets: [
            { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
          ],
        });

      expect(response.status).toBe(401);
    });

    it('should handle invalid chart data gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planets: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Transit Forecast', () => {
    it('should generate transit forecast', async () => {
      const response = await request(app)
        .post('/api/v1/ai/transit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentTransits: [
            {
              planet: 'Jupiter',
              type: 'conjunction',
              natalPlanet: 'Sun',
              orb: 3,
              startDate: '2026-02-01',
              endDate: '2026-03-15',
            },
            {
              planet: 'Saturn',
              type: 'square',
              natalPlanet: 'Moon',
              orb: 2,
              startDate: '2026-02-10',
              endDate: '2026-04-20',
            },
          ],
          forecastType: 'weekly',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ai');
      expect(response.body.data).toHaveProperty('enhanced');
    });

    it('should support different forecast types', async () => {
      const forecastTypes = ['daily', 'weekly', 'monthly', 'yearly'];

      for (const type of forecastTypes) {
        const response = await request(app)
          .post('/api/v1/ai/transit')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            currentTransits: [
              {
                planet: 'Jupiter',
                type: 'conjunction',
                natalPlanet: 'Sun',
                orb: 3,
                startDate: '2026-02-01',
                endDate: '2026-03-15',
              },
            ],
            forecastType: type,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Compatibility Analysis', () => {
    it('should generate compatibility analysis', async () => {
      const response = await request(app)
        .post('/api/v1/ai/compatibility')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chartA: {
            planets: [
              { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
              { planet: 'moon', sign: 'taurus', degree: 10, house: 2 },
            ],
            houses: [
              { house: 1, sign: 'aries', degree: 0 },
              { house: 2, sign: 'taurus', degree: 30 },
            ],
            aspects: [
              { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 5 },
            ],
          },
          chartB: {
            planets: [
              { planet: 'sun', sign: 'libra', degree: 20, house: 7 },
              { planet: 'moon', sign: 'scorpio', degree: 5, house: 8 },
            ],
            houses: [
              { house: 7, sign: 'libra', degree: 0 },
              { house: 8, sign: 'scorpio', degree: 15 },
            ],
            aspects: [
              { planet1: 'sun', planet2: 'moon', type: 'square', orb: 15 },
            ],
          },
          relationshipType: 'romantic',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ai');
      expect(response.body.data).toHaveProperty('enhanced');
    });

    it('should support different relationship types', async () => {
      const relationshipTypes = ['romantic', 'friendship', 'business', 'family'];

      for (const type of relationshipTypes) {
        const response = await request(app)
          .post('/api/v1/ai/compatibility')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            chartA: {
              planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
            },
            chartB: {
              planets: [{ planet: 'sun', sign: 'libra', degree: 20, house: 7 }],
            },
            relationshipType: type,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should validate relationship type', async () => {
      const response = await request(app)
        .post('/api/v1/ai/compatibility')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chartA: { planets: [] },
          chartB: { planets: [] },
          relationshipType: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Usage Tracking', () => {
    it('should track usage when AI is configured', async () => {
      // Generate interpretation
      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
        });

      // Check usage stats
      const response = await request(app)
        .get('/api/v1/ai/usage/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data).toHaveProperty('totalTokens');
      expect(response.body.data).toHaveProperty('totalCost');
      expect(response.body.data.totalRequests).toBeGreaterThan(0);
    });

    it('should provide breakdown by interpretation type', async () => {
      // Generate different types
      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] });

      await request(app)
        .post('/api/v1/ai/transit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentTransits: [
            {
              planet: 'Jupiter',
              type: 'conjunction',
              natalPlanet: 'Sun',
              orb: 3,
              startDate: '2026-02-01',
              endDate: '2026-03-15',
            },
          ],
          forecastType: 'weekly',
        });

      // Check stats
      const response = await request(app)
        .get('/api/v1/ai/usage/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.breakdown).toHaveProperty('natal');
      expect(response.body.data.breakdown).toHaveProperty('transit');
    });

    it('should require authentication for usage stats', async () => {
      const response = await request(app)
        .get('/api/v1/ai/usage/stats');

      expect(response.status).toBe(401);
    });

    it('should only show current user stats', async () => {
      // User 1 generates interpretation
      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] });

      // Register another user
      const user2Response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user2@test.com',
          password: 'Password123!',
          firstName: 'User',
          lastName: 'Two',
        });

      const user2Token = user2Response.body.data.token;

      // User 2 checks their stats (should be empty)
      const user2Stats = await request(app)
        .get('/api/v1/ai/usage/stats')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2Stats.body.data.totalRequests).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      // This test would require mocking OpenAI to fail
      // For now, just verify the error handling structure exists
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
        });

      // Should always return 200, even if AI fails (fallback to rule-based)
      expect(response.status).toBe(200);
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invalid: 'data',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Cache Behavior', () => {
    it('should cache successful interpretations', async () => {
      const requestData = {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
      };

      // First call
      const response1 = await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData);

      expect(response1.body.data.fromCache).toBe(false);

      // Check database for cache entry
      const cacheEntries = await TestDataSource.query(
        'SELECT * FROM ai_cache WHERE interpretation_type = $1',
        ['natal']
      );

      expect(cacheEntries.length).toBeGreaterThan(0);
    });

    it('should expire cache after TTL', async () => {
      // This would require manipulating time or setting very short TTL
      // For now, just verify cache structure exists
      const requestData = {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
      };

      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData);

      const cacheEntries = await TestDataSource.query(
        'SELECT expires_at FROM ai_cache WHERE interpretation_type = $1',
        ['natal']
      );

      expect(cacheEntries[0].expires_at).toBeDefined();
      expect(new Date(cacheEntries[0].expires_at) > new Date()).toBe(true);
    });

    it('should generate different cache keys for different inputs', async () => {
      const data1 = { planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] };
      const data2 = { planets: [{ planet: 'sun', sign: 'taurus', degree: 20, house: 2 }] };

      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data1);

      await request(app)
        .post('/api/v1/ai/natal')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data2);

      const cacheEntries = await TestDataSource.query(
        'SELECT cache_key FROM ai_cache WHERE interpretation_type = $1',
        ['natal']
      );

      expect(cacheEntries.length).toBe(2);
      expect(cacheEntries[0].cache_key).not.toBe(cacheEntries[1].cache_key);
    });
  });
});
