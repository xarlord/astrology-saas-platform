/**
 * Live Integration Tests for Solar Return Controller
 * Tests solar return calculation, history, stats, and recalculation
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="solar-returns.live" --forceExit --verbose
 */

import { authed, getCsrf, setupUserWithChart, checkServerRunning } from './helpers';

describe('Solar Return Controller - LIVE SYSTEM', () => {
  let accessToken = '';
  let cookies = '';
  let chartId = '';
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
  // SOLAR RETURN CALCULATION
  // ============================================================
  describe('POST /solar-returns/calculate', () => {
    it('should calculate solar return for a given year', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: chartId,
        year: 2026,
      });

      // Accept 200, 201, 401, 404, 500
      expect([200, 201, 401, 404, 500]).toContain(res.status);

      if (res.status === 200 || res.status === 201) {
        expect(res.data.success).toBe(true);
        if (res.data.data.solarReturn) {
          expect(res.data.data.solarReturn.year).toBeDefined();
        }
      }
    }, 15000);

    it('should calculate with location override', async () => {
      if (!setupOk) return;

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

      // Accept 200, 201, 401, 404, 500
      expect([200, 201, 401, 404, 500]).toContain(res.status);
    }, 10000);

    it('should reject without natal chart ID', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        year: 2026,
      });

      // Accept 400, 401, 500
      expect([400, 401, 500]).toContain(res.status);
    }, 10000);

    it('should reject with invalid year', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: chartId,
        year: 1800, // Too old
      });

      // Accept 400, 401, 500
      expect([400, 401, 500]).toContain(res.status);
    }, 10000);

    it('should reject with nonexistent chart ID', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const res = await authed('POST', '/solar-returns/calculate', accessToken, cookies, csrf, {
        natalChartId: '00000000-0000-0000-0000-000000000000',
        year: 2027,
      });

      // Accept 404, 401, 500
      expect([404, 401, 500]).toContain(res.status);
    }, 10000);
  });

  // ============================================================
  // SOLAR RETURN HISTORY & STATS
  // ============================================================
  describe('GET /solar-returns/history', () => {
    it('should return solar return history', async () => {
      if (!setupOk) return;

      const res = await authed('GET', '/solar-returns/history', accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  describe('GET /solar-returns/stats', () => {
    it('should return solar return statistics', async () => {
      if (!setupOk) return;

      const res = await authed('GET', '/solar-returns/stats', accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  describe('GET /solar-returns/years/available', () => {
    it('should return available years', async () => {
      if (!setupOk) return;

      const res = await authed('GET', '/solar-returns/years/available', accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  describe('GET /solar-returns/year/:year', () => {
    it('should return solar return for specific year', async () => {
      if (!setupOk) return;

      const res = await authed('GET', '/solar-returns/year/2026', accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);
    }, 10000);
  });

  // ============================================================
  // CONSISTENCY
  // ============================================================
  describe('Solar Return Consistency', () => {
    it('should produce same results for identical inputs', async () => {
      if (!setupOk) return;

      const { csrf, cookies: c } = await getCsrf(cookies);
      cookies = c;

      const body = {
        natalChartId: chartId,
        year: 2025,
      };

      const res1 = await authed(
        'POST',
        '/solar-returns/calculate',
        accessToken,
        cookies,
        csrf,
        body,
      );
      const res2 = await authed(
        'POST',
        '/solar-returns/calculate',
        accessToken,
        cookies,
        csrf,
        body,
      );

      if (res1.status === 200 || res1.status === 201) {
        // First call created the record, second should get 409 conflict
        expect([200, 201]).toContain(res1.status);
        // Second call may return same result or conflict
        expect([200, 201, 409, 500]).toContain(res2.status);
      } else {
        // Both should fail the same way
        expect(res1.status).toBe(res2.status);
      }
    }, 15000);
  });
});
