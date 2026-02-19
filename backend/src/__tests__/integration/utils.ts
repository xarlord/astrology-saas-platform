/**
 * Integration Test Utilities
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';

/**
 * Clean database tables in correct order (respecting foreign keys)
 */
export async function cleanDatabase(database: any) {
  const tables = [
    'synastry_reports',
    'monthly_forecasts',
    'lunar_returns',
    'user_reminders',
    'calendar_events',
    'ai_usage',
    'ai_cache',
    'push_subscriptions',
    'solar_return_settings',
    'solar_returns',
    'user_calendar_views',
    'interpretations',
    'transit_readings',
    'charts',
    'refresh_tokens',
    'audit_log',
    'users',
  ];

  for (const table of tables) {
    try {
      await database(table).del();
    } catch (error) {
      // Table might not exist, ignore
    }
  }
}

/**
 * Create test user in database
 */
export async function createTestUser(database: any, overrides: Partial<any> = {}) {
  // Use random string to ensure uniqueness even when tests run in quick succession
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const testEmail = `test-${randomSuffix}@example.com`;
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const [user] = await database('users')
    .insert({
      email: testEmail,
      password_hash: hashedPassword, // Changed from password to password_hash
      name: 'Test User',
      plan: 'free', // Changed from subscription_tier to plan
      ...overrides,
    })
    .returning('*');

  return user;
}

/**
 * Create test chart in database
 */
export async function createTestChart(database: any, userId: string, overrides: Partial<any> = {}) {
  const [chart] = await database('charts')
    .insert({
      user_id: userId,
      name: 'Test Chart',
      birth_date: '1990-01-01',
      birth_time: '12:00:00',
      birth_place_name: 'New York, NY', // Changed from birth_place to birth_place_name
      birth_latitude: 40.7128, // Changed from latitude
      birth_longitude: -74.0060, // Changed from longitude
      birth_timezone: 'America/New_York', // Changed from timezone
      house_system: 'placidus',
      zodiac: 'tropical', // Changed from zodiac_type to zodiac
      calculated_data: {
        planets: {},
        houses: [],
        aspects: [],
      },
      ...overrides,
    })
    .returning('*');

  return chart;
}

/**
 * Generate a valid JWT token for a user
 */
export function generateAuthToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
}

/**
 * Generate a valid refresh token for a user
 */
export function generateRefreshToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

/**
 * Make an authenticated request
 */
export function authenticatedRequest(app: any, method: string, url: string, token: string) {
  return request(app)[method.toLowerCase()](url)
    .set('Authorization', `Bearer ${token}`);
}

/**
 * Mock user data for tests
 */
export const mockUser = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User',
};

/**
 * Mock request object
 */
export const mockRequest = () => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
});

/**
 * Mock response object
 */
export const mockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};
