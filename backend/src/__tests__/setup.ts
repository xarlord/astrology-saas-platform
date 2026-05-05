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

// Mock optional dependencies not installed in CI
jest.mock('ioredis', () => {
  const Redis = jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    incr: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    hget: jest.fn().mockResolvedValue(null),
    hset: jest.fn().mockResolvedValue(1),
    hdel: jest.fn().mockResolvedValue(1),
    hgetall: jest.fn().mockResolvedValue({}),
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    zadd: jest.fn().mockResolvedValue(1),
    zrange: jest.fn().mockResolvedValue([]),
    zrem: jest.fn().mockResolvedValue(1),
    publish: jest.fn().mockResolvedValue(1),
    subscribe: jest.fn().mockResolvedValue(undefined),
    psubscribe: jest.fn().mockResolvedValue(undefined),
    on: jest.fn().mockReturnThis(),
    off: jest.fn().mockReturnThis(),
    disconnect: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    status: 'ready',
    connected: true,
  }));
  (Redis as any).default = Redis;
  return Redis;
}, { virtual: true });

jest.mock('bullmq', () => {
  const Queue = jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    close: jest.fn().mockResolvedValue(undefined),
    obliterate: jest.fn().mockResolvedValue(undefined),
    getJobs: jest.fn().mockResolvedValue([]),
    getJobCounts: jest.fn().mockResolvedValue({}),
  }));
  const Worker = jest.fn().mockImplementation(() => ({
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  }));
  const QueueEvents = jest.fn().mockImplementation(() => ({
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  }));
  return { Queue, Worker, QueueEvents };
}, { virtual: true });

jest.mock('replicate', () => {
  const Replicate = jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue([]),
    predictions: { create: jest.fn().mockResolvedValue({ id: 'mock' }) },
  }));
  (Replicate as any).default = Replicate;
  return Replicate;
}, { virtual: true });

jest.mock('stripe', () => {
  const Stripe = jest.fn().mockImplementation(() => ({
    customers: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn() },
    subscriptions: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn(), del: jest.fn(), list: jest.fn() },
    paymentMethods: { attach: jest.fn(), detach: jest.fn(), list: jest.fn() },
    checkout: { sessions: { create: jest.fn() } },
    billingPortal: { sessions: { create: jest.fn() } },
    webhooks: { constructEvent: jest.fn() },
  }));
  return Stripe;
}, { virtual: true });

jest.mock('resend', () => {
  const Resend = jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({ id: 'mock-email-id' }) },
  }));
  return { default: Resend, Resend };
}, { virtual: true });

jest.mock('swagger-jsdoc', () => {
  return jest.fn().mockReturnValue({ paths: {}, components: {}, info: {} });
}, { virtual: true });

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = !isNaN(Date.parse(received));
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid date`
          : `Expected ${received} to be a valid date`,
    };
  },
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within range [${min}, ${max}]`
          : `Expected ${received} to be within range [${min}, ${max}]`,
    };
  },
  toBePlanetPosition(received) {
    const validKeys = [
      'planet',
      'sign',
      'degree',
      'minute',
      'second',
      'house',
      'retrograde',
      'latitude',
      'longitude',
      'speed',
    ];
    const hasRequiredKeys = ['planet', 'sign', 'degree', 'minute', 'second', 'house'].every(
      (key) => key in received,
    );
    const pass = hasRequiredKeys;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} to have required planet position keys`
          : `Expected ${received} to have keys: ${validKeys.join(', ')}`,
    };
  },
});
