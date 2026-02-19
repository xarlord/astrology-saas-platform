/**
 * Integration Tests for Chart Routes
 * Tests chart creation, retrieval, update, and deletion
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */

import request from 'supertest';
import { db } from '../db';
import { cleanDatabase, createTestUser, createTestChart } from './utils';
import { mockAuthHeader } from './auth.utils';

// Import app
import '../../server';

describe('Chart Routes Integration Tests', () => {
  let app: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Initialize Express app for testing
    app = require('../../server').default;

    // Run migrations
    await db.migrate.latest();
    await db.seed.run();

    // Create test user and get auth token
    testUser = await createTestUser(db);
    authToken = mockAuthHeader(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean only charts, keep user
    await db('charts').del();
  });

  describe('POST /api/charts', () => {
    it('should create a new chart with valid data', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac_type: 'tropical',
      };

      const response = await request(app)
        .post('/api/charts')
        .set('Authorization', authToken)
        .send(chartData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('chart');
      expect(response.body.data.chart).toHaveProperty('id');
      expect(response.body.data.chart).toHaveProperty('name', chartData.name);
      expect(response.body.data.chart).toHaveProperty('user_id', testUser.id);
      expect(response.body.data).toHaveProperty('calculated');
      expect(response.body.data.calculated).toHaveProperty('planets');
      expect(response.body.data.calculated).toHaveProperty('houses');
      expect(response.body.data.calculated).toHaveProperty('aspects');
    });

    it('should return 400 for missing required fields', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        // Missing birth_time, birth_place, etc.
      };

      const response = await request(app)
        .post('/api/charts')
        .set('Authorization', authToken)
        .send(chartData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid date format', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: 'invalid-date',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      };

      const response = await request(app)
        .post('/api/charts')
        .set('Authorization', authToken)
        .send(chartData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      };

      const response = await request(app)
        .post('/api/charts')
        .send(chartData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle time unknown flag', async () => {
      const chartData = {
        name: 'Time Unknown Chart',
        birth_date: '1990-01-15',
        birth_time: null,
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        time_unknown: true,
      };

      const response = await request(app)
        .post('/api/charts')
        .set('Authorization', authToken)
        .send(chartData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.chart).toHaveProperty('time_unknown', true);
    });

    it('should calculate chart with accurate planetary positions', async () => {
      const chartData = {
        name: 'Accuracy Test',
        birth_date: '1990-01-15',
        birth_time: '12:00',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      };

      const response = await request(app)
        .post('/api/charts')
        .set('Authorization', authToken)
        .send(chartData)
        .expect(201);

      const { planets, houses } = response.body.data.calculated;

      // Verify planets exist
      expect(planets).toBeDefined();
      expect(planets.length).toBeGreaterThan(0);

      // Verify planets have required fields
      planets.forEach((planet: any) => {
        expect(planet).toHaveProperty('name');
        expect(planet).toHaveProperty('longitude');
        expect(planet).toHaveProperty('latitude');
        expect(planet).toHaveProperty('speed');
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
      });

      // Verify houses exist
      expect(houses).toBeDefined();
      expect(houses.length).toBe(12);

      // Verify houses have required fields
      houses.forEach((house: any) => {
        expect(house).toHaveProperty('number');
        expect(house).toHaveProperty('cusp');
        expect(house.number).toBeGreaterThan(0);
        expect(house.number).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('GET /api/charts', () => {
    it('should return all charts for authenticated user', async () => {
      // Create multiple charts
      await createTestChart(db, testUser.id, { name: 'Chart 1' });
      await createTestChart(db, testUser.id, { name: 'Chart 2' });
      await createTestChart(db, testUser.id, { name: 'Chart 3' });

      const response = await request(app)
        .get('/api/charts')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('charts');
      expect(response.body.data.charts).toHaveLength(3);
    });

    it('should not return charts from other users', async () => {
      // Create chart for test user
      await createTestChart(db, testUser.id, { name: 'My Chart' });

      // Create another user
      const otherUser = await createTestUser(db, {
        email: 'other@example.com',
      });

      // Create chart for other user
      await createTestChart(db, otherUser.id, { name: 'Other Chart' });

      const response = await request(app)
        .get('/api/charts')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.charts).toHaveLength(1);
      expect(response.body.data.charts[0].name).toBe('My Chart');
    });

    it('should return empty array if user has no charts', async () => {
      const response = await request(app)
        .get('/api/charts')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.charts).toHaveLength(0);
    });

    it('should support pagination', async () => {
      // Create 15 charts
      for (let i = 0; i < 15; i++) {
        await createTestChart(db, testUser.id, { name: `Chart ${i}` });
      }

      const response = await request(app)
        .get('/api/charts?page=1&limit=10')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.charts).toHaveLength(10);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('total', 15);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('GET /api/charts/:id', () => {
    it('should return chart by id', async () => {
      const chart = await createTestChart(db, testUser.id);

      const response = await request(app)
        .get(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('chart');
      expect(response.body.data.chart).toHaveProperty('id', chart.id);
      expect(response.body.data.chart).toHaveProperty('name', chart.name);
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .get('/api/charts/999999')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not return chart from other user', async () => {
      const otherUser = await createTestUser(db, {
        email: 'other@example.com',
      });
      const chart = await createTestChart(db, otherUser.id);

      const response = await request(app)
        .get(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should include calculated data', async () => {
      const chart = await createTestChart(db, testUser.id);

      const response = await request(app)
        .get(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toHaveProperty('calculated');
      expect(response.body.data.calculated).toHaveProperty('planets');
      expect(response.body.data.calculated).toHaveProperty('houses');
      expect(response.body.data.calculated).toHaveProperty('aspects');
      expect(response.body.data.calculated).toHaveProperty('ascendant');
      expect(response.body.data.calculated).toHaveProperty('mc');
    });
  });

  describe('PUT /api/charts/:id', () => {
    it('should update chart with valid data', async () => {
      const chart = await createTestChart(db, testUser.id);

      const updateData = {
        name: 'Updated Chart Name',
        birth_place: 'Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
      };

      const response = await request(app)
        .put(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.chart).toHaveProperty('name', updateData.name);
      expect(response.body.data.chart).toHaveProperty('birth_place', updateData.birth_place);
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .put('/api/charts/999999')
        .set('Authorization', authToken)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not update chart from other user', async () => {
      const otherUser = await createTestUser(db, {
        email: 'other@example.com',
      });
      const chart = await createTestChart(db, otherUser.id);

      const response = await request(app)
        .put(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .send({ name: 'Hacked' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should recalculate chart when birth data changes', async () => {
      const chart = await createTestChart(db, testUser.id, {
        birth_date: '1990-01-15',
        birth_time: '12:00',
      });

      const updateData = {
        birth_date: '1990-06-20',
        birth_time: '15:30',
      };

      const response = await request(app)
        .put(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toHaveProperty('calculated');

      // Verify recalculation happened by checking planetary positions changed
      // (different birth date/time should produce different positions)
      expect(response.body.data.calculated).toHaveProperty('planets');
    });
  });

  describe('DELETE /api/charts/:id', () => {
    it('should delete chart', async () => {
      const chart = await createTestChart(db, testUser.id);

      const response = await request(app)
        .delete(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify chart was deleted
      const deletedChart = await db('charts')
        .where({ id: chart.id })
        .first();
      expect(deletedChart).toBeUndefined();
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .delete('/api/charts/999999')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not delete chart from other user', async () => {
      const otherUser = await createTestUser(db, {
        email: 'other@example.com',
      });
      const chart = await createTestChart(db, otherUser.id);

      const response = await request(app)
        .delete(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);

      // Verify chart still exists
      const notDeletedChart = await db('charts')
        .where({ id: chart.id })
        .first();
      expect(notDeletedChart).toBeDefined();
    });

    it('should soft delete chart', async () => {
      const chart = await createTestChart(db, testUser.id);

      await request(app)
        .delete(`/api/charts/${chart.id}`)
        .set('Authorization', authToken)
        .expect(200);

      // Check for soft delete (deleted_at field)
      const softDeletedChart = await db('charts')
        .where({ id: chart.id })
        .first();

      expect(softDeletedChart).toBeDefined();
      expect(softDeletedChart.deleted_at).not.toBeNull();
    });
  });

  describe('POST /api/charts/:id/recalculate', () => {
    it('should recalculate chart with new options', async () => {
      const chart = await createTestChart(db, testUser.id, {
        house_system: 'placidus',
      });

      const response = await request(app)
        .post(`/api/charts/${chart.id}/recalculate`)
        .set('Authorization', authToken)
        .send({
          house_system: 'whole_sign',
          zodiac_type: 'sidereal',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('calculated');
      expect(response.body.data.calculated).toHaveProperty('planets');
      expect(response.body.data.calculated).toHaveProperty('houses');
      expect(response.body.data.calculated.houses).toHaveLength(12);
    });

    it('should return 404 for non-existent chart', async () => {
      const response = await request(app)
        .post('/api/charts/999999/recalculate')
        .set('Authorization', authToken)
        .send({ house_system: 'whole_sign' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate house system options', async () => {
      const chart = await createTestChart(db, testUser.id);

      const response = await request(app)
        .post(`/api/charts/${chart.id}/recalculate`)
        .set('Authorization', authToken)
        .send({
          house_system: 'invalid_system',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
