/**
 * Blog Routes
 * Public read + admin write endpoints for blog posts.
 */

import { Router } from 'express';
import Joi from 'joi';
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

// Public routes
router.get('/', getPosts);
router.get('/:id', validateParams(uuidParamSchema), getPost);

// Admin routes
router.post(
  '/',
  requireAdmin,
  validateBody(
    Joi.object({
      title: Joi.string().min(1).max(200).required(),
      body: Joi.string().min(1).required(),
      is_published: Joi.boolean().optional(),
    }),
  ),
  createPost,
);

router.put(
  '/:id',
  requireAdmin,
  validateParams(uuidParamSchema),
  validateBody(
    Joi.object({
      title: Joi.string().min(1).max(200).optional(),
      body: Joi.string().min(1).optional(),
      is_published: Joi.boolean().optional(),
      image_url: Joi.string().max(500).allow(null).optional(),
    }),
  ),
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
