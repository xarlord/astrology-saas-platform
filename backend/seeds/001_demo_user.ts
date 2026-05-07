/**
 * Seed: Demo User Account
 *
 * Creates a demo user for internal testing and demonstration.
 * Password: DemoPass123! (hashed via bcrypt)
 */

import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Check if demo user already exists
  const existing = await knex('users').where({ email: 'demo@astroverse.app' }).first();
  if (existing) return;

  const passwordHash = await bcrypt.hash('DemoPass123!', 12);

  await knex('users').insert({
    name: 'Demo User',
    email: 'demo@astroverse.app',
    password_hash: passwordHash,
    timezone: 'America/New_York',
    plan: 'premium',
    subscription_status: 'active',
    preferences: JSON.stringify({
      notifications: { email: true, push: true },
      theme: 'dark',
      defaultHouseSystem: 'placidus',
    }),
  });
}
