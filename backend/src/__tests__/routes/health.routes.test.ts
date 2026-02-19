/**
 * Unit Tests for Health Routes
 * Tests health check endpoints
 */

import request from 'supertest';
import express, { Application } from 'express';
import healthRoutes from '../../routes/health.routes';

// Mock database
jest.mock('../../db', () => ({
  db: {
    raw: jest.fn().mockResolvedValue({}),
  },
}));

describe('Health Routes', () => {
  let app: Application;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();

    // Add middleware that the routes might need
    app.use(express.json());

    // Mount the health routes
    app.use('/health', healthRoutes);
  });

  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should return success: true', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.success).toBe(true);
    });

    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.data.status).toBe('healthy');
    });

    it('should return timestamp', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.data.timestamp).toBeDefined();
      expect(new Date(response.body.data.timestamp)).toBeInstanceOf(Date);
    });

    it('should return uptime', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.data.uptime).toBeDefined();
      expect(typeof response.body.data.uptime).toBe('number');
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return environment', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.data.environment).toBeDefined();
      expect(typeof response.body.data.environment).toBe('string');
    });

    it('should return version', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.version).toBe('1.0.0');
    });

    it('should have correct data structure', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: expect.any(String),
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          version: expect.any(String),
        },
      });
    });
  });

  describe('GET /health/db', () => {
    it('should return 200 status', async () => {
      const response = await request(app)
        .get('/health/db')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should return success: true', async () => {
      const response = await request(app)
        .get('/health/db');

      expect(response.body.success).toBe(true);
    });

    it('should return database status', async () => {
      const response = await request(app)
        .get('/health/db');

      expect(response.body.data.database).toBe('connected');
    });

    it('should return timestamp', async () => {
      const response = await request(app)
        .get('/health/db');

      expect(response.body.data.timestamp).toBeDefined();
      expect(new Date(response.body.data.timestamp)).toBeInstanceOf(Date);
    });

    it('should have correct data structure', async () => {
      const response = await request(app)
        .get('/health/db');

      expect(response.body).toMatchObject({
        success: true,
        data: {
          database: expect.any(String),
          timestamp: expect.any(String),
        },
      });
    });
  });
});
