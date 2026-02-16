/**
 * Integration Test Setup
 * Shared setup and teardown for integration tests
 */

import { db } from '../db';

/**
 * Setup test database before integration tests
 */
export async function setupTestDatabase() {
  // Run migrations
  await db.migrate.latest();
  await db.seed.run();
}

/**
 * Clean test database after integration tests
 */
export async function teardownTestDatabase() {
  await db.destroy();
}

/**
 * Clean all tables before each test
 */
export async function cleanAllTables() {
  const tables = [
    'refresh_tokens',
    'chart_analysis_cache',
    'charts',
    'users',
  ];

  for (const table of tables) {
    await db(table).del();
  }
}

/**
 * Create test database schema
 * This ensures all required tables exist
 */
export async function createTestSchema() {
  // Users table
  await db.schema.hasTable('users').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('users', (table) => {
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
  });

  // Charts table
  await db.schema.hasTable('charts').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('charts', (table) => {
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
  });

  // Refresh tokens table
  await db.schema.hasTable('refresh_tokens').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('token', 500).notNullable().unique();
        table.timestamp('expires_at').notNullable();
        table.timestamps(true, true);

        table.foreign('user_id').references('users.id');
        table.index(['token', 'expires_at']);
      });
    }
  });

  // Chart analysis cache table
  await db.schema.hasTable('chart_analysis_cache').then(async (exists) => {
    if (!exists) {
      await db.schema.createTable('chart_analysis_cache', (table) => {
        table.increments('id').primary();
        table.integer('chart_id').unsigned().notNullable();
        table.string('analysis_type', 50).notNullable();
        table.json('data').notNullable();
        table.timestamps(true, true);

        table.foreign('chart_id').references('charts.id');
        table.unique(['chart_id', 'analysis_type']);
      });
    }
  });
}
