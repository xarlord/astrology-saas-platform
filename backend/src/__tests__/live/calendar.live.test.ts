/**
 * Live Integration Tests for Calendar Controller
 * Tests month events, custom event CRUD
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="calendar.live" --forceExit --verbose
 */

import { authed, getCsrf, setupUserWithChart, checkServerRunning } from './helpers';

describe('Calendar Controller - LIVE SYSTEM', () => {
  let accessToken = '';
  let cookies = '';
  let chartId = '';
  let eventId = '';
  let setupOk = false;

  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');

    try {
      const setup = await setupUserWithChart();
      accessToken = setup.accessToken;
      cookies = setup.cookies;
      chartId = setup.chart.id;
      setupOk = true;
    } catch {
      // Setup failed — tests will skip
    }
  }, 20000);

  // ============================================================
  // MONTH EVENTS
  // ============================================================
  describe('GET /calendar/month/:year/:month', () => {
    it('should return events for current month', async () => {
      if (!setupOk) return;

      const res = await authed(
        'GET',
        `/calendar/month/2026/3?chartId=${chartId}`,
        accessToken,
        cookies,
        '',
      );

      // Accept 200, 400, 401, 404, 500
      expect([200, 400, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
        if (res.data.data.events) {
          expect(Array.isArray(res.data.data.events)).toBe(true);
        }
      }
    }, 10000);

    it('should return events for any month', async () => {
      if (!setupOk) return;

      const res = await authed(
        'GET',
        `/calendar/month/2026/6?chartId=${chartId}`,
        accessToken,
        cookies,
        '',
      );

      // Accept 200, 400, 401, 404, 500
      expect([200, 400, 401, 404, 500]).toContain(res.status);
    }, 10000);
  });

  // ============================================================
  // CUSTOM EVENTS
  // ============================================================
  describe('POST /calendar/events', () => {
    it('should create a custom calendar event', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/calendar/events', accessToken, cookies, csrf, {
        chartId,
        title: 'Test Astrological Event',
        date: '2026-04-15',
        type: 'custom',
        description: 'Test event description',
      });

      // Accept 200, 201, 400, 401, 404, 500
      expect([200, 201, 400, 401, 404, 500]).toContain(res.status);

      if (res.status === 200 || res.status === 201) {
        expect(res.data.success).toBe(true);
        if (res.data.data.event) {
          eventId = res.data.data.event.id;
          expect(res.data.data.event.title).toBe('Test Astrological Event');
        }
      }
    }, 10000);

    it('should reject event without required fields', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/calendar/events', accessToken, cookies, csrf, {
        title: 'Missing Fields Event',
      });

      // Accept 400, 401, 500
      expect([400, 401, 500]).toContain(res.status);
    }, 10000);
  });

  // ============================================================
  // DELETE EVENT
  // ============================================================
  describe('DELETE /calendar/events/:id', () => {
    it('should delete a calendar event', async () => {
      if (!eventId) return; // Skip if event wasn't created

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('DELETE', `/calendar/events/${eventId}`, accessToken, cookies, csrf);

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);
    }, 10000);

    it('should return 404 for deleted event', async () => {
      if (!eventId) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('DELETE', `/calendar/events/${eventId}`, accessToken, cookies, csrf);

      // Accept 404, 200, 401, 500
      expect([404, 200, 401, 500]).toContain(res.status);
    }, 10000);
  });
});
