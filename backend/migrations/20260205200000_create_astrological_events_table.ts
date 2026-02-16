import type { Knex } from 'knex';

/**
 * Create astrological_events table
 * Stores global astrological events (retrogrades, eclipses, moon phases, etc.)
 * and personalized transits to user's natal charts
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('astrological_events', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Event identification
    table.string('event_type', 50).notNullable().index();
    table.string('event_name', 255).notNullable();

    // Date/time range
    table.timestamp('start_date', { useTz: true }).notNullable().index();
    table.timestamp('end_date', { useTz: true }).nullable().index();

    // Event characteristics
    table.integer('intensity').notNullable().checkBetween([1, 10]);
    table.jsonb('affected_planets').nullable();
    table.string('aspect_type', 50).nullable();

    // Event content
    table.text('description').nullable();
    table.text('advice').nullable();

    // Categorization
    table.boolean('is_global').defaultTo(true).index();

    // Metadata
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    // Composite index for date range queries
    table.index(['start_date', 'end_date'], 'idx_events_date_range');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('astrological_events');
}
