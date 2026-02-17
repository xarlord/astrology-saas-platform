/**
 * Integration Test Utilities for AI Tests
 * Helper functions for AI integration tests
 */

import { db } from '../db';
import bcrypt from 'bcryptjs';

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

/**
 * Create authenticated test user with token
 */
export async function createAuthenticatedUser(database: any, request: any) {
  await createTestUser(database);

  const loginResponse = await request
    .post('/api/v1/auth/login')
    .send({
      email: 'test@example.com',
      password: 'Password123!',
    });

  return {
    user: loginResponse.body.data.user,
    token: loginResponse.body.data.token,
  };
}
