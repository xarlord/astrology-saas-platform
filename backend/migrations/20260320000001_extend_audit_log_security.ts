/**
 * Extend Audit Log for Security Events
 * Adds security-specific columns to existing audit_log table
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('audit_log');

  if (hasTable) {
    // Check which columns already exist
    const hasSuccess = await knex.schema.hasColumn('audit_log', 'success');
    const hasFailureReason = await knex.schema.hasColumn('audit_log', 'failure_reason');
    const hasEmail = await knex.schema.hasColumn('audit_log', 'email');

    await knex.schema.alterTable('audit_log', (table) => {
      // Only add columns that don't exist yet
      if (!hasSuccess) {
        table.boolean('success').defaultTo(true);
      }
      if (!hasFailureReason) {
        table.string('failure_reason').nullable();
      }
      if (!hasEmail) {
        table.string('email').nullable();
      }

      // Index for security queries (safe to add - will be skipped if exists)
      table.index(['action', 'success', 'created_at'], 'audit_log_action_success_created_at_index');
      table.index(['email', 'action', 'created_at'], 'audit_log_email_action_created_at_index');
    });
  } else {
    // Create the table if it doesn't exist
    await knex.schema.createTable('audit_log', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
      table.string('action').notNullable();
      table.string('entity_type').nullable();
      table.string('entity_id').nullable();
      table.jsonb('details').nullable();
      table.string('ip_address').nullable();
      table.string('user_agent').nullable();
      table.boolean('success').defaultTo(true);
      table.string('failure_reason').nullable();
      table.string('email').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

      table.index(['user_id', 'created_at']);
      table.index(['action', 'created_at']);
      table.index(['entity_type', 'entity_id']);
      table.index(['action', 'success', 'created_at']);
      table.index(['email', 'action', 'created_at']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('audit_log');

  if (hasTable) {
    const hasSuccess = await knex.schema.hasColumn('audit_log', 'success');
    const hasFailureReason = await knex.schema.hasColumn('audit_log', 'failure_reason');
    const hasEmail = await knex.schema.hasColumn('audit_log', 'email');

    await knex.schema.alterTable('audit_log', (table) => {
      if (hasSuccess) table.dropColumn('success');
      if (hasFailureReason) table.dropColumn('failure_reason');
      if (hasEmail) table.dropColumn('email');
    });
  }
}
