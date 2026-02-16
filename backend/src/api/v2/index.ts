/**
 * API v2 Routes
 * Next version (currently empty, for future enhancements)
 */

import { Router } from 'express';

const router = Router();

// Placeholder for v2 endpoints
// Example: router.use('/auth', authRoutesV2);

router.get('/', (req, res) => {
  res.json({
    version: 'v2',
    status: 'development',
    message: 'API v2 is under development'
  });
});

export default router;
