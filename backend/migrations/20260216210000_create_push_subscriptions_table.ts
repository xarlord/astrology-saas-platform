/**
 * Create Push Subscriptions Table
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('push_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('endpoint').notNullable();
    table.jsonb('keys').notNullable(); // { p256dh, auth }
    table.string('user_agent').nullable();
    table.timestamps(true, true);

    table.index('user_id');
    table.unique('endpoint');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('push_subscriptions');
}
