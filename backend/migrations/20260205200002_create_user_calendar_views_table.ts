import type { Knex } from 'knex';

/**
 * Create user_calendar_views table
 * Tracks calendar engagement - which dates users view and which events they interact with
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_calendar_views', (table) => {
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

    // View tracking
    table.date('view_date').notNullable();
    table.jsonb('viewed_events').nullable(); // Track which events were viewed

    // Metadata
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    // Composite index for user + date queries
    table.index(['user_id', 'view_date'], 'idx_views_user_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_calendar_views');
}
