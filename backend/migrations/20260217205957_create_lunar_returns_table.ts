import type { Knex } from "knex";

/**
 * Create lunar_returns table
 *
 * Stores lunar return calculations - every 27.3 days when the Moon returns
 * to its natal position, marking a personal "lunar birthday"
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('lunar_returns', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('natal_chart_id').references('id').inTable('charts').onDelete('CASCADE');

    // The date/time when the Moon returns to its natal position
    table.timestamp('return_date').notNullable();

    // The date this lunar return period is for (typically the month ahead)
    table.timestamp('forecast_start_date').notNullable();
    table.timestamp('forecast_end_date').notNullable();

    // Moon's position at the time of lunar return
    table.jsonb('moon_position').nullable();

    // Aspects during the lunar return
    table.jsonb('aspects').nullable();

    // House placement of the returned Moon
    table.jsonb('house_placement').nullable();

    // Pre-calculated forecast data (optional, can be generated on-demand)
    table.jsonb('forecast_data').nullable();

    table.timestamps(true, true);

    // Indexes for common queries
    table.index(['user_id', 'return_date']);
    table.index('return_date');
    table.index('forecast_start_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('lunar_returns');
}

