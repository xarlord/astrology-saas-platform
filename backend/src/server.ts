/**
 * Astrology SaaS Platform - Main Server Entry Point
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { csrfMiddleware } from './middleware/csrf';
import { sentry } from './config/monitoring';

// Import API router with versioning
import apiRouter from './api';

// config/index.ts loads dotenv — no need to call dotenv.config() here

const app: Application = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const STRIPE_CSP = {
  scriptSrc: ['https://js.stripe.com'],
  frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
  connectSrc: ['https://api.stripe.com'],
  imgSrc: ['https://*.stripe.com'],
};

// ============================================
// Security Middleware
// ============================================

// Trust proxy (required behind Fly.io / load balancers for rate limiting)
app.set('trust proxy', 1);

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc:
        process.env.NODE_ENV === 'development'
          ? ["'self'", "'unsafe-eval'", ...STRIPE_CSP.scriptSrc]
          : ["'self'", ...STRIPE_CSP.scriptSrc],
      imgSrc: ["'self'", "data:", "https:", ...STRIPE_CSP.imgSrc],
      connectSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        ...STRIPE_CSP.connectSrc,
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", ...STRIPE_CSP.frameSrc],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Cross-Origin Resource Sharing
const corsOrigins = [FRONTEND_URL];
if (process.env.NODE_ENV !== 'production') {
  corsOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'http://localhost:3002');
}
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ============================================
// Body Parser Middleware
// ============================================

// Preserve raw body for Stripe webhook signature verification
app.use(express.json({
  limit: '10mb',
  verify: (req: express.Request, _res: express.Response, buf: Buffer) => {
    (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// Compression
// ============================================

app.use(compression());

// CSRF Protection (skips safe methods and test env automatically)
app.use(csrfMiddleware);

// ============================================
// Rate Limiting
// ============================================

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV !== 'production' ? '5000' : '100')),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for auth endpoints and CSRF
  skip: (req) => {
    // req.path includes /v1/ prefix since limiter is mounted at /api/
    const path = req.path; // e.g. /v1/csrf-token or /v1/auth/login
    const skipSuffixes = ['/csrf-token', '/auth/login', '/auth/refresh', '/auth/logout', '/auth/me', '/auth/social', '/billing/webhook', '/monthly-transit', '/monthly-transit/by-date'];
    return skipSuffixes.some(p => path === p || path.endsWith(p) || path.startsWith('/v1' + p));
  },
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
    api: {
      versions: ['v1', 'v2'],
      current: 'v1',
      base: '/api'
    }
  });
});

// ============================================
// API Routes (Versioned)
// ============================================

app.use('/api', apiRouter);

// ============================================
// Serve Uploaded Files (blog images, card images)
// ============================================

app.use('/uploads/blog', express.static(path.join(process.cwd(), 'uploads', 'blog')));
app.use('/uploads/cards', express.static(path.join(process.cwd(), 'uploads', 'cards')));

// ============================================
// Serve Frontend Static Files (production only)
// ============================================

if (process.env.SERVE_FRONTEND === 'true') {
  const frontendDist = path.join(__dirname, '..', 'public');
  app.use(express.static(frontendDist));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ============================================
// Error Handling
// ============================================

// 404 - Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Sentry error handler (must be after all other middleware)
if (sentry.isEnabled) {
  // @sentry/node is an optional dependency — dynamic import avoids require()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void import('@sentry/node' as any).then((sentryModule: any) => {
    if (sentryModule?.setupExpressErrorHandler) {
      app.use(sentryModule.setupExpressErrorHandler());
    }
  });
}

// ============================================
// Server Startup
// ============================================

// Only start server if this file is run directly (not when imported by tests)
// Handles both CJS (require.main === module) and tsx ESM (process.argv check)
const isMainModule = (typeof require !== 'undefined' && require.main === module)
  || (typeof require !== 'undefined' && require.main === undefined && process.argv[1]?.includes('server'));
if (isMainModule) {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 Frontend URL: ${FRONTEND_URL}`);
    logger.info(`💚 Health check: http://localhost:${PORT}/health`);
  });

  // ============================================
  // Graceful Shutdown
  // ============================================

  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(() => {
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
  sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  sentry.captureException(error);
  process.exit(1);
});

export default app;
