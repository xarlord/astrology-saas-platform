/**
 * Blog Controller
 * Handles blog post API endpoints.
 */

import type { Response } from 'express';
import multer from 'multer';
import type { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { asyncHandler } from '../../../middleware/errorHandler';
import { blogService } from '../services/blog.service';

/**
 * Multer config for blog image uploads (in-memory storage).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: jpg, png, webp'));
    }
  },
});

export { upload };

/**
 * @route   POST /api/v1/blog
 * @desc    Create a new blog post (admin only)
 * @access  Private (admin)
 */
export const createPost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, body, is_published } = req.body;

    const post = await blogService.createPost({
      author_id: req.user.id,
      title,
      body,
      is_published: is_published !== false,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  },
);

/**
 * @route   GET /api/v1/blog
 * @desc    Get published blog posts (public)
 * @access  Public
 */
export const getPosts = asyncHandler(async (req, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  const { posts, total } = await blogService.getPublishedPosts(limit, offset);

  res.status(200).json({
    success: true,
    data: { posts, total, limit, offset },
  });
});

/**
 * @route   GET /api/v1/blog/:id
 * @desc    Get a single blog post (public if published)
 * @access  Public
 */
export const getPost = asyncHandler(async (req, res: Response) => {
  const post = await blogService.getPostById(req.params.id);

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

/**
 * @route   PUT /api/v1/blog/:id
 * @desc    Update a blog post (admin only)
 * @access  Private (admin)
 */
export const updatePost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, body, is_published, image_url } = req.body;

    const post = await blogService.updatePost(req.params.id, {
      title,
      body,
      is_published,
      image_url,
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  },
);

/**
 * @route   DELETE /api/v1/blog/:id
 * @desc    Delete a blog post (admin only)
 * @access  Private (admin)
 */
export const deletePost = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const deleted = await blogService.deletePost(req.params.id);

    if (!deleted) {
      throw new AppError('Blog post not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { deleted: true },
    });
  },
);

/**
 * @route   POST /api/v1/blog/:id/image
 * @desc    Upload an image for a blog post (admin only)
 * @access  Private (admin)
 */
export const uploadImage = [
  upload.single('image'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    // Verify post exists
    const post = await blogService.getPostById(req.params.id);
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const imageUrl = await blogService.saveImage(req.params.id, {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    res.status(200).json({
      success: true,
      data: { image_url: imageUrl },
    });
  }),
];
