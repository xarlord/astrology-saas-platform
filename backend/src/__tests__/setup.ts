/**
 * Test Setup File
 * Configures test environment, mocks, and global test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://postgres:astrology123@localhost:5434/astrology_saas_test';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5434';
process.env.DATABASE_NAME = 'astrology_saas_test';
process.env.DATABASE_USER = 'postgres';
process.env.DATABASE_PASSWORD = 'astrology123';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Winston logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = !isNaN(Date.parse(received));
    return {
      pass,
      message: () => (pass ? `Expected ${received} not to be a valid date` : `Expected ${received} to be a valid date`),
    };
  },
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => (pass ? `Expected ${received} not to be within range [${min}, ${max}]` : `Expected ${received} to be within range [${min}, ${max}]`),
    };
  },
  toBePlanetPosition(received) {
    const validKeys = ['planet', 'sign', 'degree', 'minute', 'second', 'house', 'retrograde', 'latitude', 'longitude', 'speed'];
    const hasRequiredKeys = ['planet', 'sign', 'degree', 'minute', 'second', 'house'].every(key => key in received);
    const pass = hasRequiredKeys;
    return {
      pass,
      message: () => (pass ? `Expected ${received} to have required planet position keys` : `Expected ${received} to have keys: ${validKeys.join(', ')}`),
    };
  },
});
