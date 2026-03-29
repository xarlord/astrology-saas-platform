/**
 * Knex Configuration File
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Build a Knex connection config:
 * - If DATABASE_URL is set, use it directly (individual vars are ignored).
 * - Otherwise fall back to individual DATABASE_* env vars with sensible defaults.
 */
function buildConnection(envPrefix = ''): string | Record<string, unknown> {
  const url = envPrefix
    ? process.env[`${envPrefix}DATABASE_URL`]
    : process.env.DATABASE_URL;

  if (url) {
    return url;
  }

  const pfx = envPrefix || 'DATABASE_';
  return {
    host: process.env[`${pfx}HOST`] || 'localhost',
    port: parseInt(process.env[`${pfx}PORT`] || '5434', 10),
    user: process.env[`${pfx}USER`] || 'postgres',
    password: process.env[`${pfx}PASSWORD`] || 'astrology123',
    database: process.env[`${pfx}NAME`] || 'astrology_saas',
  };
}

const knexConfig = {
  development: {
    client: 'pg',
    connection: buildConnection(),
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
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT || '5434', 10),
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          ssl: { rejectUnauthorized: false },
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
  },

  test: {
    client: 'pg',
    connection: buildConnection('TEST_DATABASE_'),
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
  },
};

export default knexConfig;
