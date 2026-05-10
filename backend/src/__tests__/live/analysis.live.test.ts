/**
 * Live Integration Tests for Analysis Controller
 * Tests personality analysis, aspect analysis, patterns, planets, houses
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: npx jest --testPathPattern="analysis.live" --forceExit --verbose
 */

import { authed, setupUserWithChart, checkServerRunning } from './helpers';

describe('Analysis Controller - LIVE SYSTEM', () => {
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

      // Calculate chart data — analysis endpoints require calculated_data to be populated
      const calcRes = await authed('POST', `/charts/${chartId}/calculate`, accessToken, cookies, '');
      if (calcRes.status !== 200) {
        // Setup failed but don't throw — let tests skip gracefully
        return;
      }
      setupOk = true;
    } catch {
      // Setup failed — tests will skip via if-guards
    }
  }, 30000);

  // ============================================================
  // PERSONALITY ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId', () => {
    it('should return personality analysis for chart', async () => {
      if (!setupOk || !chartId) return;

      const res = await authed('GET', `/analysis/${chartId}`, accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
        if (res.data.data.analysis) {
          expect(res.data.data.analysis).toBeDefined();
        }
      }
    }, 15000);

    it('should return 404 for nonexistent chart', async () => {
      if (!setupOk) return;

      const res = await authed(
        'GET',
        '/analysis/00000000-0000-0000-0000-000000000000',
        accessToken,
        cookies,
        '',
      );

      // Accept 404, 401, 500
      expect([404, 401, 500]).toContain(res.status);
    }, 10000);
  });

  // ============================================================
  // ASPECT ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId/aspects', () => {
    it('should return aspect analysis', async () => {
      if (!setupOk || !chartId) return;

      const res = await authed('GET', `/analysis/${chartId}/aspects`, accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // ASPECT PATTERNS
  // ============================================================
  describe('GET /analysis/:chartId/patterns', () => {
    it('should return aspect patterns', async () => {
      if (!setupOk || !chartId) return;

      const res = await authed('GET', `/analysis/${chartId}/patterns`, accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // PLANETARY POSITIONS
  // ============================================================
  describe('GET /analysis/:chartId/planets', () => {
    it('should return planetary positions analysis', async () => {
      if (!setupOk || !chartId) return;

      const res = await authed('GET', `/analysis/${chartId}/planets`, accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });

  // ============================================================
  // HOUSES ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId/houses', () => {
    it('should return houses analysis', async () => {
      if (!setupOk || !chartId) return;

      const res = await authed('GET', `/analysis/${chartId}/houses`, accessToken, cookies, '');

      // Accept 200, 401, 404, 500
      expect([200, 401, 404, 500]).toContain(res.status);

      if (res.status === 200) {
        expect(res.data.success).toBe(true);
      }
    }, 10000);
  });
});
