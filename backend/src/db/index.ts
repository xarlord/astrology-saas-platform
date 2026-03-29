/**
 * Database Connection
 */

import db from '../config/database';
import logger from '../utils/logger';

/**
 * Test database connection
 * Call explicitly instead of auto-executing on import
 */
export async function testConnection(): Promise<void> {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', (error as Error).message);
  }
}

// Handle pool errors
db.on('error', (error) => {
  logger.error('Database pool error:', error);
});

// Auto-test connection when loaded directly (not in test env)
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export { db };
export type { Knex } from 'knex';
export default db;
