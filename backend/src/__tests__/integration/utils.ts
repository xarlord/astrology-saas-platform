/**
 * Integration Test Utilities
 */

import bcrypt from 'bcryptjs';

/**
 * Clean database tables
 */
export async function cleanDatabase(database: any) {
  const tables = [
    'refresh_tokens',
    'ai_cache',
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
  const testEmail = `test-${Date.now()}@example.com`;

  const [user] = await database('users')
    .insert({
      email: testEmail,
      password_hash: hashedPassword,
      name: 'Test User',
      plan: 'free',
    })
    .returning('*');

  return user;
}

/**
 * Create test chart in database
 */
export async function createTestChart(database: any, userId: string) {
  const [chart] = await database('charts')
    .insert({
      user_id: userId,
      name: 'Test Chart',
      date: '1990-01-01',
      time: '12:00:00',
      place: 'New York',
      country: 'US',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      calculated_data: {
        planets: {},
        houses: [],
        aspects: [],
      },
    })
    .returning('*');

  return chart;
}
