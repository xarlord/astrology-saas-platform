import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('auth_provider', 20).notNullable().defaultTo('email');
    table.string('firebase_uid').nullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('auth_provider');
    table.dropColumn('firebase_uid');
  });
}
