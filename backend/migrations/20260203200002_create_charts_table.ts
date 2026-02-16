/**
 * Charts Table Migration
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('charts', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Chart info
    table.string('name').notNullable();
    table.enum('type', ['natal', 'synastry', 'composite', 'transit', 'progressed']).defaultTo('natal');

    // Birth data
    table.date('birth_date').notNullable();
    table.time('birth_time').notNullable();
    table.boolean('birth_time_unknown').defaultTo(false);

    // Birth location
    table.string('birth_place_name').notNullable();
    table.decimal('birth_latitude', 9, 6).notNullable();
    table.decimal('birth_longitude', 9, 6).notNullable();
    table.string('birth_timezone').notNullable();

    // Chart settings
    table.enum('house_system', ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric']).defaultTo('placidus');
    table.enum('zodiac', ['tropical', 'sidereal']).defaultTo('tropical');
    table.string('sidereal_mode').nullable(); // For sidereal: 'fagan-bradley', 'lahiri', etc.

    // Calculated data (cached - JSONB for flexibility)
    table.jsonb('calculated_data').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable(); // Soft delete

    // Indexes
    table.index(['user_id', 'deleted_at']);
    table.index(['type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('charts');
}
