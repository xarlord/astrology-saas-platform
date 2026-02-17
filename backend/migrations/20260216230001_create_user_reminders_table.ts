import { Knex } from 'knex';

/**
 * Create user_reminders table
 * Stores user preferences for astrological event notifications
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_reminders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.enum('reminder_type', ['transit', 'moon_phase', 'eclipse', 'retrograde']).notNullable();
    table.integer('advance_notice_hours').defaultTo(24); // 24h, 48h, 72h before event

    table.boolean('email_enabled').defaultTo(true);
    table.boolean('push_enabled').defaultTo(false);
    table.jsonb('preferences').nullable(); // Additional preferences as JSON

    table.timestamps(true, true);

    table.index('user_id');
    table.index(['user_id', 'reminder_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_reminders');
}
