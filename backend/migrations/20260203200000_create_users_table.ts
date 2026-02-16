/**
 * Users Table Migration
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Basic info
    table.string('name').notNullable();
    table.string('email').notNullable().unique().index();
    table.string('password_hash').notNullable();

    // Profile
    table.string('avatar_url');
    table.string('timezone').defaultTo('UTC');

    // Subscription
    table.enum('plan', ['free', 'premium', 'professional']).defaultTo('free');
    table.enum('subscription_status', ['active', 'canceled', 'expired']).defaultTo('active');
    table.timestamp('subscription_renews_at').nullable();

    // Preferences (JSONB for flexibility)
    table.jsonb('preferences').defaultTo('{}');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable(); // Soft delete

    // Indexes
    table.index(['email', 'deleted_at']);
    table.index(['plan', 'subscription_status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
