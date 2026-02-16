/**
 * Health Check Routes
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

router.get('/db', async (req, res) => {
  // TODO: Add database connection check
  res.status(200).json({
    success: true,
    data: {
      database: 'connected',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
