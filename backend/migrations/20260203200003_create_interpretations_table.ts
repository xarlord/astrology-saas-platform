/**
 * Interpretations Table Migration
 * Stores astrological interpretations for planets, signs, houses, aspects
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('interpretations', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Type and Category
    table.enum('type', ['planet_in_sign', 'planet_in_house', 'aspect', 'house_cusp', 'pattern']).notNullable();
    table.string('key').notNullable(); // e.g., 'sun_in_aries', 'moon_in_house_1', 'conjunction'

    // Content
    table.jsonb('data').notNullable(); // Stores the interpretation content

    // Metadata
    table.string('language').defaultTo('en');
    table.string('source').nullable(); // Credit the source

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Unique constraint on type + key
    table.unique(['type', 'key']);

    // Indexes
    table.index(['type', 'key']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('interpretations');
}
