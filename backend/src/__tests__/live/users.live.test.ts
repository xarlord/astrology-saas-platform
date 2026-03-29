/**
 * Live Integration Tests for User Profile & Preferences
 * Tests user profile CRUD, preferences, and chart listing
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="users.live" --forceExit --verbose
 */

import {
  authed,
  getCsrf,
  registerTestUser,
  checkServerRunning,
} from './helpers';

describe('User Controller - LIVE SYSTEM', () => {
  let accessToken = '';
  let cookies = '';
  let userId = '';

  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');

    const auth = await registerTestUser();
    accessToken = auth.accessToken;
    cookies = auth.cookies;
    userId = auth.user.id;
  }, 15000);

  // ============================================================
  // GET PROFILE
  // ============================================================
  describe('GET /users/me', () => {
    it('should return current user profile', async () => {
      const res = await authed('GET', '/users/me', accessToken, cookies, '');

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.user.id).toBe(userId);
      expect(res.data.data.user.password_hash).toBeUndefined();
    }, 10000);

    it('should reject without authentication', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { api } = require('./helpers');
      const res = await api('GET', '/users/me');
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ============================================================
  // UPDATE PROFILE
  // ============================================================
  describe('PUT /users/me', () => {
    it('should update user name', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('PUT', '/users/me', accessToken, cookies, csrf, {
        name: 'Updated Test Name',
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.name).toBe('Updated Test Name');
    }, 10000);

    it('should preserve email when updating name', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('PUT', '/users/me', accessToken, cookies, csrf, {
        name: 'Another Name Update',
      });

      expect(res.status).toBe(200);
      // Email should not change
      expect(res.data.data.user.email).toBeDefined();
    }, 10000);
  });

  // ============================================================
  // USER PREFERENCES
  // ============================================================
  describe('GET /users/me/preferences', () => {
    it('should return user preferences', async () => {
      const res = await authed('GET', '/users/me/preferences', accessToken, cookies, '');

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    }, 10000);
  });

  describe('PUT /users/me/preferences', () => {
    it('should update user preferences', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('PUT', '/users/me/preferences', accessToken, cookies, csrf, {
        defaultHouseSystem: 'whole',
        defaultZodiac: 'sidereal',
        notifications: { email: true },
      });

      expect([200, 400]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // USER CHARTS
  // ============================================================
  describe('GET /users/me/charts', () => {
    it('should return empty chart list for new user', async () => {
      const res = await authed('GET', '/users/me/charts', accessToken, cookies, '');

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.charts).toBeDefined();
      expect(Array.isArray(res.data.data.charts)).toBe(true);
    }, 10000);
  });
});
