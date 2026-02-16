/**
 * Create Solar Return Settings Table
 *
 * Stores user preferences for solar return calculations
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('solar_return_settings', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key
    table
      .uuid('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Notification preferences
    table.boolean('email_reminders').defaultTo(true);
    table.integer('reminder_days_before').defaultTo(7); // Remind X days before birthday
    table.boolean('send_solar_return_report').defaultTo(true);

    // Calculation preferences
    table.string('default_house_system').defaultTo('placidus');
    table.string('default_zodiac_type').defaultTo('tropical');
    table.string('default_orb_type').defaultTo('major'); // major, minor, all

    // Display preferences
    table.jsonb('chart_display_preferences');
    // Structure: { showAspects: true, showMidpoints: false, colorScheme: 'default' }

    // Location preferences
    table.jsonb('default_location');
    // Structure: { name: string, latitude: number, longitude: number, timezone: string }

    // Sharing preferences
    table.boolean('allow_sharing').defaultTo(false);
    table.boolean('auto_share_with_connections').defaultTo(false);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
  });

  // Add comment
  await knex.raw(`
    COMMENT ON TABLE solar_return_settings IS 'Stores user preferences for solar return calculations and notifications';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('solar_return_settings');
}
