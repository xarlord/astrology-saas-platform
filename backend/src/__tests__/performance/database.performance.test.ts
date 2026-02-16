/**
 * Database Performance Tests
 * Tests query performance, connection pooling, and indexing effectiveness
 */

import { performance } from 'perf_hooks';
import { db } from '../db';
import { cleanDatabase, createTestUser, createTestChart } from '../utils';
import bcrypt from 'bcryptjs';

describe('Database Performance Tests', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await cleanDatabase(db);
    await db.destroy();
  });

  beforeEach(async () => {
    await cleanDatabase(db);
  });

  describe('User Query Performance', () => {
    it('should find user by email in under 50ms with index', async () => {
      // Create 1000 users
      const users = [];
      for (let i = 0; i < 1000; i++) {
        users.push({
          email: `user${i}@example.com`,
          password: await bcrypt.hash('password123', 10),
          name: `User ${i}`,
        });
      }
      await db('users').insert(users);

      const startTime = performance.now();
      const user = await db('users')
        .where({ email: 'user500@example.com' })
        .first();
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nUser lookup by email (1000 users):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  User found: ${user ? 'Yes' : 'No'}`);

      expect(user).toBeDefined();
      expect(queryTime).toBeLessThan(50);
    });

    it('should find user by ID in under 20ms', async () => {
      // Create 1000 users
      const users = [];
      for (let i = 0; i < 1000; i++) {
        users.push({
          email: `user${i}@example.com`,
          password: await bcrypt.hash('password123', 10),
          name: `User ${i}`,
        });
      }
      await db('users').insert(users);

      // Get a specific user ID
      const targetUser = await db('users')
        .where({ email: 'user500@example.com' })
        .first();

      const startTime = performance.now();
      const user = await db('users')
        .where({ id: targetUser.id })
        .first();
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nUser lookup by ID (1000 users):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);

      expect(user).toBeDefined();
      expect(queryTime).toBeLessThan(20);
    });
  });

  describe('Chart Query Performance', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser(db);
    });

    it('should get user charts in under 50ms', async () => {
      // Create 100 charts for the user
      const charts = [];
      for (let i = 0; i < 100; i++) {
        charts.push({
          user_id: testUser.id,
          name: `Chart ${i}`,
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        });
      }
      await db('charts').insert(charts);

      const startTime = performance.now();
      const userCharts = await db('charts')
        .where({ user_id: testUser.id })
        .select('*');
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nGet user charts (100 charts):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Charts found: ${userCharts.length}`);

      expect(userCharts).toHaveLength(100);
      expect(queryTime).toBeLessThan(50);
    });

    it('should get paginated charts efficiently', async () => {
      // Create 500 charts
      const charts = [];
      for (let i = 0; i < 500; i++) {
        charts.push({
          user_id: testUser.id,
          name: `Chart ${i}`,
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        });
      }
      await db('charts').insert(charts);

      const startTime = performance.now();
      const page1 = await db('charts')
        .where({ user_id: testUser.id })
        .limit(20)
        .offset(0)
        .select('*');
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nPaginated chart query (500 charts, page 1):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Charts returned: ${page1.length}`);

      expect(page1).toHaveLength(20);
      expect(queryTime).toBeLessThan(30);
    });

    it('should filter soft-deleted charts efficiently', async () => {
      // Create 100 charts, 50 deleted
      const charts = [];
      for (let i = 0; i < 100; i++) {
        charts.push({
          user_id: testUser.id,
          name: `Chart ${i}`,
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
          deleted_at: i < 50 ? new Date() : null, // First 50 deleted
        });
      }
      await db('charts').insert(charts);

      const startTime = performance.now();
      const activeCharts = await db('charts')
        .where({ user_id: testUser.id })
        .whereNull('deleted_at')
        .select('*');
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nFilter active charts (100 total, 50 deleted):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Active charts: ${activeCharts.length}`);

      expect(activeCharts).toHaveLength(50);
      expect(queryTime).toBeLessThan(50);
    });
  });

  describe('Refresh Token Query Performance', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser(db);
    });

    it('should find refresh token in under 30ms', async () => {
      // Create 100 tokens for the user
      const tokens = [];
      for (let i = 0; i < 100; i++) {
        tokens.push({
          user_id: testUser.id,
          token: `refresh_token_${i}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
      await db('refresh_tokens').insert(tokens);

      const startTime = performance.now();
      const token = await db('refresh_tokens')
        .where({ token: 'refresh_token_50' })
        .first();
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nRefresh token lookup (100 tokens):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Token found: ${token ? 'Yes' : 'No'}`);

      expect(token).toBeDefined();
      expect(queryTime).toBeLessThan(30);
    });

    it('should delete expired tokens efficiently', async () => {
      // Create 1000 tokens, half expired
      const tokens = [];
      const now = Date.now();
      for (let i = 0; i < 1000; i++) {
        tokens.push({
          user_id: testUser.id,
          token: `refresh_token_${i}`,
          expires_at: new Date(i < 500 ? now - 1000 : now + 7 * 24 * 60 * 60 * 1000),
        });
      }
      await db('refresh_tokens').insert(tokens);

      const startTime = performance.now();
      const deleted = await db('refresh_tokens')
        .where('expires_at', '<', new Date())
        .del();
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nDelete expired tokens (1000 total, 500 expired):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Tokens deleted: ${deleted}`);

      expect(deleted).toBe(500);
      expect(queryTime).toBeLessThan(100);
    });
  });

  describe('Analysis Cache Performance', () => {
    let testChart: any;

    beforeEach(async () => {
      const testUser = await createTestUser(db);
      testChart = await createTestChart(db, testUser.id);
    });

    it('should cache analysis in under 50ms', async () => {
      const analysisData = {
        overview: { test: 'data' },
        planets_in_signs: [],
        houses: [],
        aspects: [],
      };

      const startTime = performance.now();
      await db('chart_analysis_cache').insert({
        chart_id: testChart.id,
        analysis_type: 'personality',
        data: JSON.stringify(analysisData),
      });
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nCache analysis insert:`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);

      expect(queryTime).toBeLessThan(50);
    });

    it('should retrieve cached analysis in under 20ms', async () => {
      const analysisData = {
        overview: { test: 'data' },
        planets_in_signs: [],
        houses: [],
        aspects: [],
      };

      await db('chart_analysis_cache').insert({
        chart_id: testChart.id,
        analysis_type: 'personality',
        data: JSON.stringify(analysisData),
      });

      const startTime = performance.now();
      const cached = await db('chart_analysis_cache')
        .where({
          chart_id: testChart.id,
          analysis_type: 'personality',
        })
        .first();
      const endTime = performance.now();

      const queryTime = endTime - startTime;

      console.log(`\nCache analysis retrieval:`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Cache hit: ${cached ? 'Yes' : 'No'}`);

      expect(cached).toBeDefined();
      expect(queryTime).toBeLessThan(20);
    });

    it('should handle concurrent cache reads efficiently', async () => {
      // Insert cache data
      const analysisData = { test: 'data' };
      await db('chart_analysis_cache').insert({
        chart_id: testChart.id,
        analysis_type: 'personality',
        data: JSON.stringify(analysisData),
      });

      const startTime = performance.now();

      // Run 100 concurrent cache reads
      const promises = Array(100).fill(null).map(() => {
        return db('chart_analysis_cache')
          .where({
            chart_id: testChart.id,
            analysis_type: 'personality',
          })
          .first();
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 100;

      console.log(`\nConcurrent cache reads (100):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per read: ${avgTime.toFixed(2)}ms`);
      console.log(`  Results: ${results.length}`);

      expect(results).toHaveLength(100);
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('Connection Pool Performance', () => {
    it('should handle 100 concurrent queries efficiently', async () => {
      // Insert test data
      const testUser = await createTestUser(db);
      const charts = [];
      for (let i = 0; i < 50; i++) {
        charts.push({
          user_id: testUser.id,
          name: `Chart ${i}`,
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        });
      }
      await db('charts').insert(charts);

      const startTime = performance.now();

      // Run 100 concurrent queries
      const promises = Array(100).fill(null).map(() => {
        return db('charts')
          .where({ user_id: testUser.id })
          .select('*');
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 100;

      console.log(`\nConcurrent queries (100):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per query: ${avgTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${(100 / totalTime * 1000).toFixed(0)} queries/sec`);

      expect(results).toHaveLength(100);
      expect(avgTime).toBeLessThan(50); // Average query under 50ms
    });
  });

  describe('Transaction Performance', () => {
    it('should commit user + chart transaction in under 200ms', async () => {
      const startTime = performance.now();

      await db.transaction(async (trx) => {
        const [user] = await trx('users')
          .insert({
            email: `user${Date.now()}@example.com`,
            password: await bcrypt.hash('password123', 10),
            name: 'Test User',
          })
          .returning('*');

        await trx('charts').insert({
          user_id: user.id,
          name: 'Test Chart',
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        });
      });

      const endTime = performance.now();
      const transactionTime = endTime - startTime;

      console.log(`\nUser + Chart transaction:`);
      console.log(`  Transaction time: ${transactionTime.toFixed(2)}ms`);

      expect(transactionTime).toBeLessThan(200);
    });

    it('should rollback failed transaction efficiently', async () => {
      const startTime = performance.now();

      try {
        await db.transaction(async (trx) => {
          await trx('users').insert({
            email: `user${Date.now()}@example.com`,
            password: await bcrypt.hash('password123', 10),
            name: 'Test User',
          });

          // This will fail (no birth_place)
          await trx('charts').insert({
            user_id: 999,
            name: 'Test Chart',
            birth_date: '1990-01-15',
            birth_time: '12:00',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York',
            house_system: 'placidus',
            zodiac_type: 'tropical',
          });
        });
      } catch (error) {
        // Expected to fail
      }

      const endTime = performance.now();
      const transactionTime = endTime - startTime;

      console.log(`\nFailed transaction rollback:`);
      console.log(`  Transaction time: ${transactionTime.toFixed(2)}ms`);

      // Rollback should still be reasonably fast
      expect(transactionTime).toBeLessThan(100);
    });
  });

  describe('Index Effectiveness', () => {
    it('should demonstrate index benefit on large dataset', async () => {
      const testUser = await createTestUser(db);

      // Create 10,000 charts
      const charts = [];
      for (let i = 0; i < 10000; i++) {
        charts.push({
          user_id: testUser.id,
          name: `Chart ${i}`,
          birth_date: '1990-01-15',
          birth_time: '12:00',
          birth_place: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          house_system: 'placidus',
          zodiac_type: 'tropical',
        });
      }

      console.log(`\nInserting 10,000 charts...`);
      const insertStart = performance.now();
      await db('charts').insert(charts);
      const insertEnd = performance.now();

      console.log(`  Insert time: ${(insertEnd - insertStart).toFixed(2)}ms`);

      // Query with index
      const queryStart = performance.now();
      const userCharts = await db('charts')
        .where({ user_id: testUser.id })
        .limit(20)
        .select('*');
      const queryEnd = performance.now();

      const queryTime = queryEnd - queryStart;

      console.log(`\nQuery with index (10,000 charts):`);
      console.log(`  Query time: ${queryTime.toFixed(2)}ms`);
      console.log(`  Charts returned: ${userCharts.length}`);

      // Index should make this fast
      expect(queryTime).toBeLessThan(50);
      expect(userCharts).toHaveLength(20);
    });
  });
});
