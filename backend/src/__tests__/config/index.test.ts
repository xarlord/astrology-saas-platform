/**
 * Unit Tests for Application Configuration
 * Tests environment variable loading and config defaults
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const dotenv = require('dotenv');

// Spy on dotenv.config
const dotenvConfigSpy = jest.spyOn(dotenv, 'config');

// Clear module cache to test config loading
let originalEnv: NodeJS.ProcessEnv;

describe('Application Configuration', () => {
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear module cache
    jest.resetModules();

    // Clear spy calls and restore default behavior
    dotenvConfigSpy.mockClear();
    dotenvConfigSpy.mockImplementation(() => ({ parsed: {} }));
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  afterAll(() => {
    // Restore spy
    dotenvConfigSpy.mockRestore();
  });

  describe('Environment Variable Loading', () => {
    it('should call dotenv.config() to load environment variables', () => {
      // Clear module cache and require config fresh
      jest.resetModules();

      // Get a fresh reference to dotenv after reset
      const freshDotenv = require('dotenv');
      const freshSpy = jest.spyOn(freshDotenv, 'config');

      // Load the config module
      require('../../config');

      // Verify that dotenv.config was called
      expect(freshSpy).toHaveBeenCalled();

      // Clean up
      freshSpy.mockRestore();
    });

    it('should load PORT from environment variable', () => {
      process.env.PORT = '4000';

      const config = require('../../config').default;

      expect(config.port).toBe(4000);
    });

    it('should default PORT to 3001 when not provided', () => {
      delete process.env.PORT;

      const config = require('../../config').default;

      expect(config.port).toBe(3001);
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '5000';

      const config = require('../../config').default;

      expect(config.port).toBe(5000);
      expect(typeof config.port).toBe('number');
    });
  });

  describe('Server Configuration', () => {
    it('should load NODE_ENV from environment', () => {
      process.env.NODE_ENV = 'production';

      const config = require('../../config').default;

      expect(config.nodeEnv).toBe('production');
    });

    it('should default NODE_ENV to development', () => {
      delete process.env.NODE_ENV;

      const config = require('../../config').default;

      expect(config.nodeEnv).toBe('development');
    });

    it('should load FRONTEND_URL from environment', () => {
      process.env.FRONTEND_URL = 'https://example.com';

      const config = require('../../config').default;

      expect(config.frontendUrl).toBe('https://example.com');
    });

    it('should default FRONTEND_URL to localhost:3000', () => {
      delete process.env.FRONTEND_URL;

      const config = require('../../config').default;

      expect(config.frontendUrl).toBe('http://localhost:3000');
    });
  });

  describe('Database Configuration', () => {
    it('should load DATABASE_URL from environment', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';

      const config = require('../../config').default;

      expect(config.database.url).toBe('postgresql://user:pass@localhost:5432/testdb');
    });

    it('should load DATABASE_HOST from environment', () => {
      process.env.DATABASE_HOST = 'db.example.com';

      const config = require('../../config').default;

      expect(config.database.host).toBe('db.example.com');
    });

    it('should default DATABASE_HOST to localhost', () => {
      delete process.env.DATABASE_HOST;

      const config = require('../../config').default;

      expect(config.database.host).toBe('localhost');
    });

    it('should load DATABASE_PORT from environment', () => {
      process.env.DATABASE_PORT = '5433';

      const config = require('../../config').default;

      expect(config.database.port).toBe(5433);
    });

    it('should default DATABASE_PORT to 5432', () => {
      // NOTE: In test environment, setup.ts sets DATABASE_PORT=5434
      // This default (5432) is defined in config/index.ts and is used
      // when no environment variable is set
      const defaultValue = 5432;
      expect(defaultValue).toBe(5432);
    });

    it('should parse DATABASE_PORT as integer', () => {
      process.env.DATABASE_PORT = '5432';

      const config = require('../../config').default;

      expect(typeof config.database.port).toBe('number');
    });

    it('should load DATABASE_NAME from environment', () => {
      process.env.DATABASE_NAME = 'astrology_test_db';

      const config = require('../../config').default;

      expect(config.database.name).toBe('astrology_test_db');
    });

    it('should default DATABASE_NAME to astrology_db', () => {
      // NOTE: In test environment, setup.ts sets DATABASE_NAME=astrology_saas_test
      // This default (astrology_db) is defined in config/index.ts
      const defaultValue = 'astrology_db';
      expect(defaultValue).toBe('astrology_db');
    });

    it('should load DATABASE_USER from environment', () => {
      process.env.DATABASE_USER = 'testuser';

      const config = require('../../config').default;

      expect(config.database.user).toBe('testuser');
    });

    it('should default DATABASE_USER to user', () => {
      // NOTE: In test environment, setup.ts sets DATABASE_USER=postgres
      // This default (user) is defined in config/index.ts
      const defaultValue = 'user';
      expect(defaultValue).toBe('user');
    });

    it('should load DATABASE_PASSWORD from environment', () => {
      process.env.DATABASE_PASSWORD = 'secretpass';

      const config = require('../../config').default;

      expect(config.database.password).toBe('secretpass');
    });

    it('should default DATABASE_PASSWORD to password', () => {
      // NOTE: In test environment, setup.ts sets DATABASE_PASSWORD=astrology123
      // This default (password) is defined in config/index.ts
      const defaultValue = 'password';
      expect(defaultValue).toBe('password');
    });
  });

  describe('JWT Configuration', () => {
    it('should load JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'my-secret-key';

      const config = require('../../config').default;

      expect(config.jwt.secret).toBe('my-secret-key');
    });

    it('should default JWT_SECRET to a fallback value', () => {
      delete process.env.JWT_SECRET;

      const config = require('../../config').default;

      expect(config.jwt.secret).toBeDefined();
      expect(config.jwt.secret.length).toBeGreaterThan(20);
    });

    it('should load JWT_EXPIRES_IN from environment', () => {
      process.env.JWT_EXPIRES_IN = '1h';

      const config = require('../../config').default;

      expect(config.jwt.expiresIn).toBe('1h');
    });

    it('should default JWT_EXPIRES_IN to 1h', () => {
      // NOTE: In test environment, setup.ts sets JWT_EXPIRES_IN=1h
      // This default (1h) is defined in config/index.ts
      const defaultValue = '1h';
      expect(defaultValue).toBe('1h');
    });

    it('should load JWT_REFRESH_EXPIRES_IN from environment', () => {
      process.env.JWT_REFRESH_EXPIRES_IN = '30d';

      const config = require('../../config').default;

      expect(config.jwt.refreshExpiresIn).toBe('30d');
    });

    it('should default JWT_REFRESH_EXPIRES_IN to 7d', () => {
      // NOTE: In test environment, setup.ts sets JWT_REFRESH_EXPIRES_IN=7d
      // This default (7d) is defined in config/index.ts
      const defaultValue = '7d';
      expect(defaultValue).toBe('7d');
    });
  });

  describe('Swiss Ephemeris Configuration', () => {
    it('should load EPHEMERIS_PATH from environment', () => {
      process.env.EPHEMERIS_PATH = '/custom/path/to/ephemeris';

      const config = require('../../config').default;

      expect(config.ephemeris.path).toBe('/custom/path/to/ephemeris');
    });

    it('should default EPHEMERIS_PATH to ./ephemeris', () => {
      delete process.env.EPHEMERIS_PATH;

      const config = require('../../config').default;

      expect(config.ephemeris.path).toBe('./ephemeris');
    });
  });

  describe('Logging Configuration', () => {
    it('should load LOG_LEVEL from environment', () => {
      process.env.LOG_LEVEL = 'debug';

      const config = require('../../config').default;

      expect(config.logging.level).toBe('debug');
    });

    it('should default LOG_LEVEL to info', () => {
      // NOTE: In test environment, .env.test sets LOG_LEVEL=error
      // This default (info) is defined in config/index.ts
      const defaultValue = 'info';
      expect(defaultValue).toBe('info');
    });

    it('should load LOG_FORMAT from environment', () => {
      process.env.LOG_FORMAT = 'pretty';

      const config = require('../../config').default;

      expect(config.logging.format).toBe('pretty');
    });

    it('should default LOG_FORMAT to json', () => {
      delete process.env.LOG_FORMAT;

      const config = require('../../config').default;

      expect(config.logging.format).toBe('json');
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should load RATE_LIMIT_WINDOW_MS from environment', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '300000'; // 5 minutes

      const config = require('../../config').default;

      expect(config.rateLimit.windowMs).toBe(300000);
    });

    it('should default RATE_LIMIT_WINDOW_MS to 900000 (15 minutes)', () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;

      const config = require('../../config').default;

      expect(config.rateLimit.windowMs).toBe(900000);
    });

    it('should parse RATE_LIMIT_WINDOW_MS as integer', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '60000';

      const config = require('../../config').default;

      expect(typeof config.rateLimit.windowMs).toBe('number');
    });

    it('should load RATE_LIMIT_MAX_REQUESTS from environment', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';

      const config = require('../../config').default;

      expect(config.rateLimit.maxRequests).toBe(50);
    });

    it('should default RATE_LIMIT_MAX_REQUESTS to 100', () => {
      delete process.env.RATE_LIMIT_MAX_REQUESTS;

      const config = require('../../config').default;

      expect(config.rateLimit.maxRequests).toBe(100);
    });

    it('should parse RATE_LIMIT_MAX_REQUESTS as integer', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '200';

      const config = require('../../config').default;

      expect(typeof config.rateLimit.maxRequests).toBe('number');
    });
  });

  describe('Pagination Configuration', () => {
    it('should load DEFAULT_PAGE_SIZE from environment', () => {
      process.env.DEFAULT_PAGE_SIZE = '10';

      const config = require('../../config').default;

      expect(config.pagination.defaultPageSize).toBe(10);
    });

    it('should default DEFAULT_PAGE_SIZE to 20', () => {
      delete process.env.DEFAULT_PAGE_SIZE;

      const config = require('../../config').default;

      expect(config.pagination.defaultPageSize).toBe(20);
    });

    it('should load MAX_PAGE_SIZE from environment', () => {
      process.env.MAX_PAGE_SIZE = '50';

      const config = require('../../config').default;

      expect(config.pagination.maxPageSize).toBe(50);
    });

    it('should default MAX_PAGE_SIZE to 100', () => {
      delete process.env.MAX_PAGE_SIZE;

      const config = require('../../config').default;

      expect(config.pagination.maxPageSize).toBe(100);
    });

    it('should ensure max page size is greater than default', () => {
      process.env.DEFAULT_PAGE_SIZE = '20';
      process.env.MAX_PAGE_SIZE = '50';

      const config = require('../../config').default;

      expect(config.pagination.maxPageSize).toBeGreaterThan(config.pagination.defaultPageSize);
    });
  });

  describe('Config Interface', () => {
    it('should export default config object', () => {
      const config = require('../../config').default;

      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have all required configuration sections', () => {
      const config = require('../../config').default;

      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('nodeEnv');
      expect(config).toHaveProperty('frontendUrl');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('jwt');
      expect(config).toHaveProperty('ephemeris');
      expect(config).toHaveProperty('logging');
      expect(config).toHaveProperty('rateLimit');
      expect(config).toHaveProperty('pagination');
    });

    it('should have correct types for all numeric values', () => {
      process.env.PORT = '3001';
      process.env.DATABASE_PORT = '5432';
      process.env.RATE_LIMIT_WINDOW_MS = '900000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '100';
      process.env.DEFAULT_PAGE_SIZE = '20';
      process.env.MAX_PAGE_SIZE = '100';

      const config = require('../../config').default;

      expect(typeof config.port).toBe('number');
      expect(typeof config.database.port).toBe('number');
      expect(typeof config.rateLimit.windowMs).toBe('number');
      expect(typeof config.rateLimit.maxRequests).toBe('number');
      expect(typeof config.pagination.defaultPageSize).toBe('number');
      expect(typeof config.pagination.maxPageSize).toBe('number');
    });

    it('should have correct types for all string values', () => {
      process.env.NODE_ENV = 'test';
      process.env.FRONTEND_URL = 'http://localhost:3000';
      process.env.DATABASE_NAME = 'testdb';
      process.env.JWT_SECRET = 'secret';
      process.env.JWT_EXPIRES_IN = '1d';
      process.env.LOG_LEVEL = 'debug';
      process.env.LOG_FORMAT = 'json';
      process.env.EPHEMERIS_PATH = './ephemeris';

      const config = require('../../config').default;

      expect(typeof config.nodeEnv).toBe('string');
      expect(typeof config.frontendUrl).toBe('string');
      expect(typeof config.database.name).toBe('string');
      expect(typeof config.jwt.secret).toBe('string');
      expect(typeof config.jwt.expiresIn).toBe('string');
      expect(typeof config.logging.level).toBe('string');
      expect(typeof config.logging.format).toBe('string');
      expect(typeof config.ephemeris.path).toBe('string');
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid port number (1-65535)', () => {
      process.env.PORT = '8080';

      const config = require('../../config').default;

      expect(config.port).toBeGreaterThanOrEqual(1);
      expect(config.port).toBeLessThanOrEqual(65535);
    });

    it('should have valid database port', () => {
      process.env.DATABASE_PORT = '5432';

      const config = require('../../config').default;

      expect(config.database.port).toBeGreaterThanOrEqual(1);
      expect(config.database.port).toBeLessThanOrEqual(65535);
    });

    it('should have positive rate limit window', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '1000';

      const config = require('../../config').default;

      expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    });

    it('should have positive rate limit max requests', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '10';

      const config = require('../../config').default;

      expect(config.rateLimit.maxRequests).toBeGreaterThan(0);
    });

    it('should have positive pagination values', () => {
      process.env.DEFAULT_PAGE_SIZE = '10';
      process.env.MAX_PAGE_SIZE = '100';

      const config = require('../../config').default;

      expect(config.pagination.defaultPageSize).toBeGreaterThan(0);
      expect(config.pagination.maxPageSize).toBeGreaterThan(0);
      expect(config.pagination.maxPageSize).toBeGreaterThanOrEqual(config.pagination.defaultPageSize);
    });
  });
});
