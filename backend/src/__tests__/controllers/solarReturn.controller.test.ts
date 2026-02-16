/**
 * Solar Return Controller Tests
 * Tests for solar return API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../server';
import { TestDataSource } from '../config/database.test';
import solarReturnModel from '../../modules/solar/models/solarReturn.model';
import { generateSolarReturnInterpretation } from '../../../data/solarReturnInterpretations';

// Mock the solar return service
vi.mock('../../modules/solar/services/solarReturn.service', () => ({
  calculateSolarReturn: vi.fn(),
  calculateLuckyDays: vi.fn(),
  generateYearlyThemes: vi.fn(),
}));

describe('Solar Return API Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test database
    await TestDataSource.initialize();
    await TestDataSource.migrate();

    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'solarreturn@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    await TestDataSource.cleanup();
  });

  describe('POST /api/v1/solar-returns/calculate', () => {
    it('should calculate solar return for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('year');
      expect(response.body.data.year).toBe(2026);
    });

    it('should require natalChartId and year', async () => {
      const response = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          year: 2026,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should validate year range', async () => {
      const response = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 1900, // Too far in past
        });

      expect(response.status).toBe(400);
    });

    it('should not allow duplicate calculations for same year', async () => {
      // First calculation
      await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      // Second calculation for same year
      const response = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });

    it('should support location-based calculations', async () => {
      const response = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
          location: {
            name: 'London, UK',
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.isRelocated).toBe(true);
    });
  });

  describe('GET /api/v1/solar-returns/year/:year', () => {
    it('should get solar return for specific year', async () => {
      // First create a solar return
      await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      const response = await request(app)
        .get('/api/v1/solar-returns/year/2026')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.year).toBe(2026);
    });

    it('should return 404 for non-existent year', async () => {
      const response = await request(app)
        .get('/api/v1/solar-returns/year/2025')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/solar-returns/:id', () => {
    it('should get solar return by ID', async () => {
      // First create a solar return
      const createResponse = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      const solarReturnId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/solar-returns/${solarReturnId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(solarReturnId);
    });

    it('should deny access to other users solar returns', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'other@test.com',
          password: 'Password123!',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherToken = otherUserResponse.body.data.token;

      // Try to access first user's solar return
      const response = await request(app)
        .get('/api/v1/solar-returns/sr-123')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/solar-returns/history', () => {
    it('should get all solar returns for user', async () => {
      const response = await request(app)
        .get('/api/v1/solar-returns/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data));
    });

    it('should support filtering relocated returns', async () => {
      const response = await request(app)
        .get('/api/v1/solar-returns/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ includeRelocated: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/solar-returns/:id/recalculate', () => {
    it('should recalculate solar return with new location', async () => {
      // First create a solar return
      const createResponse = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      const solarReturnId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/solar-returns/${solarReturnId}/recalculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: {
            name: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522,
            timezone: 'Europe/Paris',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isRelocated).toBe(true);
      expect(response.body.data.returnLocation.name).toBe('Paris, France');
    });

    it('should validate location is provided', async () => {
      const response = await request(app)
        .post('/api/v1/solar-returns/sr-123/recalculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/solar-returns/:id', () => {
    it('should delete solar return', async () => {
      // First create a solar return
      const createResponse = await request(app)
        .post('/api/v1/solar-returns/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          natalChartId: 'test-chart-1',
          year: 2026,
        });

      const solarReturnId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/solar-returns/${solarReturnId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/v1/solar-returns/${solarReturnId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
