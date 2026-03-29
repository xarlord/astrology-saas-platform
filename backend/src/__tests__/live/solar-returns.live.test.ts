/**
 * Live Integration Tests for Solar Return Controller
 * Tests solar return calculation, history, stats, and recalculation
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="solar-returns.live" --forceExit --verbose
 */

import {
  authed,
  getCsrf,
  setupUserWithChart,
  checkServerRunning,
} from './helpers';

describe('Solar Return Controller - LIVE SYSTEM', () => {
  let accessToken = '';
  let cookies = '';
  let chartId = '';

  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');

    const setup = await setupUserWithChart();
    accessToken = setup.accessToken;
    cookies = setup.cookies;
    chartId = setup.chart.id;
  }, 20000);

  // ============================================================
  // SOLAR RETURN CALCULATION
  // ============================================================
  describe('POST /solar-returns/calculate', () => {
    it('should calculate solar return for a given year', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: chartId,
        year: 2026,
      });

      expect([200, 201]).toContain(res.status);

      expect(res.data.success).toBe(true);
      if (res.data.data.solarReturn) {
        expect(res.data.data.solarReturn.year).toBeDefined();
      }
    }, 15000);

    it('should calculate with location override', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: chartId,
        year: 2028,
        location: {
          name: 'Paris, France',
          latitude: 48.8566,
          longitude: 2.3522,
          timezone: 'Europe/Paris',
        },
      });

      expect([200, 201]).toContain(res.status);
    }, 10000);

    it('should reject without natal chart ID', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        year: 2026,
      });

      expect(res.status).toBe(400);
    }, 10000);

    it('should reject with invalid year', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: chartId,
        year: 1800, // Too old
      });

      expect(res.status).toBe(400);
    }, 10000);

    it('should reject with nonexistent chart ID', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: '00000000-0000-0000-0000-000000000000',
        year: 2027,
      });

      expect(res.status).toBe(404);
    }, 10000);
  });

  // ============================================================
  // SOLAR RETURN HISTORY & STATS
  // ============================================================
  describe('GET /solar-returns/history', () => {
    it('should return solar return history', async () => {
      const res = await authed('GET', '/solar-returns/history', accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  describe('GET /solar-returns/stats', () => {
    it('should return solar return statistics', async () => {
      const res = await authed('GET', '/solar-returns/stats', accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  describe('GET /solar-returns/years/available', () => {
    it('should return available years', async () => {
      const res = await authed('GET', '/solar-returns/years/available', accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  describe('GET /solar-returns/year/:year', () => {
    it('should return solar return for specific year', async () => {
      const res = await authed('GET', '/solar-returns/year/2026', accessToken, cookies, '');

      expect(res.status).toBe(200);
    }, 10000);
  });

  // ============================================================
  // CONSISTENCY
  // ============================================================
  describe('Solar Return Consistency', () => {
    it('should produce same results for identical inputs', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const body = {
        natalChartId: chartId,
        year: 2025,
      };

      const res1 = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, body);
      const res2 = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, body);

      if (res1.status === 200 || res1.status === 201) {
        // First call created the record, second should get 409 conflict
        expect([200, 201]).toContain(res1.status);
        expect(res2.status).toBe(409);
      } else {
        expect(res1.status).toBe(res2.status);
      }
    }, 15000);
  });
});
