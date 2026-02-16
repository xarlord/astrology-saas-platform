/**
 * Audit Log Table Migration
 * Tracks user actions for security and analytics
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit_log', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User (nullable for guest actions)
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');

    // Action
    table.string('action').notNullable(); // e.g., 'login', 'chart_created', 'chart_viewed'
    table.string('entity_type').nullable(); // e.g., 'chart', 'user'
    table.string('entity_id').nullable();

    // Details
    table.jsonb('details').nullable();

    // Request info
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();

    // Timestamp
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes
    table.index(['user_id', 'created_at']);
    table.index(['action', 'created_at']);
    table.index(['entity_type', 'entity_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('audit_log');
}
