/**
 * Astrology SaaS Platform - Main Server Entry Point
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { csrfMiddleware } from './middleware/csrf';
import { connectRedis, disconnectRedis, isRedisConnected } from './modules/shared/services/redis.service';
import { registerAllProcessors, shutdownQueues, getAllQueuesHealth } from './modules/jobs';
import { swaggerSpec } from './config/swagger';

// Import API router with versioning
import apiRouter from './api';

// config/index.ts loads dotenv — no need to call dotenv.config() here

const app: Application = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Build allowed CORS origins from env or defaults
function getAllowedOrigins(): (string | RegExp)[] {
  const origins: (string | RegExp)[] = [];
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean));
  }
  if (FRONTEND_URL && !origins.includes(FRONTEND_URL)) {
    origins.push(FRONTEND_URL);
  }
  // Always allow local development
  origins.push('http://localhost:3000', 'http://localhost:5173');
  return origins;
}

// ============================================
// Security Middleware
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ============================================
// Body Parser Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// Compression
// ============================================

app.use(compression());

// ============================================
// Static File Serving (uploads)
// ============================================

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '7d',
  immutable: true,
}));

// Trust proxy for correct IP resolution behind load balancers/reverse proxies
app.set('trust proxy', 1);

// CSRF Protection (skips safe methods and test env automatically)
app.use(csrfMiddleware);

// ============================================
// Rate Limiting
// ============================================

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development/test for E2E tests
  skip: () => process.env.NODE_ENV !== 'production',
});

app.use('/api/', limiter);

// ============================================
// API Version Middleware
// ============================================

app.use('/api/', (req, res, next) => {
  const version = req.path.match(/\/v(\d+)/)?.[1] || '1';
  res.setHeader('X-API-Version', version);

  // Add deprecation notice for v1 (optional, when v2 is ready)
  if (version === '1') {
    res.setHeader('X-API-Status', 'stable');
  }

  next();
});

// ============================================
// Request Logging
// ============================================

app.use(requestLogger);

// ============================================
// Health Check (no versioning)
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    redis: isRedisConnected() ? 'connected' : 'disconnected',
    api: {
      versions: ['v1', 'v2'],
      current: 'v1',
      base: '/api'
    }
  });
});

// ============================================
// Root Route
// ============================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'AstroVerse API',
      description: 'Astrology SaaS Platform - Natal chart generation, personality analysis, and forecasting',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        charts: '/api/v1/charts',
        analysis: '/api/v1/analysis',
        transits: '/api/v1/transits',
        calendar: '/api/v1/calendar',
        lunarReturn: '/api/v1/lunar-return',
        synastry: '/api/v1/synastry',
        solarReturns: '/api/v1/solar-returns'
      }
    }
  });
});

// ============================================
// API Documentation (Swagger)
// ============================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// JSON spec endpoint for tooling
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// API Routes (Versioned)
// ============================================

app.use('/api', apiRouter);

// ============================================
// Error Handling
// ============================================

// 404 - Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

// Only start server if this file is run directly (not when imported by tests)
if (require.main === module) {
  const server = app.listen(PORT, async () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Frontend URL: ${FRONTEND_URL}`);
    logger.info(`💚 Health check: http://localhost:${PORT}/health`);

    // Connect to Redis (non-blocking — falls back gracefully)
    await connectRedis();

    // Initialize job queues and register processors
    if (isRedisConnected()) {
      registerAllProcessors();
      logger.info('📋 Job queues initialized');
    } else {
      logger.warn('📋 Skipping job queue init — Redis not available');
    }
  });

  // ============================================
  // Graceful Shutdown
  // ============================================

  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      await shutdownQueues();
      await disconnectRedis();
      logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// ============================================
// Unhandled Rejections
// ============================================

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
