/**
 * Database Configuration (Knex.js)
 */

import type { Knex } from 'knex';
import knex from 'knex';
import config from './index';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
  searchPath: ['knex', 'public'],
};

// Initialize and export knex instance
const db = knex(knexConfig);

export default db;
