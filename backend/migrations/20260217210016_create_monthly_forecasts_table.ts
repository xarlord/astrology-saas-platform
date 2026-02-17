import type { Knex } from "knex";

/**
 * Create monthly_forecasts table
 *
 * Stores monthly forecasts based on lunar returns
 * Each forecast covers the period from one lunar return to the next
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('monthly_forecasts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('lunar_return_id').references('id').inTable('lunar_returns').onDelete('CASCADE');

    // The date range this forecast covers
    table.timestamp('forecast_start_date').notNullable();
    table.timestamp('forecast_end_date').notNullable();

    // Forecast content
    table.jsonb('themes').nullable(); // Array of theme strings
    table.jsonb('opportunities').nullable(); // Array of opportunity strings
    table.jsonb('challenges').nullable(); // Array of challenge strings
    table.jsonb('journal_prompts').nullable(); // Array of prompt objects

    // Full interpretation text
    table.text('interpretation').nullable();

    // Metadata
    table.integer('lunar_cycle_number').nullable(); // Which lunar cycle (1, 2, 3...) from birth
    table.boolean('is_archived').defaultTo(false);

    table.timestamps(true, true);

    // Indexes for common queries
    table.index(['user_id', 'forecast_start_date']);
    table.index('forecast_start_date');
    table.index('lunar_return_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('monthly_forecasts');
}

