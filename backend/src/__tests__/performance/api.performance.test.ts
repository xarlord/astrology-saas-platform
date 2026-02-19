/**
 * API Performance Tests
 * Tests endpoint response times and throughput
 */

import request from 'supertest';
import { db } from '../db';
import { cleanDatabase, createTestUser, createTestChart } from '../utils';
import { mockAuthHeader } from '../auth.utils';
import { performance } from 'perf_hooks';

// Import app
import '../../server';

interface APIPerformanceResult {
  endpoint: string;
  method: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  throughput: number; // requests per second
  passed: boolean;
  maxExpectedTime: number;
}

class APIPerformanceTest {
  endpoint: string;
  method: 'get' | 'post' | 'put' | 'delete';
  maxExpectedTime: number;
  iterations: number;
  concurrency: number;

  constructor(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    maxExpectedTime: number = 500,
    iterations: number = 50,
    concurrency: number = 1
  ) {
    this.endpoint = endpoint;
    this.method = method;
    this.maxExpectedTime = maxExpectedTime;
    this.iterations = iterations;
    this.concurrency = concurrency;
  }

  async run(app: any, authToken?: string, data?: any): Promise<APIPerformanceResult> {
    const times: number[] = [];
    const startTime = performance.now();

    // Run requests sequentially or concurrently based on concurrency setting
    if (this.concurrency === 1) {
      for (let i = 0; i < this.iterations; i++) {
        const requestStart = performance.now();

        let req: any;
        switch (this.method) {
          case 'get':
            req = request(app).get(this.endpoint);
            break;
          case 'post':
            req = request(app).post(this.endpoint);
            break;
          case 'put':
            req = request(app).put(this.endpoint);
            break;
          case 'delete':
            req = request(app).delete(this.endpoint);
            break;
        }

        if (authToken) {
          req = req.set('Authorization', authToken);
        }

        if (data) {
          req = req.send(data);
        }

        await req.expect(200);

        const requestEnd = performance.now();
        times.push(requestEnd - requestStart);
      }
    } else {
      // Concurrent requests
      const batchSize = Math.ceil(this.iterations / this.concurrency);
      const batches = Array(this.concurrency).fill(null).map(async () => {
        const batchTimes: number[] = [];

        for (let i = 0; i < batchSize; i++) {
          const requestStart = performance.now();

          let req: any;
          switch (this.method) {
            case 'get':
              req = request(app).get(this.endpoint);
              break;
            case 'post':
              req = request(app).post(this.endpoint);
              break;
            case 'put':
              req = request(app).put(this.endpoint);
              break;
            case 'delete':
              req = request(app).delete(this.endpoint);
              break;
          }

          if (authToken) {
            req = req.set('Authorization', authToken);
          }

          if (data) {
            req = req.send(data);
          }

          await req.expect(200);

          const requestEnd = performance.now();
          batchTimes.push(requestEnd - requestStart);
        }

        return batchTimes;
      });

      const allTimes = await Promise.all(batches);
      times.push(...allTimes.flat());
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Calculate percentiles
    const sortedTimes = times.sort((a, b) => a - b);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    const throughput = (this.iterations / totalTime) * 1000;

    return {
      endpoint: this.endpoint,
      method: this.method.toUpperCase(),
      iterations: this.iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      p50,
      p95,
      p99,
      throughput,
      passed: p95 < this.maxExpectedTime,
      maxExpectedTime: this.maxExpectedTime,
    };
  }
}

describe('API Performance Tests', () => {
  let app: any;
  let testUser: any;
  let testChart: any;
  let authToken: string;

  beforeAll(async () => {
    // Initialize Express app for testing
    /* eslint-disable @typescript-eslint/no-var-requires */
    app = require('../../server').default;
    /* eslint-enable @typescript-eslint/no-var-requires */

    // Run migrations
    await db.migrate.latest();
    await db.seed.run();

    // Create test user and chart
    testUser = await createTestUser(db);
    testChart = await createTestChart(db, testUser.id);
    authToken = mockAuthHeader(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean any test data
    await db('chart_analysis_cache').del();
  });

  describe('Health Check Endpoints', () => {
    it('GET /health should respond in under 50ms (95th percentile)', async () => {
      const test = new APIPerformanceTest('/health', 'get', 50, 100);

      const result = await test.run(app);

      console.log(`\nGET /health:`);
      console.log(`  Average: ${result.avgTime.toFixed(2)}ms`);
      console.log(`  P50: ${result.p50.toFixed(2)}ms`);
      console.log(`  P95: ${result.p95.toFixed(2)}ms`);
      console.log(`  P99: ${result.p99.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} req/sec`);

      expect(result.p95).toBeLessThan(50);
      expect(result.passed).toBe(true);
    });

    it('GET /health/db should respond in under 100ms (95th percentile)', async () => {
      const test = new APIPerformanceTest('/health/db', 'get', 100, 50);

      const result = await test.run(app);

      console.log(`\nGET /health/db:`);
      console.log(`  Average: ${result.avgTime.toFixed(2)}ms`);
      console.log(`  P50: ${result.p50.toFixed(2)}ms`);
      console.log(`  P95: ${result.p95.toFixed(2)}ms`);
      console.log(`  P99: ${result.p99.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} req/sec`);

      expect(result.p95).toBeLessThan(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register should respond in under 300ms (95th percentile)', async () => {
      const test = new APIPerformanceTest('/api/auth/register', 'post', 300, 20);

      // Generate unique email for each request
      const generateData = () => ({
        email: `user${Date.now()}${Math.random()}@example.com`,
        password: 'SecurePass123!',
        name: 'Test User',
      });

      const times: number[] = [];
      for (let i = 0; i < test.iterations; i++) {
        const start = performance.now();
        await request(app)
          .post('/api/auth/register')
          .send(generateData())
          .expect(201);
        times.push(performance.now() - start);
      }

      const sortedTimes = times.sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];

      console.log(`\nPOST /api/auth/register:`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);

      expect(p95).toBeLessThan(300);
    });

    it('POST /api/auth/login should respond in under 200ms (95th percentile)', async () => {
      const test = new APIPerformanceTest('/api/auth/login', 'post', 200, 50);

      const times: number[] = [];
      for (let i = 0; i < test.iterations; i++) {
        const start = performance.now();
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'password123',
          })
          .expect(200);
        times.push(performance.now() - start);
      }

      const sortedTimes = times.sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];

      console.log(`\nPOST /api/auth/login:`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);

      expect(p95).toBeLessThan(200);
    });
  });

