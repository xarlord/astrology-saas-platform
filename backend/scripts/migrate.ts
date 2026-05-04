import { knex } from 'knex';
import config from '../knexfile';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

if (!dbConfig) {
  console.error(`No knex config for environment: ${env}`);
  process.exit(1);
}

const db = knex(dbConfig);

db.migrate
  .latest()
  .then(() => {
    console.log('Migrations complete');
    return db.destroy();
  })
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error('Migration failed:', err);
    db.destroy().then(() => process.exit(1));
  });
