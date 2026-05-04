/**
 * Update user plan enum: 'professional' → 'pro'
 * Add stripe_customer_id column for billing
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Update existing 'professional' plan values to 'pro' before altering
  await knex('users').where({ plan: 'professional' }).update({ plan: 'pro' });

  // Drop the existing CHECK constraint (created by initial migration as text + check)
  await knex.raw(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check`);

  // Check if the enum type already exists
  const enumCheck = await knex.raw(
    "SELECT 1 FROM pg_type WHERE typname = 'users_plan_enum'"
  );

  if (enumCheck.rows.length > 0) {
    // Enum exists — rename and recreate it
    await knex.raw(`ALTER TYPE users_plan_enum RENAME TO users_plan_enum_old`);
    await knex.raw(`CREATE TYPE users_plan_enum AS ENUM ('free', 'pro', 'premium')`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan DROP DEFAULT`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan TYPE users_plan_enum USING plan::text::users_plan_enum`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'free'`);
    await knex.raw(`DROP TYPE users_plan_enum_old`);
  } else {
    // Column is text — create the enum and convert
    await knex.raw(`CREATE TYPE users_plan_enum AS ENUM ('free', 'pro', 'premium')`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan DROP DEFAULT`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan TYPE users_plan_enum USING plan::text::users_plan_enum`);
    await knex.raw(`ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'free'::users_plan_enum`);
  }

  // Add stripe_customer_id column
  await knex.schema.alterTable('users', (table) => {
    table.string('stripe_customer_id', 255).nullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert plan enum back to 'professional'
  await knex('users').where({ plan: 'pro' }).update({ plan: 'professional' });

  await knex.raw(`ALTER TYPE users_plan_enum RENAME TO users_plan_enum_old`);
  await knex.raw(`CREATE TYPE users_plan_enum AS ENUM ('free', 'premium', 'professional')`);
  await knex.raw(`ALTER TABLE users ALTER COLUMN plan TYPE users_plan_enum USING plan::text::users_plan_enum`);
  await knex.raw(`DROP TYPE users_plan_enum_old`);

  // Restore CHECK constraint
  await knex.raw(`ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan = ANY (ARRAY['free', 'premium', 'professional']))`);

  // Remove stripe_customer_id column
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('stripe_customer_id');
  });
}
