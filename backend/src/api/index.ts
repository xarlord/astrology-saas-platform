/**
 * API Version Router
 * Routes requests to appropriate API version
 */

import { Router, Request, Response } from 'express';
import v1Router from './v1';
import v2Router from './v2';

const router = Router();

// API version metadata endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'MoonCalender API',
    versions: ['v1', 'v2'],
    current: 'v1',
    documentation: '/api/docs'
  });
});

// Route to specific API versions
router.use('/v1', v1Router);
router.use('/v2', v2Router);

// Default to v1 if no version specified
router.use('/', v1Router);

export default router;
