/**
 * Integration Tests for User Routes
 * Tests user profile management, settings updates, and account operations
 */

import request from 'supertest';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { cleanDatabase, createTestUser } from './utils';
import { mockAuthHeader } from './auth.utils';

// Import app
import '../../server';

describe('User Routes Integration Tests', () => {
  let app: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Initialize Express app for testing
    app = require('../../server').default;

    // Run migrations
    await db.migrate.latest();
    await db.seed.run();

    // Create test user
    testUser = await createTestUser(db);
    authToken = mockAuthHeader(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    // Reset user data
    await db('users')
      .where({ id: testUser.id })
      .update({
        name: 'Test User',
        email: 'test@example.com',
      });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should include subscription tier', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.user).toHaveProperty('subscription_tier');
    });

    it('should include chart count', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.user).toHaveProperty('chart_count');
      expect(typeof response.body.data.user.chart_count).toBe('number');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user name', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('name', updateData.name);

      // Verify in database
      const [user] = await db('users').where({ id: testUser.id }).select('*');
      expect(user.name).toBe(updateData.name);
    });

    it('should not allow updating email', async () => {
      const updateData = {
        email: 'newemail@example.com',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      // Email should not change
      expect(response.body.data.user.email).toBe(testUser.email);

      const [user] = await db('users').where({ id: testUser.id }).select('*');
      expect(user.email).toBe(testUser.email);
    });

    it('should validate name length', async () => {
      const updateData = {
        name: 'A', // Too short
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/settings', () => {
    it('should update user settings', async () => {
      const settingsData = {
        default_house_system: 'whole_sign',
        default_zodiac_type: 'sidereal',
        default_orb: 8,
        theme: 'dark',
      };

      const response = await request(app)
        .put('/api/users/settings')
        .set('Authorization', authToken)
        .send(settingsData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('settings');

      // Verify settings were updated
      expect(response.body.data.settings).toMatchObject(settingsData);
    });

    it('should merge settings with existing', async () => {
      // Set initial settings
      await request(app)
        .put('/api/users/settings')
        .set('Authorization', authToken)
        .send({
          default_house_system: 'placidus',
          theme: 'light',
        })
        .expect(200);

      // Update only one setting
      const response = await request(app)
        .put('/api/users/settings')
        .set('Authorization', authToken)
        .send({
          theme: 'dark',
        })
        .expect(200);

      // Verify other settings preserved
      expect(response.body.data.settings).toHaveProperty('default_house_system', 'placidus');
      expect(response.body.data.settings).toHaveProperty('theme', 'dark');
    });

    it('should validate house system option', async () => {
      const response = await request(app)
        .put('/api/users/settings')
        .set('Authorization', authToken)
        .send({
          default_house_system: 'invalid_system',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate orb range', async () => {
      const response = await request(app)
        .put('/api/users/settings')
        .set('Authorization', authToken)
        .send({
          default_orb: 15, // Too high
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/settings')
        .send({ theme: 'dark' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/password', () => {
    it('should update password with valid current password', async () => {
      const currentPassword = 'CurrentPass123!';
      const newPassword = 'NewPass456!';

      // Set known password
      const hashedPassword = await bcrypt.hash(currentPassword, 10);
      await db('users')
        .where({ id: testUser.id })
        .update({ password: hashedPassword });

      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', authToken)
        .send({
          current_password: currentPassword,
          new_password: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify password was changed
      const [user] = await db('users').where({ id: testUser.id }).select('*');
      const isValid = await bcrypt.compare(newPassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should return 401 for incorrect current password', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', authToken)
        .send({
          current_password: 'WrongPassword123!',
          new_password: 'NewPass456!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate new password strength', async () => {
      const currentPassword = 'CurrentPass123!';
      const hashedPassword = await bcrypt.hash(currentPassword, 10);
      await db('users')
        .where({ id: testUser.id })
        .update({ password: hashedPassword });

      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', authToken)
        .send({
          current_password: currentPassword,
          new_password: 'weak', // Too weak
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require current password', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', authToken)
        .send({
          new_password: 'NewPass456!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          current_password: 'CurrentPass123!',
          new_password: 'NewPass456!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/users/export', () => {
    it('should export user data as JSON', async () => {
      const response = await request(app)
        .post('/api/users/export')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('export');
      expect(response.body.data.export).toHaveProperty('user');
      expect(response.body.data.export).toHaveProperty('charts');
      expect(response.body.data.export).toHaveProperty('export_date');
    });

    it('should include all user charts in export', async () => {
      // Create some test charts
      await db('charts').insert([
        {
          user_id: testUser.id,
          name: 'Chart 1',
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        },
        {
          user_id: testUser.id,
          name: 'Chart 2',
          birth_date: '1985-06-20',
          birth_time: '15:30',
          birth_place: 'Los Angeles, CA',
          latitude: 34.0522,
          longitude: -118.2437,
          timezone: 'America/Los_Angeles',
          house_system: 'whole_sign',
          zodiac_type: 'tropical',
        },
      ]);

      const response = await request(app)
        .post('/api/users/export')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.export.charts).toHaveLength(2);
    });

    it('should not include sensitive data', async () => {
      const response = await request(app)
        .post('/api/users/export')
        .set('Authorization', authToken)
        .expect(200);

      const { user } = response.body.data.export;

      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refresh_tokens');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/users/export')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete user account', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify user was soft deleted
      const [user] = await db('users')
        .where({ id: testUser.id })
        .select('*');

      expect(user).toBeDefined();
      expect(user.deleted_at).not.toBeNull();
    });

    it('should delete all user charts', async () => {
      // Create some charts
      await db('charts').insert([
        {
          user_id: testUser.id,
          name: 'Chart 1',
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        },
      ]);

      await request(app)
        .delete('/api/users/account')
        .set('Authorization', authToken)
        .expect(200);

      // Verify charts were soft deleted
      const charts = await db('charts')
        .where({ user_id: testUser.id })
        .whereNotNull('deleted_at');

      expect(charts.length).toBe(1);
    });

    it('should invalidate all refresh tokens', async () => {
      // Create refresh tokens
      await db('refresh_tokens').insert([
        {
          user_id: testUser.id,
          token: 'token1',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          user_id: testUser.id,
          token: 'token2',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      await request(app)
        .delete('/api/users/account')
        .set('Authorization', authToken)
        .expect(200);

      // Verify tokens were deleted
      const tokens = await db('refresh_tokens')
        .where({ user_id: testUser.id });

      expect(tokens).toHaveLength(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/usage', () => {
    it('should return usage statistics', async () => {
      const response = await request(app)
        .get('/api/users/usage')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('usage');
      expect(response.body.data.usage).toHaveProperty('charts_created');
      expect(response.body.data.usage).toHaveProperty('analyses_generated');
      expect(response.body.data.usage).toHaveProperty('storage_used');
    });

    it('should track chart creation count', async () => {
      // Create some charts
      await db('charts').insert([
        {
          user_id: testUser.id,
          name: 'Chart 1',
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        },
        {
          user_id: testUser.id,
          name: 'Chart 2',
          birth_date: '1985-06-20',
          birth_time: '15:30',
          birth_place: 'Los Angeles, CA',
          latitude: 34.0522,
          longitude: -118.2437,
          timezone: 'America/Los_Angeles',
          house_system: 'whole_sign',
          zodiac_type: 'tropical',
        },
      ]);

      const response = await request(app)
        .get('/api/users/usage')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.usage.charts_created).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/usage')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
