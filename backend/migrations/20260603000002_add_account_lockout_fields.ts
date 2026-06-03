import type { Knex } from 'knex';

/**
 * Add account lockout fields to users table.
 * After 5 failed login attempts within 15 minutes, account is locked for 30 minutes.
 * Issue #226.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.integer('failed_login_attempts').defaultTo(0).notNullable();
    table.timestamp('locked_until', { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('failed_login_attempts');
    table.dropColumn('locked_until');
  });
}
