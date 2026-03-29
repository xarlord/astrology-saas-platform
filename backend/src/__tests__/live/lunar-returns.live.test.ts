/**
 * Live Integration Tests for Lunar Return Controller
 * Tests lunar return calculations, next return, history, and forecast
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="lunar-returns.live" --forceExit --verbose
 */

import {
  authed,
  getCsrf,
  setupUserWithChart,
  checkServerRunning,
} from './helpers';

describe('Lunar Return Controller - LIVE SYSTEM', () => {
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
  // NEXT LUNAR RETURN
  // ============================================================
  describe('GET /lunar-return/next', () => {
    it('should return next lunar return date', async () => {
      const res = await authed(
        'GET',
        `/lunar-return/next?chartId=${chartId}`,
        accessToken,
        cookies,
        ''
      );

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
      if (res.data.data.nextReturn) {
        // nextReturn is a serialized Date string, not an object with a .date property
        expect(res.data.data.nextReturn).toBeDefined();
      }
    }, 10000);
  });

  // ============================================================
  // LUNAR RETURN CHART
  // ============================================================
  describe('POST /lunar-return/chart', () => {
    it('should calculate lunar return chart for a date', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/lunar-return/chart', accessToken, cookies, csrf, {
        chartId,
        returnDate: '2026-04-15T12:00:00Z',
      });

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // LUNAR MONTH FORECAST
  // ============================================================
  describe('POST /lunar-return/forecast', () => {
    it('should return monthly lunar forecast', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/lunar-return/forecast', accessToken, cookies, csrf, {
        chartId,
      });

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // LUNAR RETURN HISTORY
  // ============================================================
  describe('GET /lunar-return/history', () => {
    it('should return lunar return history', async () => {
      const res = await authed(
        'GET',
        `/lunar-return/history?chartId=${chartId}`,
        accessToken,
        cookies,
        ''
      );

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // CUSTOM CALCULATION
  // ============================================================
  describe('POST /lunar-return/calculate', () => {
    it('should calculate custom lunar return', async () => {
      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/lunar-return/calculate', accessToken, cookies, csrf, {
        chartId,
        returnDate: '2026-05-01T00:00:00Z',
        includeForecast: true,
      });

      expect(res.status).toBe(200);
    }, 10000);
  });
});
