/**
 * Transit Readings Table Migration
 * Caches calculated transit readings for users
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transit_readings', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('chart_id').notNullable().references('id').inTable('charts').onDelete('CASCADE');

    // Date range for the reading
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();

    // Calculated transit data (cached)
    table.jsonb('transit_data').notNullable();
    table.jsonb('moon_phases').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes
    table.index(['user_id', 'chart_id']);
    table.index(['start_date', 'end_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('transit_readings');
}
