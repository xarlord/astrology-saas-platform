import type { Knex } from 'knex';

/**
 * Create lunar_returns table
 * Stores user lunar return charts and monthly forecast data
 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('lunar_returns', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Foreign key to users
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index();

      // Lunar return date/time
      table.timestamp('return_date', { useTz: true }).notNullable().index();

      // Lunar return chart data
      table.jsonb('chart_data').nullable();

      // Interpretation data
      table.string('theme').nullable(); // Main theme for the month
      table.integer('intensity').nullable().checkBetween([1, 10]); // Overall intensity
      table.text('emotional_theme').nullable();
      table.text('action_advice').nullable();

      // Key dates during the lunar month
      table.jsonb('key_dates').nullable();

      // Monthly predictions
      table.jsonb('predictions').nullable();

      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

      // Indexes
      table.index(['user_id', 'return_date'], 'idx_lunar_returns_user_date');
    })
    .then(() => {
      // Create a comment for the table
      return knex.raw(`
        COMMENT ON TABLE lunar_returns IS 'Stores lunar return charts and monthly forecasts for users';
      `);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('lunar_returns');
}
