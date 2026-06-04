/**
 * Add token_lookup_hash column to refresh_tokens table
 * Enables O(1) token lookup via SHA-256 hash instead of O(n) bcrypt compare.
 *
 * Issue #244
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('refresh_tokens', (table) => {
    table.string('token_lookup_hash', 64).nullable();
  });

  // Create index for fast lookups
  await knex.raw(
    'CREATE INDEX idx_refresh_tokens_lookup_hash ON refresh_tokens (token_lookup_hash) WHERE token_lookup_hash IS NOT NULL',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_refresh_tokens_lookup_hash');
  await knex.schema.table('refresh_tokens', (table) => {
    table.dropColumn('token_lookup_hash');
  });
}