  describe('Chart Endpoints', () => {
    it('POST /api/charts should calculate and respond in under 500ms (95th percentile)', async () => {
      const chartData = {
        name: 'Performance Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac_type: 'tropical',
      };

      const times: number[] = [];
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        await request(app)
          .post('/api/charts')
          .set('Authorization', authToken)
          .send({
            ...chartData,
            name: `${chartData.name} ${i}`,
          })
          .expect(201);
        times.push(performance.now() - start);
      }

      const sortedTimes = times.sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];

      console.log(`\nPOST /api/charts (with calculation):`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);

      expect(p95).toBeLessThan(500);
    });

    it('GET /api/charts/:id should respond in under 100ms (95th percentile)', async () => {
      const test = new APIPerformanceTest(`/api/charts/${testChart.id}`, 'get', 100, 100);

      const result = await test.run(app, authToken);

      console.log(`\nGET /api/charts/:id:`);
      console.log(`  Average: ${result.avgTime.toFixed(2)}ms`);
      console.log(`  P50: ${result.p50.toFixed(2)}ms`);
      console.log(`  P95: ${result.p95.toFixed(2)}ms`);
      console.log(`  P99: ${result.p99.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} req/sec`);

      expect(result.p95).toBeLessThan(100);
      expect(result.passed).toBe(true);
    });

