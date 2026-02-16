/**
 * Create Synastry Aspects Table
 * Stores cross-chart aspects for detailed synastry analysis
 */

export const up = async (knex: any) => {
  await knex.schema.createTable('synastry_aspects', (table: any) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Reference to synastry_charts
    table.uuid('synastry_chart_id').notNullable();

    // Planet from chart 1
    table.text('planet1').notNullable(); // 'sun', 'moon', 'mercury', etc.

    // Planet from chart 2
    table.text('planet2').notNullable();

    // Aspect type
    table.enum('aspect', ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx', 'semi-sextile']).notNullable();

    // Orb (degrees)
    table.decimal('orb', 5, 2).notNullable();

    // Is applying?
    table.boolean('applying').defaultTo(true);

    // Interpretation of this synastry aspect
    table.text('interpretation').notNullable();

    // Influence weight (for overall compatibility calculation)
    table.integer('weight').defaultTo(1); // 1-5, how important this aspect is

    // Is this a "soulmate" indicator?
    table.boolean('soulmate_indicator').defaultTo(false);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('synastry_chart_id');
    table.index('planet1');
    table.index('planet2');
    table.index('aspect');

    // Foreign key constraint
    table
      .foreign('synastry_chart_id')
      .references('id')
      .inTable('synastry_charts')
      .onDelete('CASCADE');
  });
};

export const down = async (knex: any) => {
  await knex.schema.dropTableIfExists('synastry_aspects');
};
