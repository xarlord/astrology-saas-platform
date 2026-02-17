/**
 * Integration Test Utilities
 */

import bcrypt from 'bcryptjs';
import { db } from '../../db';

/**
 * Clean database tables
 */
export async function cleanDatabase(database: any) {
  const tables = [
    'refresh_tokens',
    'chart_analysis_cache',
    'charts',
    'users',
  ];

  for (const table of tables) {
    await database(table).del();
  }
}

/**
 * Create test user in database
 */
export async function createTestUser(database: any) {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const [user] = await database('users')
    .insert({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      subscription_tier: 'free',
    })
    .returning('*');

  return user;
}
