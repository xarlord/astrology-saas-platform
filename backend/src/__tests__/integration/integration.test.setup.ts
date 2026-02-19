/**
 * Integration Test Setup
 * Shared setup and teardown for integration tests
 */

import db from '../../config/database';
import { cleanDatabase } from './utils';

/**
 * Setup test database before integration tests
 */
export async function setupTestDatabase(): Promise<void> {
  // Run migrations
  await db.migrate.latest();

  // Clean any existing data
  await cleanDatabase(db);
}

/**
 * Clean test database after integration tests
 */
export async function teardownTestDatabase(): Promise<void> {
  await cleanDatabase(db);
  await db.destroy();
}

/**
 * Clean all tables before each test
 */
export async function cleanAllTables(): Promise<void> {
  await cleanDatabase(db);
}
