/**
 * Run pending database migrations on startup.
 * Used in production Docker container before server starts.
 *
 * Uses absolute path to migrations directory since the compiled
 * script runs from dist/ but migrations are at backend/migrations/.
 */
import { resolve } from 'path';
import knex from 'knex';
import config from '../config/index';

async function runMigrations(): Promise<void> {
  // __dirname = /app/backend/dist/scripts → resolve up to /app/backend/migrations
  const migrationsDir = resolve(__dirname, '..', '..', 'migrations');
  console.log(`[migrations] Migration directory: ${migrationsDir}`);

  const db = knex({
    client: 'pg',
    connection: config.database.url
      ? { connectionString: config.database.url, ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false }
      : {
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.name,
          ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        },
    pool: { min: 1, max: 2 },
    migrations: {
      directory: migrationsDir,
      tableName: 'knex_migrations',
      // Don't fail when already-applied migrations are missing from disk
      disableMigrationsListValidation: true,
    },
  });

  try {
    console.log('[migrations] Running pending migrations...');
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log('[migrations] Already up to date.');
    } else {
      console.log(`[migrations] Batch ${batchNo} applied: ${log.join(', ')}`);
    }
  } catch (err) {
    console.error('[migrations] FAILED:', err);
    // Non-fatal: log error but let server continue starting
    console.error('[migrations] Continuing server startup despite migration failure.');
  }

  await db.destroy();
}

runMigrations();
