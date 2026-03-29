/**
 * Test Database Support
 *
 * @description Real database integration for production-like tests
 * Uses actual database connections, no mocking
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  token: string;
  createdAt: Date;
}

interface TestChart {
  id: string;
  userId: string;
  name: string;
  birthDate: Date;
  birthTime: string;
  birthLocation: string;
  latitude: number;
  longitude: number;
  chartData: Record<string, unknown>;
}

interface TestSubscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

class TestDatabase {
  private pool: Pool | null = null;
  private client: PoolClient | null = null;
  private transactionClient: PoolClient | null = null;

  async initialize(): Promise<void> {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_TEST_NAME || 'astrology_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.client = await this.pool.connect();

    // Verify connection
    await this.client.query('SELECT NOW()');
    console.log('✅ Test database connected');
  }

  async beginTransaction(): Promise<void> {
    if (!this.client) throw new Error('Database not initialized');
    this.transactionClient = await this.pool!.connect();
    await this.transactionClient.query('BEGIN');
  }

  async rollbackTransaction(): Promise<void> {
    if (!this.transactionClient) return;
    await this.transactionClient.query('ROLLBACK');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  async commitTransaction(): Promise<void> {
    if (!this.transactionClient) return;
    await this.transactionClient.query('COMMIT');
    this.transactionClient.release();
    this.transactionClient = null;
  }

  async query(sql: string, params?: unknown[]): Promise<QueryResult> {
    const client = this.transactionClient || this.client;
    if (!client) throw new Error('Database not initialized');
    return client.query(sql, params);
  }

  // User Management
  async createTestUser(options: {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  } = {}): Promise<TestUser> {
    const email = options.email || faker.internet.email();
    const password = options.password || 'TestPassword123!';
    const name = options.name || faker.person.fullName();
    const role = options.role || 'user';
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    await this.query(
      `INSERT INTO users (id, email, password, name, role, auth_token, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, email, hashedPassword, name, role, token]
    );

    return { id, email, password, name, role, token, createdAt: new Date() };
  }

  async getUserById(id: string): Promise<TestUser | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<TestUser | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async updateUser(id: string, data: Partial<TestUser>): Promise<void> {
    const fields = Object.keys(data).map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(data);

    await this.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1`,
      [id, ...values]
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.query('DELETE FROM users WHERE id = $1', [id]);
  }

  // Chart Management
  async createTestChart(options: {
    userId: string;
    name?: string;
    birthDate?: Date;
    birthTime?: string;
    birthLocation?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<TestChart> {
    const id = crypto.randomUUID();
    const name = options.name || faker.person.firstName() + "'s Chart";
    const birthDate = options.birthDate || faker.date.past({ years: 50 });
    const birthTime = options.birthTime || '12:00';
    const birthLocation = options.birthLocation || faker.location.city();
    const latitude = options.latitude || faker.location.latitude();
    const longitude = options.longitude || faker.location.longitude();

    await this.query(
      `INSERT INTO charts (id, user_id, name, birth_date, birth_time, birth_location, latitude, longitude, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [id, options.userId, name, birthDate, birthTime, birthLocation, latitude, longitude]
    );

    return { id, userId: options.userId, name, birthDate, birthTime, birthLocation, latitude, longitude, chartData: {} };
  }

  async getChartsByUserId(userId: string): Promise<TestChart[]> {
    const result = await this.query(
      'SELECT * FROM charts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async deleteChart(id: string): Promise<void> {
    await this.query('DELETE FROM charts WHERE id = $1', [id]);
  }

  // Subscription Management
  async createTestSubscription(options: {
    userId: string;
    plan?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<TestSubscription> {
    const id = crypto.randomUUID();
    const plan = options.plan || 'free';
    const status = options.status || 'active';
    const startDate = options.startDate || new Date();
    const endDate = options.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.query(
      `INSERT INTO subscriptions (id, user_id, plan, status, start_date, end_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, options.userId, plan, status, startDate, endDate]
    );

    return { id, userId: options.userId, plan, status, startDate, endDate };
  }

  async getSubscriptionByUserId(userId: string): Promise<TestSubscription | null> {
    const result = await this.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // Cleanup
  async cleanupUserData(userId: string): Promise<void> {
    await this.query('DELETE FROM charts WHERE user_id = $1', [userId]);
    await this.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
    await this.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    await this.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  async cleanup(): Promise<void> {
    // Clean up all test data (users created in last hour with test emails)
    await this.query(
      `DELETE FROM charts WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com' AND created_at > NOW() - INTERVAL '1 hour')`
    );
    await this.query(
      `DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com' AND created_at > NOW() - INTERVAL '1 hour')`
    );
    await this.query(
      `DELETE FROM users WHERE email LIKE '%@example.com' AND created_at > NOW() - INTERVAL '1 hour'`
    );
  }

  async close(): Promise<void> {
    if (this.transactionClient) {
      this.transactionClient.release();
    }
    if (this.client) {
      this.client.release();
    }
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export const testDatabase = new TestDatabase();
export type { TestUser, TestChart, TestSubscription };
