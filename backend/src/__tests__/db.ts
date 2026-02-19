/**
 * Database export for tests
 */

// Import the database connection from the config
// @ts-expect-error - TypeScript module resolution issue with NodeNext
import db from '../config/database';

export default db;
export { db };
