/**
 * Health Check Routes
 */

import { Router } from 'express';
import { db } from '../db';

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

export default router;
