/**
 * Health Check Routes
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
