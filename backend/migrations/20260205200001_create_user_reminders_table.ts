import type { Knex } from 'knex';

/**
 * Create user_reminders table
 * Stores user notification preferences for astrological events
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_reminders', (table) => {
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

    // Reminder preferences
    table.string('event_type', 50).notNullable(); // 'all', 'major-transits', 'retrogrades', 'eclipses'
    table.string('reminder_type', 20).notNullable(); // 'email', 'push'
    table.specificType('reminder_advance_hours', 'integer[]').notNullable(); // [24, 72, 168]

    // Status
    table.boolean('is_active').defaultTo(true).index();

    // Metadata
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_reminders');
}
