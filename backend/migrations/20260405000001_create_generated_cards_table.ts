/**
 * Create generated_cards table for shareable natal chart cards
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('generated_cards', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('chart_id').notNullable().references('id').inTable('charts').onDelete('CASCADE');

    // Share token for public access
    table.string('share_token', 64).notNullable().unique();

    // Card configuration
    table.string('template', 50).notNullable().defaultTo('instagram_story');
    table.specificType('planet_placements', 'text[]').notNullable().defaultTo(knex.raw("ARRAY['sun','moon','ascendant']::text[]"));
    table.boolean('show_insight').notNullable().defaultTo(true);
    table.text('insight_text').nullable();

    // Image metadata
    table.string('image_url', 512).nullable();
    table.integer('image_width').nullable();
    table.integer('image_height').nullable();

    // Social/OG data
    table.string('og_title', 200).nullable();
    table.string('og_description', 500).nullable();

    // Referral tracking
    table.string('referral_code', 20).nullable();

    // Status
    table.boolean('is_public').notNullable().defaultTo(true);
    table.integer('view_count').notNullable().defaultTo(0);

    // Timestamps
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });

  // Indexes
  await knex.raw('CREATE INDEX idx_generated_cards_user_id ON generated_cards (user_id) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_generated_cards_share_token ON generated_cards (share_token) WHERE deleted_at IS NULL');
  await knex.raw('CREATE INDEX idx_generated_cards_chart_id ON generated_cards (chart_id) WHERE deleted_at IS NULL');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('generated_cards');
}
