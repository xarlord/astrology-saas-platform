/**
 * Integration Test Setup
 * Shared setup and teardown for integration tests
 */

import { db } from '../db';

/**
 * Database interface for Knex operations
 */
interface Database {
  (table: string): {
    del: () => Promise<number>;
  };
  migrate: {
    latest: () => Promise<number[]>;
  };
  seed: {
    run: () => Promise<void[]>;
  };
  destroy: () => Promise<void>;
  schema: {
    hasTable: (table: string) => Promise<boolean>;
    createTable: (table: string, callback: (table: KnexTableBuilder) => void) => Promise<void>;
  };
}

/**
 * Knex table builder interface
 */
interface KnexTableBuilder {
  increments(column: string): KnexTableBuilder;
  primary(): KnexTableBuilder;
  string(column: string, length?: number): KnexColumnBuilder;
  integer(column: string): KnexIntegerColumnBuilder;
  date(column: string): KnexColumnBuilder;
  time(column: string): KnexColumnBuilder;
  timestamp(column: string): KnexColumnBuilder;
  decimal(column: string, precision?: number, scale?: number): KnexColumnBuilder;
  boolean(column: string): KnexColumnBuilder;
  json(column: string): KnexColumnBuilder;
  foreign(column: string): KnexForeignColumnBuilder;
  index(columns: string | string[]): KnexTableBuilder;
  unique(columns: string | string[]): KnexTableBuilder;
  timestamps(useTimestamps?: boolean, defaultToNow?: boolean): KnexTableBuilder;
}

interface KnexColumnBuilder {
  notNullable(): KnexColumnBuilder;
  unique(): KnexColumnBuilder;
  nullable(): KnexColumnBuilder;
  defaultTo(value: unknown): KnexColumnBuilder;
  unsigned(): KnexIntegerColumnBuilder;
}

interface KnexIntegerColumnBuilder extends KnexColumnBuilder {
  unsigned(): KnexIntegerColumnBuilder;
}

interface KnexForeignColumnBuilder {
  references(column: string): KnexForeignColumnBuilder;
  withTableName(table: string): KnexForeignColumnBuilder;
  onDelete(action: string): KnexForeignColumnBuilder;
  onUpdate(action: string): KnexForeignColumnBuilder;
}

/**
 * Setup test database before integration tests
 */
export async function setupTestDatabase(): Promise<void> {
  // Run migrations
  await (db as Database).migrate.latest();
  await (db as Database).seed.run();
}

/**
 * Clean test database after integration tests
 */
export async function teardownTestDatabase(): Promise<void> {
  await (db as Database).destroy();
}

/**
 * Clean all tables before each test
 */
export async function cleanAllTables(): Promise<void> {
  const tables = [
    'refresh_tokens',
    'chart_analysis_cache',
    'charts',
    'users',
  ];

  for (const table of tables) {
    await (db as Database)(table).del();
  }
}

/**
 * Create test database schema
 * This ensures all required tables exist
 */
export async function createTestSchema(): Promise<void> {
  const database = db as Database;

  // Users table
  const usersExists = await database.schema.hasTable('users');
  if (!usersExists) {
    await database.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255).notNullable();
      table.string('name', 255).notNullable();
      table.string('subscription_tier', 50).defaultTo('free');
      table.json('settings').nullable();
      table.timestamp('last_login').nullable();
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();
    });
  }

  // Charts table
  const chartsExists = await database.schema.hasTable('charts');
  if (!chartsExists) {
    await database.schema.createTable('charts', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('name', 255).notNullable();
      table.date('birth_date').notNullable();
      table.time('birth_time').nullable();
      table.string('birth_place', 255).notNullable();
      table.decimal('latitude', 10, 7).notNullable();
      table.decimal('longitude', 10, 7).notNullable();
      table.string('timezone', 50).notNullable();
      table.string('house_system', 50).defaultTo('placidus');
      table.string('zodiac_type', 50).defaultTo('tropical');
      table.boolean('time_unknown').defaultTo(false);
      table.json('calculated_data').nullable();
      table.timestamps(true, true);
      table.timestamp('deleted_at').nullable();

      table.foreign('user_id').references('users.id');
      table.index(['user_id', 'deleted_at']);
    });
  }

  // Refresh tokens table
  const refreshTokensExists = await database.schema.hasTable('refresh_tokens');
  if (!refreshTokensExists) {
    await database.schema.createTable('refresh_tokens', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.string('token', 500).notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.timestamps(true, true);

      table.foreign('user_id').references('users.id');
      table.index(['token', 'expires_at']);
    });
  }

  // Chart analysis cache table
  const chartAnalysisCacheExists = await database.schema.hasTable('chart_analysis_cache');
  if (!chartAnalysisCacheExists) {
    await database.schema.createTable('chart_analysis_cache', (table) => {
      table.increments('id').primary();
      table.integer('chart_id').unsigned().notNullable();
      table.string('analysis_type', 50).notNullable();
      table.json('data').notNullable();
      table.timestamps(true, true);

      table.foreign('chart_id').references('charts.id');
      table.unique(['chart_id', 'analysis_type']);
    });
  }
}
