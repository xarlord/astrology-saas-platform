/**
 * Create AI Cache Table
 * PostgreSQL table for caching AI-generated interpretations
 * Implements SHA-256 key-based caching with TTL expiration
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ai_cache', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('cache_key').notNullable().unique();
    table.jsonb('data').notNullable();
    table.timestamp('expires_at').nullable();
    table.timestamps(true, true);

    // Indexes for performance
    table.index('cache_key');
    table.index('expires_at');

    // Composite index for expired entry cleanup
    table.index(['expires_at'], 'idx_expires_at_for_cleanup');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('ai_cache');
}