    it('GET /api/charts should respond in under 200ms (95th percentile)', async () => {
      const test = new APIPerformanceTest('/api/charts', 'get', 200, 50);

      const result = await test.run(app, authToken);

      console.log(`\nGET /api/charts:`);
      console.log(`  Average: ${result.avgTime.toFixed(2)}ms`);
      console.log(`  P50: ${result.p50.toFixed(2)}ms`);
      console.log(`  P95: ${result.p95.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(0)} req/sec`);

      expect(result.p95).toBeLessThan(200);
      expect(result.passed).toBe(true);
    });
  });

  describe('Analysis Endpoints', () => {
    it('GET /api/analysis/:chartId/personality should respond in under 1000ms (95th percentile)', async () => {
      const times: number[] = [];

      // First request will cache the analysis
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await request(app)
          .get(`/api/analysis/${testChart.id}/personality`)
          .set('Authorization', authToken)
          .expect(200);
        times.push(performance.now() - start);
      }

      const sortedTimes = times.sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];

      console.log(`\nGET /api/analysis/:chartId/personality:`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);
      console.log(`  First request (cold): ${sortedTimes[0].toFixed(2)}ms`);
      console.log(`  Subsequent requests (cached avg): ${
        sortedTimes.slice(1).reduce((sum, t) => sum + t, 0) / (sortedTimes.length - 1)
      }ms`);

      // Cached requests should be much faster
      const avgCached = sortedTimes.slice(1).reduce((sum, t) => sum + t, 0) / (sortedTimes.length - 1);
      expect(avgCached).toBeLessThan(200); // Cached should be under 200ms
      expect(p95).toBeLessThan(1000);
    });

    it('GET /api/analysis/:chartId/transits should respond in under 1500ms (95th percentile)', async () => {
      const times: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await request(app)
          .get(`/api/analysis/${testChart.id}/transits`)
          .query({
            start_date: '2024-01-01',
            end_date: '2024-01-07',
          })
          .set('Authorization', authToken)
          .expect(200);
        times.push(performance.now() - start);
      }

      const sortedTimes = times.sort((a, b) => a - b);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];

      console.log(`\nGET /api/analysis/:chartId/transits (7 days):`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);

      expect(p95).toBeLessThan(1500);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 50 concurrent chart calculation requests', async () => {
      const chartData = {
        name: 'Concurrent Test Chart',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac_type: 'tropical',
      };

      const startTime = performance.now();

      const promises = Array(50).fill(null).map((_, i) => {
        return request(app)
          .post('/api/charts')
          .set('Authorization', authToken)
          .send({
            ...chartData,
            name: `${chartData.name} ${i}`,
          })
          .expect(201);
      });

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 50;
      const throughput = (50 / totalTime) * 1000;

      console.log(`\nConcurrent Chart Calculations (50):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per request: ${avgTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${throughput.toFixed(0)} charts/sec`);

      // All requests should complete successfully
      expect(totalTime).toBeLessThan(30000); // Under 30 seconds total
      expect(throughput).toBeGreaterThan(1); // At least 1 chart per second
    });

    it('should handle 100 concurrent read requests', async () => {
      const startTime = performance.now();

      const promises = Array(100).fill(null).map(() => {
        return request(app)
          .get(`/api/charts/${testChart.id}`)
          .set('Authorization', authToken)
          .expect(200);
      });

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 100;
      const throughput = (100 / totalTime) * 1000;

      console.log(`\nConcurrent Read Requests (100):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per request: ${avgTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${throughput.toFixed(0)} req/sec`);

      expect(totalTime).toBeLessThan(10000); // Under 10 seconds total
      expect(throughput).toBeGreaterThan(10); // At least 10 req/sec
    });
  });

  describe('Load Testing Summary', () => {
    it('should generate performance baseline report', async () => {
      const report: any = {
        timestamp: new Date().toISOString(),
        endpoints: [],
      };

      // Health endpoints
      const healthTest = new APIPerformanceTest('/health', 'get', 50, 50);
      const healthResult = await healthTest.run(app);
      report.endpoints.push(healthResult);

      // Auth endpoints
      const loginTimes: number[] = [];
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        await request(app)
          .post('/api/auth/login')
          .send({ email: testUser.email, password: 'password123' })
          .expect(200);
        loginTimes.push(performance.now() - start);
      }
      const avgLogin = loginTimes.reduce((sum, t) => sum + t, 0) / loginTimes.length;
      report.endpoints.push({
        endpoint: '/api/auth/login',
        method: 'POST',
        avgTime: avgLogin,
        passed: avgLogin < 200,
      });

      // Chart endpoints
      const getChartTest = new APIPerformanceTest(`/api/charts/${testChart.id}`, 'get', 100, 30);
      const getChartResult = await getChartTest.run(app, authToken);
      report.endpoints.push(getChartResult);

      console.log('\n\n=== PERFORMANCE BASELINE REPORT ===');
      console.log(`Timestamp: ${report.timestamp}`);
      console.log('\nEndpoint Performance:');
      report.endpoints.forEach((result: any) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`\n${result.method} ${result.endpoint} ${status}`);
        if (result.avgTime) {
          console.log(`  Avg: ${result.avgTime.toFixed(2)}ms`);
        }
        if (result.p95) {
          console.log(`  P95: ${result.p95.toFixed(2)}ms`);
        }
        if (result.throughput) {
          console.log(`  Throughput: ${result.throughput.toFixed(0)} req/sec`);
        }
      });

      // All critical endpoints should pass
      const allPassed = report.endpoints.every((e: any) => e.passed);
      expect(allPassed).toBe(true);
    });
  });
});
