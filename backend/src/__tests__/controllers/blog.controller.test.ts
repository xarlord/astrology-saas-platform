/**
 * Blog Controller Unit Tests
 *
 * blog.controller.ts exports handlers wrapped in asyncHandler(), i.e. they are
 * middleware-style functions with signature (req, res, next). On success they
 * write to res; on error they throw, and asyncHandler forwards the thrown
 * error to next(). So tests call the handler with a mock next and assert:
 *   - success: res.status/res.json called, next NOT called
 *   - error:   next called with an AppError
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Response, NextFunction } from 'express';
import { AppError } from '../../utils/appError';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from '../../modules/blog/controllers/blog.controller';

// blog.service exports a class instance: `export const blogService = new BlogService()`
const mockBlogService: Record<string, jest.Mock> = {};

jest.mock('../../modules/blog/services/blog.service', () => ({
  __esModule: true,
  blogService: new Proxy(
    {},
    {
      get: (_t, prop) => mockBlogService[prop as string],
    },
  ),
}));

// blog.controller imports multer — avoid touching the filesystem in unit tests.
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (_req: any, _res: any, next: NextFunction) => next(),
  });
  (multer as any).memoryStorage = () => ({});
  return { __esModule: true, default: multer };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-123', email: 'admin@example.com', role: 'admin' };

const mockPost = {
  id: 'post-123',
  title: 'Understanding Mercury Retrograde',
  body: 'Mercury retrograde is a time for reflection...',
  author_id: mockUser.id,
  is_published: true,
  created_at: '2026-06-29T00:00:00Z',
  updated_at: '2026-06-29T00:00:00Z',
};

const mockPosts = [mockPost, { ...mockPost, id: 'post-456', title: 'New Moon in Cancer' }];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
}

function buildReq(overrides: any = {}): any {
  return {
    user: mockUser,
    body: {},
    params: {},
    query: {},
    file: undefined,
    method: 'POST',
    path: '/api/v1/blog',
    ...overrides,
  };
}

describe('Blog Controller', () => {
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();

    // Register fresh mocks for every service method the controller uses.
    for (const m of [
      'createPost',
      'getPublishedPosts',
      'getPostById',
      'updatePost',
      'deletePost',
      'saveImage',
      'getAllPosts',
    ]) {
      mockBlogService[m] = jest.fn();
    }
  });

  // -------------------------------------------------------------------------
  describe('createPost', () => {
    it('should create a blog post successfully', async () => {
      const req = buildReq({
        body: { title: 'Understanding Mercury Retrograde', body: 'Mercury retrograde...', is_published: true },
      });
      mockBlogService.createPost.mockResolvedValue(mockPost);

      await createPost(req, res, next);

      expect(mockBlogService.createPost).toHaveBeenCalledWith({
        author_id: mockUser.id,
        title: 'Understanding Mercury Retrograde',
        body: 'Mercury retrograde...',
        is_published: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPost });
      expect(next).not.toHaveBeenCalled();
    });

    it('should default is_published to true when not provided', async () => {
      const req = buildReq({ body: { title: 'Test Post', body: 'Test body' } });
      mockBlogService.createPost.mockResolvedValue(mockPost);

      await createPost(req, res, next);

      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ is_published: true }),
      );
    });

    it('should default is_published to true when explicitly false (preserves false)', async () => {
      // is_published !== false -> true; false stays false.
      const req = buildReq({ body: { title: 'Draft', body: 'Draft body', is_published: false } });
      const draftPost = { ...mockPost, is_published: false };
      mockBlogService.createPost.mockResolvedValue(draftPost);

      await createPost(req, res, next);

      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ is_published: false }),
      );
    });

    it('should forward service errors to next()', async () => {
      const req = buildReq({ body: { title: 'Test', body: 'Body' } });
      mockBlogService.createPost.mockRejectedValue(new Error('Database error'));

      await createPost(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      // asyncHandler wraps non-AppError errors with request context message
      expect(err).toBeInstanceOf(Error);
      expect(String(err.message)).toMatch(/Database error/);
    });
  });

  // -------------------------------------------------------------------------
  describe('getPosts', () => {
    it('should get published posts with default pagination', async () => {
      const req = buildReq({ query: {} });
      mockBlogService.getPublishedPosts.mockResolvedValue({ posts: mockPosts, total: 2 });

      await getPosts(req, res, next);

      expect(mockBlogService.getPublishedPosts).toHaveBeenCalledWith(20, 0);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { posts: mockPosts, total: 2, limit: 20, offset: 0 },
      });
    });

    it('should handle custom pagination parameters', async () => {
      const req = buildReq({ query: { limit: '10', offset: '20' } });
      mockBlogService.getPublishedPosts.mockResolvedValue({ posts: mockPosts.slice(0, 1), total: 2 });

      await getPosts(req, res, next);

      expect(mockBlogService.getPublishedPosts).toHaveBeenCalledWith(10, 20);
    });

    it('should enforce maximum limit of 50', async () => {
      const req = buildReq({ query: { limit: '100', offset: '0' } });
      mockBlogService.getPublishedPosts.mockResolvedValue({ posts: [], total: 0 });

      await getPosts(req, res, next);

      expect(mockBlogService.getPublishedPosts).toHaveBeenCalledWith(50, 0);
    });
  });

  // -------------------------------------------------------------------------
  describe('getPost', () => {
    it('should get a post by id', async () => {
      const req = buildReq({ params: { id: 'post-123' } });
      mockBlogService.getPostById.mockResolvedValue(mockPost);

      await getPost(req, res, next);

      expect(mockBlogService.getPostById).toHaveBeenCalledWith('post-123');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockPost });
    });

    it('should call next() with AppError 404 for non-existent posts', async () => {
      const req = buildReq({ params: { id: 'nonexistent' } });
      mockBlogService.getPostById.mockResolvedValue(null);

      await getPost(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
      expect(err.message).toMatch(/not found/i);
    });
  });

  // -------------------------------------------------------------------------
  describe('updatePost', () => {
    it('should update a blog post successfully', async () => {
      const req = buildReq({
        params: { id: 'post-123' },
        body: { title: 'Updated', body: 'Updated content', is_published: true },
      });
      const updatedPost = { ...mockPost, title: 'Updated' };
      mockBlogService.updatePost.mockResolvedValue(updatedPost);

      await updatePost(req, res, next);

      expect(mockBlogService.updatePost).toHaveBeenCalledWith('post-123', {
        title: 'Updated',
        body: 'Updated content',
        is_published: true,
        image_url: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedPost });
    });

    it('should update post with image_url', async () => {
      const req = buildReq({
        params: { id: 'post-123' },
        body: { image_url: 'https://cdn.example.com/image.jpg' },
      });
      const updatedPost = { ...mockPost, image_url: 'https://cdn.example.com/image.jpg' };
      mockBlogService.updatePost.mockResolvedValue(updatedPost);

      await updatePost(req, res, next);

      expect(mockBlogService.updatePost).toHaveBeenCalledWith('post-123', {
        title: undefined,
        body: undefined,
        is_published: undefined,
        image_url: 'https://cdn.example.com/image.jpg',
      });
    });

    it('should call next() with AppError 404 when updating non-existent posts', async () => {
      const req = buildReq({ params: { id: 'nonexistent' }, body: { title: 'Test' } });
      mockBlogService.updatePost.mockResolvedValue(null);

      await updatePost(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  describe('deletePost', () => {
    it('should delete a blog post successfully', async () => {
      const req = buildReq({ params: { id: 'post-123' } });
      mockBlogService.deletePost.mockResolvedValue(true);

      await deletePost(req, res, next);

      expect(mockBlogService.deletePost).toHaveBeenCalledWith('post-123');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { deleted: true } });
    });

    it('should call next() with AppError 404 when deleting non-existent posts', async () => {
      const req = buildReq({ params: { id: 'nonexistent' } });
      mockBlogService.deletePost.mockResolvedValue(false);

      await deletePost(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  describe('AuthenticatedRequest type safety', () => {
    it('should pass user.id as author_id from AuthenticatedRequest', async () => {
      const req = buildReq({ body: { title: 'Test', body: 'Body' } });
      mockBlogService.createPost.mockResolvedValue(mockPost);

      await createPost(req, res, next);

      expect(mockBlogService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ author_id: mockUser.id }),
      );
    });
  });
});
