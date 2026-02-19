/**
 * Unit Tests for Database Configuration
 * Tests Knex.js configuration and database connection settings
 */

/* eslint-disable @typescript-eslint/no-var-requires */

import knexConfig from '../config/database';
import config from '../config';

// Mock dependencies
jest.mock('../config');

describe('Database Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Knex Configuration', () => {
    it('should have pg as client', () => {
      expect(knexConfig.client).toBe('pg');
    });

    it('should have connection configuration from config', () => {
      expect(knexConfig.connection).toEqual({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      });
    });

    it('should disable SSL in non-production environment', () => {
      process.env.NODE_ENV = 'development';

      // Re-import to get fresh config
      const freshConfig = require('../config/database').default;

      expect(freshConfig.connection.ssl).toBe(false);
    });

    it('should enable SSL in production environment', () => {
      jest.doMock('../config', () => ({
        nodeEnv: 'production',
        database: {
          host: 'localhost',
          port: 5432,
          user: 'user',
          password: 'password',
          name: 'db',
        },
      }));

      const freshConfig = require('../config/database').default;

      expect(freshConfig.connection.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should configure connection pool with min and max', () => {
      expect(knexConfig.pool).toEqual({
        min: 2,
        max: 10,
      });
    });

    it('should configure migrations directory', () => {
      expect(knexConfig.migrations).toEqual({
        directory: './migrations',
        tableName: 'knex_migrations',
      });
    });

    it('should configure seeds directory', () => {
      expect(knexConfig.seeds).toEqual({
        directory: './seeds',
      });
    });

    it('should configure search path', () => {
      expect(knexConfig.searchPath).toEqual(['knex', 'public']);
    });
  });

  describe('Connection Pool Settings', () => {
    it('should use minimum of 2 connections in pool', () => {
      expect(knexConfig.pool.min).toBe(2);
    });

    it('should use maximum of 10 connections in pool', () => {
      expect(knexConfig.pool.max).toBe(10);
    });

    it('should have reasonable pool size for production', () => {
      const maxPool = knexConfig.pool.max;
      const minPool = knexConfig.pool.min;

      expect(maxPool).toBeGreaterThanOrEqual(minPool);
      expect(maxPool).toBeLessThanOrEqual(20);
    });
  });

  describe('Migration Configuration', () => {
    it('should point to correct migrations directory', () => {
      expect(knexConfig.migrations.directory).toBe('./migrations');
    });

    it('should use standard migrations table name', () => {
      expect(knexConfig.migrations.tableName).toBe('knex_migrations');
    });
  });

  describe('Seed Configuration', () => {
    it('should point to correct seeds directory', () => {
      expect(knexConfig.seeds.directory).toBe('./seeds');
    });
  });

  describe('Search Path Configuration', () => {
    it('should include knex schema', () => {
      expect(knexConfig.searchPath).toContain('knex');
    });

    it('should include public schema', () => {
      expect(knexConfig.searchPath).toContain('public');
    });
  });

  describe('Configuration Export', () => {
    it('should export default configuration object', () => {
      expect(knexConfig).toBeDefined();
      expect(typeof knexConfig).toBe('object');
    });

    it('should have all required Knex configuration properties', () => {
      const requiredProps = ['client', 'connection', 'pool', 'migrations', 'seeds'];
      requiredProps.forEach((prop) => {
        expect(knexConfig).toHaveProperty(prop);
      });
    });
  });

  describe('Connection Security', () => {
    it('should use rejectUnauthorized: false for SSL in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const productionConfig = require('../config/database').default;

      expect(productionConfig.connection.ssl).toEqual({
        rejectUnauthorized: false,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not use SSL in development', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const devConfig = require('../config/database').default;

      expect(devConfig.connection.ssl).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Configuration Values', () => {
    it('should have valid database port', () => {
      const port = knexConfig.connection.port as number;
      expect(port).toBeGreaterThan(0);
      expect(port).toBeLessThanOrEqual(65535);
    });

    it('should have non-empty database name', () => {
      const dbName = knexConfig.connection.database;
      expect(dbName).toBeTruthy();
      expect(dbName.length).toBeGreaterThan(0);
    });

    it('should have non-empty user', () => {
      const user = knexConfig.connection.user;
      expect(user).toBeTruthy();
      expect(user.length).toBeGreaterThan(0);
    });
  });
});
