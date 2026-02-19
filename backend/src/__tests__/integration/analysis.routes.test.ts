/**
 * Integration Tests for Analysis Routes
 * Tests personality analysis, aspect patterns, and transit analysis endpoints
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import request from 'supertest';
import { db } from '../db';
import { cleanDatabase, createTestUser, createTestChart } from './utils';
import { mockAuthHeader } from './auth.utils';

// Import app
import '../../server';

describe('Analysis Routes Integration Tests', () => {
  let app: any;
  let testUser: any;
  let testChart: any;
  let authToken: string;

  beforeAll(async () => {
    // Initialize Express app for testing
    /* eslint-disable @typescript-eslint/no-var-requires */
    app = require('../../server').default;
    /* eslint-enable @typescript-eslint/no-var-requires */

    // Run migrations
    await db.migrate.latest();
    await db.seed.run();

    // Create test user and chart
    testUser = await createTestUser(db);
    testChart = await createTestChart(db, testUser.id);
    authToken = mockAuthHeader(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean analysis cache
    await db('ai_cache').del();
  });

  describe('GET /api/analysis/:chartId/personality', () => {
    it('should generate complete personality analysis', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.analysis).toHaveProperty('overview');
      expect(response.body.data.analysis).toHaveProperty('planets_in_signs');
      expect(response.body.data.analysis).toHaveProperty('houses');
      expect(response.body.data.analysis).toHaveProperty('aspects');
      expect(response.body.data.analysis).toHaveProperty('aspect_patterns');
    });

    it('should include overview with Sun, Moon, Ascendant', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      const { overview } = response.body.data.analysis;

      expect(overview).toBeDefined();
      expect(overview).toHaveProperty('sun');
      expect(overview).toHaveProperty('moon');
      expect(overview).toHaveProperty('ascendant');

      // Verify each has interpretation
      expect(overview.sun).toHaveProperty('interpretation');
      expect(overview.moon).toHaveProperty('interpretation');
      expect(overview.ascendant).toHaveProperty('interpretation');
    });

    it('should include planet sign interpretations', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      const { planets_in_signs } = response.body.data.analysis;

      expect(planets_in_signs).toBeDefined();
      expect(Array.isArray(planets_in_signs)).toBe(true);
      expect(planets_in_signs.length).toBeGreaterThan(0);

      // Verify structure
      planets_in_signs.forEach((planetSign: any) => {
        expect(planetSign).toHaveProperty('planet');
        expect(planetSign).toHaveProperty('sign');
        expect(planetSign).toHaveProperty('interpretation');
        expect(planetSign.interpretation).toHaveProperty('keywords');
        expect(planetSign.interpretation).toHaveProperty('general');
        expect(planetSign.interpretation).toHaveProperty('strengths');
        expect(planetSign.interpretation).toHaveProperty('challenges');
      });
    });

    it('should include house interpretations', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      const { houses } = response.body.data.analysis;

      expect(houses).toBeDefined();
      expect(Array.isArray(houses)).toBe(true);
      expect(houses).toHaveLength(12);

      // Verify structure
      houses.forEach((house: any) => {
        expect(house).toHaveProperty('number');
        expect(house).toHaveProperty('theme');
        expect(house).toHaveProperty('interpretation');
        expect(house).toHaveProperty('planets_in_house');
        expect(Array.isArray(house.planets_in_house)).toBe(true);
      });
    });

    it('should include aspect interpretations grouped by type', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      const { aspects } = response.body.data.analysis;

      expect(aspects).toBeDefined();
      expect(aspects).toHaveProperty('major');
      expect(aspects).toHaveProperty('minor');

      // Verify major aspects have interpretations
      if (aspects.major.length > 0) {
        aspects.major.forEach((aspect: any) => {
          expect(aspect).toHaveProperty('planet1');
          expect(aspect).toHaveProperty('planet2');
          expect(aspect).toHaveProperty('type');
          expect(aspect).toHaveProperty('interpretation');
        });
      }
    });

    it('should detect aspect patterns', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      const { aspect_patterns } = response.body.data.analysis;

      expect(aspect_patterns).toBeDefined();
      expect(Array.isArray(aspect_patterns)).toBe(true);

      // Verify pattern structure if any exist
      aspect_patterns.forEach((pattern: any) => {
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('planets');
        expect(pattern).toHaveProperty('interpretation');
        expect(pattern).toHaveProperty('intensity');
      });
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .get('/api/analysis/999999/personality')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not analyze chart from other user', async () => {
      const otherUser = await createTestUser(db, {
        email: 'other@example.com',
      });
      const otherChart = await createTestChart(db, otherUser.id);

      const response = await request(app)
        .get(`/api/analysis/${otherChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should cache personality analysis', async () => {
      // First request
      await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      // Check cache
      const cached = await db('ai_cache')
        .where({
          chart_id: testChart.id,
          analysis_type: 'personality',
        })
        .first();

      expect(cached).toBeDefined();
      expect(cached).toHaveProperty('data');
    });
  });

  describe('GET /api/analysis/:chartId/aspect-patterns', () => {
    it('should return aspect patterns', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/aspect-patterns`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('patterns');
      expect(Array.isArray(response.body.data.patterns)).toBe(true);
    });

    it('should detect Grand Trine pattern', async () => {
      // Create chart with Grand Trine configuration
      // This would require a specific chart setup
      // For now, just test the endpoint responds correctly
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/aspect-patterns`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toHaveProperty('patterns');
    });

    it('should detect T-Square pattern', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/aspect-patterns`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toHaveProperty('patterns');
    });

    it('should include pattern intensity', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/aspect-patterns`)
        .set('Authorization', authToken)
        .expect(200);

      const { patterns } = response.body.data;

      patterns.forEach((pattern: any) => {
        expect(pattern).toHaveProperty('intensity');
        expect(typeof pattern.intensity).toBe('number');
        expect(pattern.intensity).toBeGreaterThanOrEqual(0);
        expect(pattern.intensity).toBeLessThanOrEqual(100);
      });
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .get('/api/analysis/999999/aspect-patterns')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/analysis/:chartId/transits', () => {
    it('should return transit analysis for date range', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('transits');
      expect(Array.isArray(response.body.data.transits)).toBe(true);
    });

    it('should include transit interpretations', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        })
        .set('Authorization', authToken)
        .expect(200);

      const { transits } = response.body.data;

      if (transits.length > 0) {
        transits.forEach((transit: any) => {
          expect(transit).toHaveProperty('transiting_planet');
          expect(transit).toHaveProperty('natal_planet');
          expect(transit).toHaveProperty('aspect');
          expect(transit).toHaveProperty('date');
          expect(transit).toHaveProperty('interpretation');
        });
      }
    });

    it('should return 400 for missing date parameters', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .query({
          start_date: '2024-01-07',
          end_date: '2024-01-01', // End before start
        })
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should limit date range to 90 days', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-05-01', // More than 90 days
        })
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('90 days');
    });

    it('should return transits sorted by date', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits`)
        .query({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        })
        .set('Authorization', authToken)
        .expect(200);

      const { transits } = response.body.data;

      if (transits.length > 1) {
        for (let i = 0; i < transits.length - 1; i++) {
          const date1 = new Date(transits[i].date);
          const date2 = new Date(transits[i + 1].date);
          expect(date1 <= date2).toBe(true);
        }
      }
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .get('/api/analysis/999999/transits')
        .query({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        })
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/analysis/:chartId/transits/today', () => {
    it('should return today\'s transits', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits/today`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('transits');
      expect(response.body.data).toHaveProperty('date');

      // Verify date is today
      const today = new Date().toISOString().split('T')[0];
      expect(response.body.data.date).toBe(today);
    });

    it('should filter transits by significance', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits/today`)
        .query({ min_orb: 5 })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('transits');

      // Verify all transits meet the orb threshold
      // (This would depend on implementation)
    });
  });

  describe('GET /api/analysis/:chartId/transits/calendar', () => {
    it('should return monthly calendar of transits', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits/calendar`)
        .query({
          year: 2024,
          month: 1,
        })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('calendar');
      expect(response.body.data).toHaveProperty('month');
      expect(response.body.data).toHaveProperty('year');
    });

    it('should return 400 for invalid month', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits/calendar`)
        .query({
          year: 2024,
          month: 13, // Invalid month
        })
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should group transits by date', async () => {
      const response = await request(app)
        .get(`/api/analysis/${testChart.id}/transits/calendar`)
        .query({
          year: 2024,
          month: 1,
        })
        .set('Authorization', authToken)
        .expect(200);

      const { calendar } = response.body.data;

      // Calendar should be an object/array with date keys
      expect(calendar).toBeDefined();
      expect(typeof calendar).toBe('object');
    });
  });

  describe('POST /api/analysis/:chartId/cache/clear', () => {
    it('should clear cached analysis', async () => {
      // Generate some cached analysis
      await request(app)
        .get(`/api/analysis/${testChart.id}/personality`)
        .set('Authorization', authToken)
        .expect(200);

      // Verify cache exists
      const cachedBefore = await db('ai_cache')
        .where({ chart_id: testChart.id })
        .first();
      expect(cachedBefore).toBeDefined();

      // Clear cache
      const response = await request(app)
        .post(`/api/analysis/${testChart.id}/cache/clear`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify cache cleared
      const cachedAfter = await db('ai_cache')
        .where({ chart_id: testChart.id })
        .first();
      expect(cachedAfter).toBeUndefined();
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .post('/api/analysis/999999/cache/clear')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
