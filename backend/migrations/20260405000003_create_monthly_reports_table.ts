import { Knex } from 'knex';

/**
 * Create monthly_reports table
 * Stores premium monthly transit report data for users.
 * CHI-69: Monthly Transit Report (premium PDF upsell)
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('monthly_reports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('month', 7).notNullable(); // YYYY-MM
    table.integer('year').notNullable();

    table.text('overview').notNullable();
    table.jsonb('key_dates').notNullable();
    table.jsonb('life_areas').notNullable();
    table.jsonb('retrogrades').notNullable();
    table.boolean('pdf_generated').notNullable().defaultTo(false);

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // One report per user per month
    table.unique(['user_id', 'month']);
    table.index(['user_id', 'month']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('monthly_reports');
}
