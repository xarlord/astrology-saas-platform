import type { Knex } from "knex";

/**
 * Create synastry_reports table
 *
 * Stores synastry (relationship compatibility) reports between two charts
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('synastry_reports', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('chart1_id').references('id').inTable('natal_charts').onDelete('CASCADE');
    table.uuid('chart2_id').references('id').inTable('natal_charts').onDelete('CASCADE');

    // Overall compatibility score (0-100)
    table.integer('overall_score').notNullable();

    // Category-specific scores
    table.jsonb('category_scores').nullable(); // { romance: 75, communication: 80, values: 85, etc. }

    // Synastry aspects between the two charts
    table.jsonb('synastry_aspects').nullable(); // Array of aspect objects

    // Composite chart data (combined chart of the relationship)
    table.jsonb('composite_chart').nullable(); // Composite chart positions

    // Detailed interpretation
    table.text('interpretation').nullable();

    // Sharing functionality
    table.uuid('share_id').unique().nullable();
    table.timestamp('share_expires_at').nullable();

    // Report metadata
    table.string('relationship_name').nullable(); // Optional name for the relationship
    table.boolean('is_favorite').defaultTo(false);

    table.timestamps(true, true);

    // Indexes for common queries
    table.index(['user_id', 'created_at']);
    table.index('share_id');
    table.index(['chart1_id', 'chart2_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('synastry_reports');
}

