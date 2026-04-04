/**
 * Update user plan enum: 'professional' → 'pro'
 * Add stripe_customer_id column for billing
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Update existing 'professional' plan values to 'pro' before altering the enum
  await knex('users').where({ plan: 'professional' }).update({ plan: 'pro' });

  // PostgreSQL: alter the enum type
  await knex.raw(`
    ALTER TYPE users_plan_enum RENAME TO users_plan_enum_old;
    CREATE TYPE users_plan_enum AS ENUM ('free', 'pro', 'premium');
    ALTER TABLE users ALTER COLUMN plan TYPE users_plan_enum USING plan::text::users_plan_enum;
    DROP TYPE users_plan_enum_old;
  `);

  // Add stripe_customer_id column
  await knex.schema.alterTable('users', (table) => {
    table.string('stripe_customer_id', 255).nullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert plan enum back to 'professional'
  await knex('users').where({ plan: 'pro' }).update({ plan: 'professional' });

  await knex.raw(`
    ALTER TYPE users_plan_enum RENAME TO users_plan_enum_old;
    CREATE TYPE users_plan_enum AS ENUM ('free', 'premium', 'professional');
    ALTER TABLE users ALTER COLUMN plan TYPE users_plan_enum USING plan::text::users_plan_enum;
    DROP TYPE users_plan_enum_old;
  `);

  // Remove stripe_customer_id column
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('stripe_customer_id');
  });
}
