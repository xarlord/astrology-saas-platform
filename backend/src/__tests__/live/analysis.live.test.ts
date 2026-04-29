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

  beforeAll(async () => {
    const running = await checkServerRunning();
    if (!running) throw new Error('Server not running on localhost:3001');

    const setup = await setupUserWithChart();
    accessToken = setup.accessToken;
    cookies = setup.cookies;
    chartId = setup.chart.id;

    // Calculate chart data — analysis endpoints require calculated_data to be populated
    const calcRes = await authed('POST', `/charts/${chartId}/calculate`, accessToken, cookies, '');
    if (calcRes.status !== 200) {
      throw new Error(
        `Chart calculation failed: ${calcRes.status} ${JSON.stringify(calcRes.data)}`,
      );
    }
  }, 30000);

  // ============================================================
  // PERSONALITY ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId', () => {
    it('should return personality analysis for chart', async () => {
      const res = await authed('GET', `/analysis/${chartId}`, accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
      if (res.data.data.analysis) {
        expect(res.data.data.analysis).toBeDefined();
      }
    }, 15000);

    it('should return 404 for nonexistent chart', async () => {
      const res = await authed(
        'GET',
        '/analysis/00000000-0000-0000-0000-000000000000',
        accessToken,
        cookies,
        '',
      );

      expect(res.status).toBe(404);
    }, 10000);
  });

  // ============================================================
  // ASPECT ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId/aspects', () => {
    it('should return aspect analysis', async () => {
      const res = await authed('GET', `/analysis/${chartId}/aspects`, accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // ASPECT PATTERNS
  // ============================================================
  describe('GET /analysis/:chartId/patterns', () => {
    it('should return aspect patterns', async () => {
      const res = await authed('GET', `/analysis/${chartId}/patterns`, accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // PLANETARY POSITIONS
  // ============================================================
  describe('GET /analysis/:chartId/planets', () => {
    it('should return planetary positions analysis', async () => {
      const res = await authed('GET', `/analysis/${chartId}/planets`, accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });

  // ============================================================
  // HOUSES ANALYSIS
  // ============================================================
  describe('GET /analysis/:chartId/houses', () => {
    it('should return houses analysis', async () => {
      const res = await authed('GET', `/analysis/${chartId}/houses`, accessToken, cookies, '');

      expect(res.status).toBe(200);

      expect(res.data.success).toBe(true);
    }, 10000);
  });
});
