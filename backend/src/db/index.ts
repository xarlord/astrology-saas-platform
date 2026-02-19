/**
 * Database Connection
 */

import db from '../config/database';
import logger from '../utils/logger';

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

export { db };
export default db;
