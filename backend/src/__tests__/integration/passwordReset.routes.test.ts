/**
 * Integration Tests for Password Reset Flow
 * Tests POST /api/auth/forgot-password and POST /api/auth/reset-password
 * Full round-trip through HTTP routes, database, and password hashing
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import request from 'supertest';
import crypto from 'crypto';
import db from '../../config/database';
import { cleanDatabase, createTestUser, generateAuthToken } from './utils';
import { setupTestDatabase, teardownTestDatabase, cleanAllTables, isDatabaseAvailable } from './integration.test.setup';

import app from '../../server';

describe('Password Reset Routes Integration Tests', () => {
  let testUser: any;

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
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 for existing email', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('reset link');
    });

    it('should return 200 even for non-existent email (prevents enumeration)', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      // Same response regardless of whether email exists
      expect(response.body.message).toContain('reset link');
    });

    it('should create a reset token in the database', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      const tokens = await db('password_reset_tokens')
        .where({ user_id: testUser.id })
        .select('*');

      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0].token).toBeDefined();
      expect(tokens[0].token.length).toBeGreaterThan(10);
      expect(tokens[0].used).toBe(false);
      expect(new Date(tokens[0].expires_at).getTime()).toBeGreaterThan(Date.now());
    });

    it('should not create a token for non-existent email', async () => {
      if (!isDatabaseAvailable()) return;

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      const tokens = await db('password_reset_tokens').select('*');
      expect(tokens).toHaveLength(0);
    });

    it('should invalidate previous tokens when requesting a new one', async () => {
      if (!isDatabaseAvailable()) return;

      // Request first reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      // Request second reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      const tokens = await db('password_reset_tokens')
        .where({ user_id: testUser.id })
        .select('*');

      // Should have 2 tokens, first one invalidated
      expect(tokens.length).toBe(2);
      const [first, second] = tokens;
      expect(first.used).toBe(true);
      expect(second.used).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid email format', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with a valid token', async () => {
      if (!isDatabaseAvailable()) return;

      // Generate a token directly in the database
      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db('password_reset_tokens').insert({
        user_id: testUser.id,
        token,
        expires_at: expiresAt,
      });

      const newPassword = 'NewSecure123!';
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, password: newPassword })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('reset successfully');

      // Verify token is marked as used
      const [tokenRecord] = await db('password_reset_tokens').where({ token }).select('*');
      expect(tokenRecord.used).toBe(true);
      expect(tokenRecord.used_at).toBeDefined();
    });

    it('should update password hash in users table', async () => {
      if (!isDatabaseAvailable()) return;

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db('password_reset_tokens').insert({
        user_id: testUser.id,
        token,
        expires_at: expiresAt,
      });

      const oldHash = testUser.password_hash;
      const newPassword = 'BrandNew456!';

      await request(app)
        .post('/api/auth/reset-password')
        .send({ token, password: newPassword })
        .expect(200);

      const [updatedUser] = await db('users').where({ id: testUser.id }).select('*');
      expect(updatedUser.password_hash).not.toBe(oldHash);
      expect(updatedUser.password_hash).toBeDefined();
      expect(updatedUser.password_hash.length).toBeGreaterThan(20); // bcrypt hash
    });

    it('should return 400 for invalid token', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for already-used token', async () => {
      if (!isDatabaseAvailable()) return;

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db('password_reset_tokens').insert({
        user_id: testUser.id,
        token,
        expires_at: expiresAt,
        used: true,
        used_at: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, password: 'NewPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for expired token', async () => {
      if (!isDatabaseAvailable()) return;

      const token = crypto.randomBytes(32).toString('base64url');
      // Token expired 1 hour ago
      const expiresAt = new Date(Date.now() - 60 * 60 * 1000);
      await db('password_reset_tokens').insert({
        user_id: testUser.id,
        token,
        expires_at: expiresAt,
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, password: 'NewPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing token', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ password: 'NewPass123!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing password', async () => {
      if (!isDatabaseAvailable()) return;

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'some-token' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for weak password', async () => {
      if (!isDatabaseAvailable()) return;

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db('password_reset_tokens').insert({
        user_id: testUser.id,
        token,
        expires_at: expiresAt,
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, password: 'weak' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Full password reset flow (end-to-end)', () => {
    it('should complete forgot -> reset -> login with new password', async () => {
      if (!isDatabaseAvailable()) return;

      const newPassword = 'ResetPass789!';

      // Step 1: Request password reset
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      // Step 2: Get the generated token from the database
      const [tokenRecord] = await db('password_reset_tokens')
        .where({ user_id: testUser.id, used: false })
        .select('*');
      expect(tokenRecord).toBeDefined();

      // Step 3: Reset password with the token
      await request(app)
        .post('/api/auth/reset-password')
        .send({ token: tokenRecord.token, password: newPassword })
        .expect(200);

      // Step 4: Login with the new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body.data).toHaveProperty('accessToken');
    });

    it('should NOT allow login with old password after reset', async () => {
      if (!isDatabaseAvailable()) return;

      const newPassword = 'CompletelyNew999!';

      // Request and get token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      const [tokenRecord] = await db('password_reset_tokens')
        .where({ user_id: testUser.id, used: false })
        .select('*');

      // Reset password
      await request(app)
        .post('/api/auth/reset-password')
        .send({ token: tokenRecord.token, password: newPassword })
        .expect(200);

      // Old password should no longer work
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'Password123!' }) // original test password
        .expect(401);

      expect(loginResponse.body).toHaveProperty('success', false);
    });

    it('should not allow token reuse after successful reset', async () => {
      if (!isDatabaseAvailable()) return;

      // Create token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      const [tokenRecord] = await db('password_reset_tokens')
        .where({ user_id: testUser.id, used: false })
        .select('*');

      // Use token once
      await request(app)
        .post('/api/auth/reset-password')
        .send({ token: tokenRecord.token, password: 'FirstReset123!' })
        .expect(200);

      // Try to reuse the same token
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: tokenRecord.token, password: 'SecondReset456!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
