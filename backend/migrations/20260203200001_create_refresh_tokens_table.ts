/**
 * Refresh Tokens Table Migration
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('refresh_tokens', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Token
    table.string('token').notNullable().unique().index();

    // Expiry
    table.timestamp('expires_at').notNullable();

    // Revoked
    table.boolean('revoked').defaultTo(false);
    table.timestamp('revoked_at').nullable();

    // Device info (optional)
    table.string('user_agent');
    table.string('ip_address');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes
    table.index(['user_id', 'revoked']);
    table.index(['expires_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('refresh_tokens');
}
