/**
 * Integration Test Setup
 * Shared setup and teardown for integration tests
 */

import db from '../../config/database';
import { cleanDatabase } from './utils';

let dbAvailable = false;

/**
 * Setup test database before integration tests
 */
export async function setupTestDatabase(): Promise<void> {
  // Check if database is available
  try {
    await db.raw('SELECT 1');
    dbAvailable = true;
  } catch {
    console.warn('⚠️  Database not available - integration tests will be skipped');
    dbAvailable = false;
    return;
  }

  // Run migrations
  try {
    await db.migrate.latest();
  } catch (error) {
    console.warn('⚠️  Migration failed:', (error as Error).message);
  }

  // Clean any existing data
  await cleanDatabase(db);
}

/**
 * Clean test database after integration tests
 */
export async function teardownTestDatabase(): Promise<void> {
  if (!dbAvailable) {
    try {
      await db.destroy();
    } catch {
      /* expected */
    }
    return;
  }

  await cleanDatabase(db);
  await db.destroy();
}

/**
 * Clean all tables before each test
 */
export async function cleanAllTables(): Promise<void> {
  if (!dbAvailable) return;
  await cleanDatabase(db);
}

/**
 * Check if database is available for testing
 */
export function isDatabaseAvailable(): boolean {
  return dbAvailable;
}
