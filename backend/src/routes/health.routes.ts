/**
 * Health Check Routes
 */

import { Router } from 'express';
import { db } from '../db';
import { isRedisConnected, getRedisClient } from '../modules/shared/services/redis.service';
import { getAllQueuesHealth, isQueueReady } from '../modules/jobs';

const router = Router();
const startTime = Date.now();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (_req, res) => {
  const uptime = Date.now() - startTime;

  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      redis: isRedisConnected() ? 'connected' : 'disconnected',
    },
  });
});

/**
 * GET /health/db
 * Database health check endpoint
 */
router.get('/db', async (_req, res) => {
  try {
    // Simple database connection check
    if (db && typeof db.raw === 'function') {
      await db.raw('SELECT 1');
    }

    res.status(200).json({
      success: true,
      data: {
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /health/redis
 * Redis health check endpoint
 */
router.get('/redis', async (_req, res) => {
  try {
    const client = getRedisClient();
    if (!client) {
      res.status(503).json({
        success: false,
        data: {
          redis: 'not_configured',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;

    res.status(200).json({
      success: true,
      data: {
        redis: 'connected',
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        redis: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

/**
 * GET /health/queues
 * Job queue health check endpoint
 */
router.get('/queues', async (_req, res) => {
  try {
    if (!isQueueReady()) {
      res.status(503).json({
        success: false,
        data: {
          queues: 'not_initialized',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const health = await getAllQueuesHealth();

    res.status(200).json({
      success: true,
      data: {
        queues: health,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        queues: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

export { router as healthRoutes };
