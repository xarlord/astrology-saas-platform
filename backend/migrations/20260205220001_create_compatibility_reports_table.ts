/**
 * Create Compatibility Reports Table
 * Stores detailed compatibility reports between users
 */

export const up = async (knex: any) => {
  await knex.schema.createTable('compatibility_reports', (table: any) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // The two users being compared
    table.uuid('user1_id').notNullable();
    table.uuid('user2_id').notNullable();

    // Who created this report
    table.uuid('created_by').notNullable();

    // Overall compatibility (1-10)
    table.integer('overall_compatibility').notNullable();

    // Category-specific compatibility scores
    table.integer('romantic_compatibility').nullable();
    table.integer('communication_compatibility').nullable();
    table.integer('emotional_compatibility').nullable();
    table.integer('intellectual_compatibility').nullable();
    table.integer('spiritual_compatibility').nullable();
    table.integer('values_compatibility').nullable();

    // Elemental balance
    table.jsonb('elemental_balance').nullable(); // { fire: number, earth: number, air: number, water: number }

    // Key relationship dynamics
    table.jsonb('relationship_dynamics').nullable(); // Array of key dynamics

    // Strengths
    table.specificType('strengths', 'text[]').nullable();

    // Challenges
    table.specificType('challenges', 'text[]').nullable();

    // Growth opportunities
    table.specificType('growth_opportunities', 'text[]').nullable();

    // Detailed report (markdown)
    table.text('detailed_report').nullable();

    // Is archived?
    table.boolean('is_archived').defaultTo(false);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('user1_id');
    table.index('user2_id');
    table.index('created_by');
    table.index('created_at');

    // Unique constraint to prevent duplicate reports
    table.unique(['user1_id', 'user2_id', 'created_by']);

    // Foreign key constraints
    table
      .foreign('user1_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('user2_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .foreign('created_by')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
  });
};

export const down = async (knex: any) => {
  await knex.schema.dropTableIfExists('compatibility_reports');
};
