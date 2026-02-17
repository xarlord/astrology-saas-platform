/**
 * Create AI Usage Tracking Table
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ai_usage', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable(); // 'natal', 'transit', 'compatibility', 'lunar-return', 'solar-return'
    table.integer('tokens_used').defaultTo(0);
    table.decimal('cost', 10, 4).defaultTo(0);
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('ai_usage');
}
