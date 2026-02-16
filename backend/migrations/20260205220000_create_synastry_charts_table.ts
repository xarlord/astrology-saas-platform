/**
 * Create Synastry Charts Table
 * Stores comparisons between two natal charts
 */

export const up = async (knex: any) => {
  await knex.schema.createTable('synastry_charts', (table: any) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys to charts
    table.uuid('chart1_id').notNullable();
    table.uuid('chart2_id').notNullable();

    // User who created this synastry comparison
    table.uuid('user_id').notNullable();

    // Synastry calculation results (JSON)
    table.jsonb('synastry_aspects').notNullable(); // Cross-chart aspects

    // Overall compatibility score (1-10)
    table.integer('compatibility_score').notNullable();

    // Relationship theme
    table.text('relationship_theme').notNullable();

    // Key strengths
    table.specificType('text[]', 'array').nullable();

    // Key challenges
    table.specificType('text[]', 'array').nullable();

    // Advice for the relationship
    table.text('advice').nullable();

    // Is this a saved favorite?
    table.boolean('is_favorite').defaultTo(false);

    // Notes
    table.text('notes').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('user_id');
    table.index('chart1_id');
    table.index('chart2_id');
    table.index('created_at');

    // Foreign key constraints
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('chart1_id')
      .references('id')
      .inTable('charts')
      .onDelete('CASCADE');

    table
      .foreign('chart2_id')
      .references('id')
      .inTable('charts')
      .onDelete('CASCADE');
  });
};

export const down = async (knex: any) => {
  await knex.schema.dropTableIfExists('synastry_charts');
};
