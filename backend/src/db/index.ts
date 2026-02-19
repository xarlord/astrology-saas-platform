/**
 * Database Connection
 */

import knex from 'knex';
import knexConfig from '../config/database';
import logger from '../utils/logger';

// Create knex instance
const db = knex(knexConfig);

// Test connection
(async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', (error as Error).message);
  }
})();

// Handle pool errors
db.on('error', (error) => {
  logger.error('Database pool error:', error);
});

export default db;
