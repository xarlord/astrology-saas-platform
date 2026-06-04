/**
 * Blog Routes
 * Public read + admin write endpoints for blog posts.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAdmin } from '../../../middleware/admin';
import { validateBody, validateParams, uuidParamSchema } from '../../../utils/validators';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  uploadImage,
} from '../controllers/blog.controller';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  is_published: z.boolean().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  is_published: z.boolean().optional(),
  image_url: z.string().max(500).nullable().optional(),
});

// Rate limiter for blog public GET routes
const blogReadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests to blog endpoints, please try again later.',
});

// Public routes
router.get('/', blogReadRateLimiter, getPosts);
router.get('/:id', blogReadRateLimiter, validateParams(uuidParamSchema), getPost);

// Admin routes
router.post(
  '/',
  requireAdmin,
  validateBody(createPostSchema),
  createPost,
);

router.put(
  '/:id',
  requireAdmin,
  validateParams(uuidParamSchema),
  validateBody(updatePostSchema),
  updatePost,
);

router.delete(
  '/:id',
  requireAdmin,
  validateParams(uuidParamSchema),
  deletePost,
);

router.post(
  '/:id/image',
  requireAdmin,
  validateParams(uuidParamSchema),
  uploadImage,
);

export const blogRoutes = router;
