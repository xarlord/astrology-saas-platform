/**
 * Create Solar Returns Table
 *
 * Stores solar return (birthday year) charts and interpretations
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('solar_returns', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();

    table
      .uuid('chart_id')
      .notNullable()
      .references('id')
      .inTable('charts')
      .onDelete('CASCADE')
      .index();

    // Solar return data
    table.integer('year').notNullable().index();
    table.timestamp('return_date', { useTz: true }).notNullable().index();

    // Return location (for relocation calculations)
    table.jsonb('return_location').notNullable();
    // Structure: { name: string, latitude: number, longitude: number, timezone: string }

    // Calculated chart data
    table.jsonb('calculated_data').notNullable();
    // Structure: { planets: [], houses: [], aspects: [], ascendant: {}, mc: {} }

    // Interpretation
    table.jsonb('interpretation');
    // Structure: { themes: [], luckyDays: [], challenges: [], opportunities: [], advice: [] }

    // Metadata
    table.boolean('is_relocated').defaultTo(false);
    table.text('notes');

    // Timestamps
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();

    // Unique constraint: one solar return per user per year per location
    table.unique(['user_id', 'year', 'chart_id']);

    // Indexes for common queries
    table.index(['user_id', 'year']);
    table.index(['is_relocated']);
  });

  // Add comment
  await knex.raw(`
    COMMENT ON TABLE solar_returns IS 'Stores solar return (birthday year) charts with interpretations and location data';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('solar_returns');
}
