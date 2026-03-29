/**
 * Migration: Create shared_charts table
 *
 * @requirement FINDING-009
 * @description Database storage for chart sharing functionality
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('shared_charts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('chart_id').notNullable().references('id').inTable('charts').onDelete('CASCADE');
    table.string('share_token', 64).notNullable().unique();
    table.string('password_hash', 255).nullable();
    table.timestamp('expires_at').notNullable();
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.integer('access_count').notNullable().defaultTo(0);
    table.timestamp('last_accessed_at').nullable();

    // Indexes for performance
    table.index('share_token');
    table.index('chart_id');
    table.index('created_by');
    table.index('expires_at');
  });

  // Add index for finding non-expired shares
  await knex.raw(`
    CREATE INDEX idx_shared_charts_active ON shared_charts (share_token)
    WHERE expires_at > NOW()
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('shared_charts');
}
