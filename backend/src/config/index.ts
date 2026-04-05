/**
 * Application Configuration
 */

import dotenv from 'dotenv';

dotenv.config();

interface Config {
  // Server
  port: number;
  nodeEnv: string;
  frontendUrl: string;

  // Database
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Swiss Ephemeris
  ephemeris: {
    path: string;
  };

  // Logging
  logging: {
    level: string;
    format: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Pagination
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };

  // Redis
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
  };

  // Stripe
  stripe: {
    secretKey: string;
    webhookSecret: string;
    proPriceId: string;
    premiumPriceId: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DATABASE_PASSWORD || ''}@localhost:5434/astrology_saas`,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5434', 10),
    name: process.env.DATABASE_NAME || 'astrology_saas',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_PASSWORD must be set in production');
      }
      return '';
    })(),
  },

  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      return 'dev-secret-do-not-use-in-production';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Changed from 7d to 1h for security
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Shortened from 30d to 7d
  },

  ephemeris: {
    path: process.env.EPHEMERIS_PATH || './ephemeris',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    proPriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
  },
};

export default config;
