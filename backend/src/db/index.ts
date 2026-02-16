/**
 * Database Connection
 */

import knex from 'knex';
import knexConfig from '../../knexfile';

// Create knex instance
const db = knex(knexConfig);

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

// Handle pool errors
db.on('error', (error) => {
  console.error('Database pool error:', error);
});

export default db;
