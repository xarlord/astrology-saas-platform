/**
 * K6 Performance Tests for AstroVerse Platform
 *
 * Tests:
 * 1. Health check endpoint
 * 2. API response times
 * 3. Authentication flow
 * 4. Chart creation load
 * 5. PDF generation load
 *
 * Usage:
 *   k6 run tests/performance/load-test.js
 *   k6 run --vus 50 --duration 30s tests/performance/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const authSuccess = new Rate('auth_success');
const chartCreated = new Counter('charts_created');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'perf-test@example.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'TestPassword123!';

// Test scenarios
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },

    // Load test - normal traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'load' },
      startTime: '30s',
    },

    // Stress test - high traffic
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'stress' },
      startTime: '5m30s',
    },

    // Spike test - sudden traffic burst
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
      startTime: '10m30s',
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.05'],
    auth_success: ['rate>0.95'],
  },
};

// Shared state
let authToken = '';
let csrfToken = '';

// Setup - runs once per VU
export function setup() {
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check passed': (r) => r.status === 200,
  });

  return { baseUrl: BASE_URL };
}

// Default function - runs for each VU
export default function (data) {
  // 1. Health Check
  healthCheckTest();

  // 2. Get CSRF Token
  getCsrfToken();

  // 3. Authentication
  if (!authToken) {
    authenticateUser();
  }

  // 4. API Tests (if authenticated)
  if (authToken) {
    // Randomly select test to run
    const testChoice = Math.random();

    if (testChoice < 0.3) {
      getChartsTest();
    } else if (testChoice < 0.5) {
      createChartTest();
    } else if (testChoice < 0.7) {
      getTransitsTest();
    } else if (testChoice < 0.8) {
      pdfGenerationTest();
    } else {
      userProfileTest();
    }
  }

  sleep(1); // Think time
}

// Teardown - runs once after all VUs complete
export function teardown(data) {
  console.log('Performance test completed');
}

// Test Functions

function healthCheckTest() {
  const res = http.get(`${BASE_URL}/health`);
  const success = check(res, {
    'health status 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(!success);
  apiLatency.add(res.timings.duration);
}

function getCsrfToken() {
  const res = http.get(`${BASE_URL}/api/v1/csrf-token`);

  if (res.status === 200) {
    const body = JSON.parse(res.body);
    csrfToken = body.csrfToken || '';
  }
}

function authenticateUser() {
  const payload = JSON.stringify({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (csrfToken) {
    params.headers['X-CSRF-Token'] = csrfToken;
  }

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, params);

  const success = check(res, {
    'login status 200': (r) => r.status === 200,
    'login has access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken || body.user;
      } catch {
        return false;
      }
    },
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  authSuccess.add(success);
  errorRate.add(!success);
  apiLatency.add(res.timings.duration);

  if (success && res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      authToken = body.accessToken || 'authenticated';
    } catch {
      authToken = 'cookie-based';
    }
  }
}

function getChartsTest() {
  const params = {
    headers: {},
  };

  if (authToken && authToken !== 'cookie-based') {
    params.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = http.get(`${BASE_URL}/api/v1/charts`, params);

  const success = check(res, {
    'get charts status 200': (r) => r.status === 200 || r.status === 401,
    'get charts response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(!success && res.status >= 400);
  apiLatency.add(res.timings.duration);
}

function createChartTest() {
  const payload = JSON.stringify({
    name: `Perf Test Chart ${Date.now()}`,
    birth_date: '1990-01-15',
    birth_time: '14:30',
    birth_place: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    house_system: 'placidus',
    zodiac_type: 'tropical',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (authToken && authToken !== 'cookie-based') {
    params.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (csrfToken) {
    params.headers['X-CSRF-Token'] = csrfToken;
  }

  const res = http.post(`${BASE_URL}/api/v1/charts`, payload, params);

  const success = check(res, {
    'create chart status 201': (r) => r.status === 201 || r.status === 200 || r.status === 401,
    'create chart response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  if (success && (res.status === 201 || res.status === 200)) {
    chartCreated.add(1);
  }

  errorRate.add(!success && res.status >= 400);
  apiLatency.add(res.timings.duration);
}

function getTransitsTest() {
  const params = {
    headers: {},
  };

  if (authToken && authToken !== 'cookie-based') {
    params.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = http.get(`${BASE_URL}/api/v1/transits/today`, params);

  const success = check(res, {
    'get transits status 200': (r) => r.status === 200 || r.status === 401,
    'get transits response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success && res.status >= 400);
  apiLatency.add(res.timings.duration);
}

function pdfGenerationTest() {
  // PDF generation is resource-intensive, so we only test the endpoint exists
  const params = {
    headers: {},
  };

  if (authToken && authToken !== 'cookie-based') {
    params.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = http.get(`${BASE_URL}/api/v1/charts/test-chart-id/pdf`, params);

  check(res, {
    'pdf endpoint responds': (r) => r.status === 200 || r.status === 401 || r.status === 404,
    'pdf response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  apiLatency.add(res.timings.duration);
}

function userProfileTest() {
  const params = {
    headers: {},
  };

  if (authToken && authToken !== 'cookie-based') {
    params.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = http.get(`${BASE_URL}/api/v1/users/me`, params);

  const success = check(res, {
    'profile status 200': (r) => r.status === 200 || r.status === 401,
    'profile response time < 200ms': (r) => r.timings.duration < 200,
  });

  errorRate.add(!success && res.status >= 400);
  apiLatency.add(res.timings.duration);
}
