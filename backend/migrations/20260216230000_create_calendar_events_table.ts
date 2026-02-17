import { Knex } from 'knex';

/**
 * Create calendar_events table
 * Stores global astrological events (retrogrades, eclipses, moon phases)
 * and personalized transit events for users
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('calendar_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.enum('event_type', [
      'mercury_retrograde',
      'venus_retrograde',
      'mars_retrograde',
      'jupiter_retrograde',
      'saturn_retrograde',
      'uranus_retrograde',
      'neptune_retrograde',
      'pluto_retrograde',
      'solar_eclipse',
      'lunar_eclipse',
      'solstice',
      'equinox',
      'new_moon',
      'full_moon',
      'personal_transit'
    ]).notNullable();

    table.timestamp('event_date').notNullable();
    table.timestamp('end_date').nullable();
    table.jsonb('event_data').nullable(); // { planet, sign, degree, intensity, etc. }
    table.text('interpretation').nullable();
    table.timestamps(true, true);

    table.index(['user_id', 'event_date']);
    table.index('event_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('calendar_events');
}
