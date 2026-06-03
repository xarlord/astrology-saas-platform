import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('blog_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('author_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('title', 200).notNullable();
    table.text('body').notNullable();
    table.string('image_url', 500).nullable();
    table.boolean('is_published').defaultTo(true).notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('blog_posts');
}
