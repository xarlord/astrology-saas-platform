import { Knex } from 'knex';

/**
 * Create daily_briefings table
 * Stores personalized daily cosmic briefings for users.
 * CHI-68: Daily Cosmic Briefing
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('daily_briefings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();

    // Moon phase data
    table.jsonb('moon_phase').notNullable(); // { phase, sign, illumination }

    // Top 3 active transits
    table.jsonb('top_transits').notNullable(); // [{ transitPlanet, natalPlanet, aspect, orb, interpretation }]

    // Daily theme and affirmation
    table.text('daily_theme').notNullable();
    table.text('affirmation').notNullable();

    // Planetary highlight
    table.jsonb('planetary_highlight').notNullable(); // { planet, sign, message }

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // One briefing per user per day
    table.unique(['user_id', 'date']);

    // Index for fetching latest briefing
    table.index(['user_id', 'date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('daily_briefings');
}
