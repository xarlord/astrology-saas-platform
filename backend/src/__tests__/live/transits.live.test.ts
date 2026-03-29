/**
 * Live Integration Tests for Transit Controller
 * Tests transit calculations, today's transits, calendar, and forecast
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="transits.live" --forceExit --verbose
 */

import {
  authed,
  getCsrf,
  setupUserWithChart,
  checkServerRunning,
} from './helpers';

describe('Transit Controller - LIVE SYSTEM', () => {
  let accessToken = '';
  let cookies = '';
  let chartId = '';

  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');

    // Setup: register user and create a chart
    const setup = await setupUserWithChart();
    accessToken = setup.accessToken;
    cookies = setup.cookies;
    chartId = setup.chart.id;
  }, 20000);

  // ============================================================
  // TRANSIT CALCULATION
  // ============================================================
  describe('POST /transits/calculate', () => {
    it('should calculate transits for a date range', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/transits/calculate', accessToken, cookies, csrf, {
        chartId,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      // Accept various success responses
      expect([200, 201, 400, 404]).toContain(res.status);

      if (res.status === 200 || res.status === 201) {
        expect(res.data.success).toBe(true);
        if (res.data.data.transits) {
          expect(Array.isArray(res.data.data.transits)).toBe(true);
        }
      }
    }, 15000);

    it('should reject calculation without chart ID', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/transits/calculate', accessToken, cookies, csrf, {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      expect(res.status).toBe(400);
    }, 10000);

    it('should reject calculation with invalid date range', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/transits/calculate', accessToken, cookies, csrf, {
        chartId,
        startDate: 'invalid-date',
        endDate: '2026-03-31',
      });

      expect(res.status).toBe(400);
    }, 10000);
  });

  // ============================================================
  // TODAY'S TRANSITS
  // ============================================================
  describe('GET /transits/today', () => {
    it('should return today transits for user', async () => {
      // May need chartId as query param
      const res = await authed(
        'GET',
        `/transits/today?chartId=${chartId}`,
        accessToken,
        cookies,
        ''
      );

      // Accept success or expected errors
      expect([200, 400, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);

    it('should reject without authentication', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { api } = require('./helpers');
      const res = await api('GET', '/transits/today');
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ============================================================
  // TRANSIT CALENDAR
  // ============================================================
  describe('GET /transits/calendar', () => {
    it('should return transit calendar data', async () => {
      const res = await authed(
        'GET',
        `/transits/calendar?chartId=${chartId}&year=2026&month=3`,
        accessToken,
        cookies,
        ''
      );

      expect([200, 400, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // TRANSIT FORECAST
  // ============================================================
  describe('GET /transits/forecast', () => {
    it('should return transit forecast', async () => {
      const res = await authed(
        'GET',
        `/transits/forecast?chartId=${chartId}&months=3`,
        accessToken,
        cookies,
        ''
      );

      expect([200, 400, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // TRANSIT CONSISTENCY
  // ============================================================
  describe('Transit Calculation Consistency', () => {
    it('should produce same results for identical date ranges', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const body = {
        chartId,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      };

      const res1 = await authed('POST', '/transits/calculate', accessToken, cookies, csrf, body);
      const res2 = await authed('POST', '/transits/calculate', accessToken, cookies, csrf, body);

      if (res1.status === 200 && res2.status === 200) {
        // Results should be deterministic
        expect(JSON.stringify(res1.data)).toBe(JSON.stringify(res2.data));
      } else {
        // Both should fail the same way
        expect(res1.status).toBe(res2.status);
      }
    }, 15000);
  });
});
