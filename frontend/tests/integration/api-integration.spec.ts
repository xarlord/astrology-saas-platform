/**
 * Integration Tests — Backend API
 * Tests backend API endpoints via Playwright request context
 *
 * @integration
 */
import { test, expect, request } from '@playwright/test';

const API_BASE = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Backend API Integration @integration', () => {
  test('health endpoint returns 200', async () => {
    const context = await request.newContext({ baseURL: API_BASE });
    const res = await context.get('/health');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.status).toBe('ok');
    await context.dispose();
  });

  test('csrf token endpoint returns token', async () => {
    const context = await request.newContext({ baseURL: API_BASE });
    const res = await context.get('/api/v1/csrf-token');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.data?.token).toBeDefined();
    await context.dispose();
  });

  test('auth register requires valid input', async () => {
    const context = await request.newContext({ baseURL: API_BASE });
    const res = await context.post('/api/v1/auth/register', {
      data: { name: '', email: 'bad', password: 'short' },
    });
    expect(res.status()).toBe(400);
    await context.dispose();
  });

  test('auth login rejects invalid credentials', async () => {
    const context = await request.newContext({ baseURL: API_BASE });
    const res = await context.post('/api/v1/auth/login', {
      data: { email: 'nonexistent@test.com', password: 'WrongPass123!' },
    });
    expect(res.status()).toBe(401);
    await context.dispose();
  });

  test('protected endpoints reject unauthenticated requests', async () => {
    const context = await request.newContext({ baseURL: API_BASE });
    const res = await context.get('/api/v1/charts');
    expect(res.status()).toBe(401);
    await context.dispose();
  });

  test('register + login + protected access flow', async () => {
    const context = await request.newContext({ baseURL: API_BASE });

    // Get CSRF token
    const csrfRes = await context.get('/api/v1/csrf-token');
    const csrfToken = (await csrfRes.json()).data?.token;

    // Register
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const testUser = {
      name: `Integration Test ${suffix}`,
      email: `integration-${suffix}@astroverse.com`,
      password: 'TestPass123!',
    };

    const regRes = await context.post('/api/v1/auth/register', {
      data: testUser,
      headers: { 'X-CSRF-Token': csrfToken },
    });
    expect(regRes.status()).toBe(201);
    const regBody = await regRes.json();
    const accessToken = regBody.data?.accessToken;
    expect(accessToken).toBeDefined();

    // Access protected endpoint with token
    const chartsRes = await context.get('/api/v1/charts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(chartsRes.status()).toBe(200);

    // Login with same credentials
    const csrfRes2 = await context.get('/api/v1/csrf-token');
    const csrfToken2 = (await csrfRes2.json()).data?.token;

    const loginRes = await context.post('/api/v1/auth/login', {
      data: { email: testUser.email, password: testUser.password },
      headers: { 'X-CSRF-Token': csrfToken2 },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.data?.accessToken).toBeDefined();

    await context.dispose();
  });
});
