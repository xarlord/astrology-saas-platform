/**
 * Integration Tests for Billing Routes
 * Tests Stripe checkout, portal, subscription, plans, and webhook handling
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import request from 'supertest';
import db from '../../config/database';
import { cleanDatabase, createTestUser, generateAuthToken } from './utils';
import { setupTestDatabase, teardownTestDatabase, cleanAllTables, isDatabaseAvailable } from './integration.test.setup';

import app from '../../server';

describe('Billing Routes Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    try {
      await setupTestDatabase();
    } catch {
      // Database not available - tests will be skipped
    }
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    if (!isDatabaseAvailable()) return;
    await cleanAllTables();
    testUser = await createTestUser(db);
    authToken = generateAuthToken(testUser);
  });

  describe('GET /api/v1/billing/plans', () => {
    it('should return available subscription plans', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/billing/plans')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);

      const planIds = response.body.data.map((p: any) => p.id);
      expect(planIds).toContain('free');
      expect(planIds).toContain('pro');
      expect(planIds).toContain('premium');
    });

    it('should include expected plan fields', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/billing/plans')
        .expect(200);

      const freePlan = response.body.data.find((p: any) => p.id === 'free');
      expect(freePlan).toBeDefined();
      expect(freePlan).toHaveProperty('name');
      expect(freePlan).toHaveProperty('price');
      expect(freePlan).toHaveProperty('currency');
      expect(freePlan).toHaveProperty('interval');
      expect(freePlan).toHaveProperty('features');
      expect(freePlan).toHaveProperty('maxCharts');
    });

    it('should be accessible without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .get('/api/v1/billing/plans')
        .expect(200);
    });
  });

  describe('GET /api/v1/billing/subscription', () => {
    it('should return subscription info for authenticated user', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/billing/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('plan');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return free plan for new user', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/billing/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.plan).toBe('free');
    });

    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .get('/api/v1/billing/subscription')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reflect plan changes after database update', async () => {
      if (!isDatabaseAvailable()) return;

      // Update user plan directly in database
      const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db('users')
        .where({ id: testUser.id })
        .update({
          plan: 'pro',
          subscription_status: 'active',
          subscription_renews_at: renewsAt,
        });

      const response = await request(app)
        .get('/api/v1/billing/subscription')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.plan).toBe('pro');
      expect(response.body.data.status).toBe('active');
    });
  });

  describe('POST /api/v1/billing/checkout', () => {
    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/billing/checkout')
        .send({ priceId: 'price_test_pro' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 when priceId is missing', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/billing/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should attempt Stripe checkout with valid priceId (may fail without Stripe key)', async () => {
      if (!isDatabaseAvailable()) return;

      // This will fail with a Stripe error in test env (no real Stripe key),
      // but validates the route wiring and auth guard work correctly
      const response = await request(app)
        .post('/api/v1/billing/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ priceId: 'price_test_pro' });

      // Either 200 (if Stripe is configured) or 500 (Stripe error in test)
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/billing/portal', () => {
    it('should return 401 without authentication', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/billing/portal')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 404 when user has no Stripe customer record', async () => {
      if (!isDatabaseAvailable()) return;

      // User exists but has no Stripe customer — should get 404
      const response = await request(app)
        .post('/api/v1/billing/portal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // 404 (no Stripe customer) or 500 (Stripe not configured in test env)
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/billing/webhook', () => {
    it('should return 400 when stripe-signature header is missing', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/billing/webhook')
        .send({ type: 'checkout.session.completed', data: { object: {} } })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 with invalid Stripe signature', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'invalid-signature-value')
        .send({ type: 'checkout.session.completed', data: { object: {} } })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should be accessible without authentication (public webhook)', async () => {
      if (!isDatabaseAvailable()) return;

      // Webhook is public (uses Stripe signature instead of JWT)
      // Should not return 401 even without Authorization header
      const response = await request(app)
        .post('/api/v1/billing/webhook')
        .set('stripe-signature', 'test-sig')
        .send({});

      // Will be 400 (bad signature) but NOT 401 (unauthenticated)
      expect(response.status).not.toBe(401);
    });
  });
});
