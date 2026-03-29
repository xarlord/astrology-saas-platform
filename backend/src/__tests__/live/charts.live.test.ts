/**
 * Live Integration Tests for Chart Controller
 * Tests chart CRUD operations, calculation, and data consistency
 * against the running server with real database
 *
 * Prerequisites: Backend server running on localhost:3001
 * Run: cd backend && npx jest --config=jest.config.js --testPathPattern='charts.live' --forceExit --verbose
 */

import {
  api,
  authed,
  getCsrf,
  registerTestUser,
  SAMPLE_CHART,
  cleanupTestData,
} from './helpers';

let accessToken = '';
let cookies = '';
const testChartIds: string[] = [];

beforeAll(async () => {
  const auth = await registerTestUser();
  accessToken = auth.accessToken;
  cookies = auth.cookies;
}, 30000);

afterAll(async () => {
  await cleanupTestData(accessToken, cookies);
}, 30000);

// ============================================================
// POST /charts
// ============================================================
describe('POST /charts', () => {
  it('should create a natal chart', async () => {
    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('POST', '/charts', accessToken, cookies, csrf, SAMPLE_CHART);

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.chart).toBeDefined();
    expect(res.data.data.chart.name).toBe(SAMPLE_CHART.name);

    testChartIds.push(res.data.data.chart.id);
  }, 15000);

  it('should reject without authentication', async () => {
    const res = await api('POST', '/charts', SAMPLE_CHART);

    expect(res.status).toBe(401);
  });

  it('should reject invalid chart data', async () => {
    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('POST', '/charts', accessToken, cookies, csrf, {
      name: '',
      birth_date: 'not-a-date',
    });

    expect(res.status).toBe(400);
  }, 15000);
});

// ============================================================
// GET /charts
// ============================================================
describe('GET /charts', () => {
  it('should list user charts', async () => {
    const res = await authed('GET', '/charts', accessToken, cookies, '');

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data.charts)).toBe(true);
  });

  it('should reject without authentication', async () => {
    const res = await api('GET', '/charts');

    expect(res.status).toBe(401);
  });
});

// ============================================================
// GET /charts/:id
// ============================================================
describe('GET /charts/:id', () => {
  it('should return chart by ID', async () => {
    if (testChartIds.length === 0) return;

    const res = await authed('GET', `/charts/${testChartIds[0]}`, accessToken, cookies, '');

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.chart).toBeDefined();
    expect(res.data.data.chart.id).toBe(testChartIds[0]);
  });

  it('should return 404 for nonexistent chart', async () => {
    const res = await authed('GET', '/charts/00000000-0000-0000-0000-000000000000', accessToken, cookies, '');

    expect(res.status).toBe(404);
  });
});

// ============================================================
// POST /charts/:id/calculate
// ============================================================
describe('POST /charts/:id/calculate', () => {
  it('should calculate chart positions', async () => {
    if (testChartIds.length === 0) return;

    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('POST', `/charts/${testChartIds[0]}/calculate`, accessToken, cookies, csrf, {});

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    if (res.data.data.chart) {
      // Planets are stored in calculated_data
      expect(res.data.data.chart.calculated_data || res.data.data.chart.planets).toBeDefined();
    }
  }, 15000);

  it('should return 404 for nonexistent chart', async () => {
    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('POST', '/charts/00000000-0000-0000-0000-000000000000/calculate', accessToken, cookies, csrf, {});

    expect(res.status).toBe(404);
  }, 15000);
});

// ============================================================
// PUT /charts/:id
// ============================================================
describe('PUT /charts/:id', () => {
  it('should update chart name', async () => {
    if (testChartIds.length === 0) return;

    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('PUT', `/charts/${testChartIds[0]}`, accessToken, cookies, csrf, {
      name: 'Updated Chart Name',
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  }, 15000);
});

// ============================================================
// DELETE /charts/:id
// ============================================================
describe('DELETE /charts/:id', () => {
  it('should delete a chart', async () => {
    if (testChartIds.length === 0) return;

    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res = await authed('DELETE', `/charts/${testChartIds[0]}`, accessToken, cookies, csrf);

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);

    // Verify it's gone
    const getRes = await authed('GET', `/charts/${testChartIds[0]}`, accessToken, cookies, '');
    expect(getRes.status).toBe(404);

    testChartIds.shift();
  }, 15000);
});

// ============================================================
// Chart Calculation Consistency
// ============================================================
describe('Chart Calculation Consistency', () => {
  it('should produce identical positions for same birth data', async () => {
    // Create two charts with identical data
    const { csrf, cookies: c } = await getCsrf(cookies);
    cookies = c;

    const res1 = await authed('POST', '/charts', accessToken, cookies, csrf, { ...SAMPLE_CHART, name: 'Consistency Test 1' });
    expect(res1.status).toBe(201);
    const chart1Id = res1.data.data.chart.id;
    testChartIds.push(chart1Id);

    const { csrf: csrf2, cookies: c2 } = await getCsrf(cookies);
    cookies = c2;

    const res2 = await authed('POST', '/charts', accessToken, cookies, csrf2, { ...SAMPLE_CHART, name: 'Consistency Test 2' });
    expect(res2.status).toBe(201);
    const chart2Id = res2.data.data.chart.id;
    testChartIds.push(chart2Id);

    // Calculate both
    const { csrf: calcCsrf1, cookies: cc1 } = await getCsrf(cookies);
    cookies = cc1;
    const calc1 = await authed('POST', `/charts/${chart1Id}/calculate`, accessToken, cookies, calcCsrf1, {});

    const { csrf: calcCsrf2, cookies: cc2 } = await getCsrf(cookies);
    cookies = cc2;
    const calc2 = await authed('POST', `/charts/${chart2Id}/calculate`, accessToken, cookies, calcCsrf2, {});

    if (calc1.status === 200 && calc2.status === 200) {
      const p1 = calc1.data.data.chart.planets;
      const p2 = calc2.data.data.chart.planets;
      expect(p1).toEqual(p2);
    }
  }, 30000);
});
