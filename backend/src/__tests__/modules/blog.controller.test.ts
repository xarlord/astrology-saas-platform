/**
 * Unit Tests for Blog Controller
 * Tests CRUD operations, image upload, and XSS sanitization for blog posts
 */

import { Response, NextFunction } from 'express';
import { blogService } from '../../modules/blog/services/blog.service';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  uploadImage,
} from '../../modules/blog/controllers/blog.controller';
import { AppError } from '../../utils/appError';

// Mock the blog service — define mocks inline inside the factory
jest.mock('../../modules/blog/services/blog.service', () => ({
  blogService: {
    createPost: jest.fn(),
    getPublishedPosts: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    saveImage: jest.fn(),
  },
}));

// Mock logger (already mocked in setup.ts but explicit here)
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock multer to avoid file system issues
jest.mock('multer', () => {
  const multerFn = jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => next()),
  }));
  (multerFn as any).memoryStorage = jest.fn(() => ({}));
  return multerFn;
});

const mockPost = {
  id: 'post-uuid-123',
  author_id: 'user-uuid-456',
  title: 'Test Blog Post',
  body: '<p>This is a test post body.</p>',
  image_url: null,
  is_published: true,
  created_at: new Date(),
  updated_at: new Date(),
};

interface AuthenticatedRequest {
  user: { id: string; email: string };
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string>;
  file?: { buffer: Buffer; originalname: string; mimetype: string };
  get: jest.Mock;
}

describe('Blog Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  // Typed references to the mocked service methods
  const mockCreatePost = blogService.createPost as jest.Mock;
  const mockGetPublishedPosts = blogService.getPublishedPosts as jest.Mock;
  const mockGetPostById = blogService.getPostById as jest.Mock;
  const mockUpdatePost = blogService.updatePost as jest.Mock;
  const mockDeletePost = blogService.deletePost as jest.Mock;
  const mockSaveImage = blogService.saveImage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: { id: 'user-uuid-456', email: 'admin@example.com' },
      body: {},
      params: {},
      query: {},
      get: jest.fn().mockReturnValue('test-agent'),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  // Helper: call an asyncHandler-wrapped controller directly.
  async function callHandler(
    handler: (req: any, res: any, next: any) => Promise<any>,
    req: any,
    res: any,
    next: any,
  ) {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  }

  // ─── CREATE POST ────────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('should create a new blog post successfully', async () => {
      mockRequest!.body = {
        title: 'Test Blog Post',
        body: '<p>This is a test post body.</p>',
        is_published: true,
      };

      mockCreatePost.mockResolvedValue(mockPost);

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      expect(mockCreatePost).toHaveBeenCalledWith({
        author_id: 'user-uuid-456',
        title: 'Test Blog Post',
        body: '<p>This is a test post body.</p>',
        is_published: true,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should default is_published to true when not specified', async () => {
      mockRequest!.body = {
        title: 'Test Blog Post',
        body: '<p>Some content</p>',
      };

      mockCreatePost.mockResolvedValue(mockPost);

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ is_published: true }),
      );
    });

    it('should set is_published to false when explicitly false', async () => {
      mockRequest!.body = {
        title: 'Draft Post',
        body: '<p>Draft content</p>',
        is_published: false,
      };

      mockCreatePost.mockResolvedValue({ ...mockPost, is_published: false });

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ is_published: false }),
      );
    });

    it('should use req.user.id as author_id', async () => {
      mockRequest!.body = {
        title: 'Test Blog Post',
        body: '<p>Content</p>',
      };

      mockCreatePost.mockResolvedValue(mockPost);

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ author_id: 'user-uuid-456' }),
      );
    });

    it('should propagate AppError if service throws', async () => {
      mockRequest!.body = {
        title: 'Test Blog Post',
        body: '<p>Content</p>',
      };

      mockCreatePost.mockRejectedValue(new AppError('Title is required', 400));

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  // ─── GET POSTS ──────────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('should return published posts with default pagination', async () => {
      const posts = [mockPost];
      mockGetPublishedPosts.mockResolvedValue({ posts, total: 1 });

      await callHandler(getPosts, mockRequest, mockResponse, mockNext);

      expect(mockGetPublishedPosts).toHaveBeenCalledWith(20, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { posts, total: 1, limit: 20, offset: 0 },
      });
    });

    it('should respect custom limit and offset', async () => {
      mockRequest!.query = { limit: '10', offset: '5' };
      mockGetPublishedPosts.mockResolvedValue({ posts: [], total: 0 });

      await callHandler(getPosts, mockRequest, mockResponse, mockNext);

      expect(mockGetPublishedPosts).toHaveBeenCalledWith(10, 5);
    });

    it('should cap limit at 50', async () => {
      mockRequest!.query = { limit: '100' };
      mockGetPublishedPosts.mockResolvedValue({ posts: [], total: 0 });

      await callHandler(getPosts, mockRequest, mockResponse, mockNext);

      expect(mockGetPublishedPosts).toHaveBeenCalledWith(50, 0);
    });

    it('should default to limit=20 and offset=0 when query params are missing', async () => {
      mockRequest!.query = {};
      mockGetPublishedPosts.mockResolvedValue({ posts: [], total: 0 });

      await callHandler(getPosts, mockRequest, mockResponse, mockNext);

      expect(mockGetPublishedPosts).toHaveBeenCalledWith(20, 0);
    });

    it('should handle NaN values gracefully by defaulting', async () => {
      mockRequest!.query = { limit: 'abc', offset: 'xyz' };
      mockGetPublishedPosts.mockResolvedValue({ posts: [], total: 0 });

      await callHandler(getPosts, mockRequest, mockResponse, mockNext);

      expect(mockGetPublishedPosts).toHaveBeenCalledWith(20, 0);
    });
  });

  // ─── GET SINGLE POST ───────────────────────────────────────────────────────

  describe('getPost', () => {
    it('should return a single post by ID', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockGetPostById.mockResolvedValue(mockPost);

      await callHandler(getPost, mockRequest, mockResponse, mockNext);

      expect(mockGetPostById).toHaveBeenCalledWith('post-uuid-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });

    it('should throw 404 if post not found', async () => {
      mockRequest!.params = { id: 'nonexistent-id' };
      mockGetPostById.mockResolvedValue(null);

      await callHandler(getPost, mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Blog post not found');
    });
  });

  // ─── UPDATE POST ────────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.body = { title: 'Updated Title' };
      mockUpdatePost.mockResolvedValue(updatedPost);

      await callHandler(updatePost, mockRequest, mockResponse, mockNext);

      expect(mockUpdatePost).toHaveBeenCalledWith('post-uuid-123', {
        title: 'Updated Title',
        body: undefined,
        is_published: undefined,
        image_url: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPost,
      });
    });

    it('should update body and is_published', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.body = { body: '<p>New body</p>', is_published: false };
      mockUpdatePost.mockResolvedValue(mockPost);

      await callHandler(updatePost, mockRequest, mockResponse, mockNext);

      expect(mockUpdatePost).toHaveBeenCalledWith(
        'post-uuid-123',
        expect.objectContaining({ body: '<p>New body</p>', is_published: false }),
      );
    });

    it('should throw 404 if post to update is not found', async () => {
      mockRequest!.params = { id: 'nonexistent-id' };
      mockRequest!.body = { title: 'Updated Title' };
      mockUpdatePost.mockResolvedValue(null);

      await callHandler(updatePost, mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Blog post not found');
    });

    it('should pass through image_url in update data', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.body = { image_url: '/uploads/blog/new-image.jpg' };
      mockUpdatePost.mockResolvedValue(mockPost);

      await callHandler(updatePost, mockRequest, mockResponse, mockNext);

      expect(mockUpdatePost).toHaveBeenCalledWith(
        'post-uuid-123',
        expect.objectContaining({ image_url: '/uploads/blog/new-image.jpg' }),
      );
    });
  });

  // ─── DELETE POST ────────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockDeletePost.mockResolvedValue(true);

      await callHandler(deletePost, mockRequest, mockResponse, mockNext);

      expect(mockDeletePost).toHaveBeenCalledWith('post-uuid-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { deleted: true },
      });
    });

    it('should throw 404 if post to delete is not found', async () => {
      mockRequest!.params = { id: 'nonexistent-id' };
      mockDeletePost.mockResolvedValue(false);

      await callHandler(deletePost, mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Blog post not found');
    });
  });

  // ─── IMAGE UPLOAD ───────────────────────────────────────────────────────────

  describe('uploadImage (controller logic)', () => {
    // The uploadImage export is [upload.single('image'), asyncHandler(...)].
    // We test the asyncHandler part (index 1) directly to isolate controller logic.
    const getHandler = () => (uploadImage as unknown as any[])[1];

    it('should return 400 if no file is provided', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.file = undefined;

      await callHandler(getHandler(), mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('No image file provided');
    });

    it('should return 404 if post does not exist', async () => {
      mockRequest!.params = { id: 'nonexistent-id' };
      mockRequest!.file = {
        buffer: Buffer.from('fake-image'),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      };

      mockGetPostById.mockResolvedValue(null);

      await callHandler(getHandler(), mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Blog post not found');
    });

    it('should upload image and return image URL', async () => {
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.file = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      };

      mockGetPostById.mockResolvedValue(mockPost);
      mockSaveImage.mockResolvedValue('/uploads/blog/post-uuid-123.jpg');

      await callHandler(getHandler(), mockRequest, mockResponse, mockNext);

      expect(mockGetPostById).toHaveBeenCalledWith('post-uuid-123');
      expect(mockSaveImage).toHaveBeenCalledWith('post-uuid-123', {
        buffer: expect.any(Buffer),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { image_url: '/uploads/blog/post-uuid-123.jpg' },
      });
    });
  });

  // ─── XSS SANITIZATION ───────────────────────────────────────────────────────

  describe('XSS sanitization (via service)', () => {
    it('should delegate XSS sanitization to the service layer on create', async () => {
      const maliciousBody =
        '<p>Hello</p><script>alert("xss")</script><img src=x onerror="alert(1)">';
      mockRequest!.body = {
        title: 'XSS Test',
        body: maliciousBody,
      };

      mockCreatePost.mockResolvedValue({
        ...mockPost,
        body: '<p>Hello</p><img src="x">',
      });

      await callHandler(createPost, mockRequest, mockResponse, mockNext);

      // The controller passes the raw body to the service which sanitizes it
      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({ body: maliciousBody }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should delegate XSS sanitization to the service layer on update', async () => {
      const maliciousBody =
        '<p>Updated</p><script>steal()</script><a href="javascript:void(0)">link</a>';
      mockRequest!.params = { id: 'post-uuid-123' };
      mockRequest!.body = { body: maliciousBody };

      mockUpdatePost.mockResolvedValue({
        ...mockPost,
        body: '<p>Updated</p><a>link</a>',
      });

      await callHandler(updatePost, mockRequest, mockResponse, mockNext);

      // The controller passes the raw body to the service which sanitizes it
      expect(mockUpdatePost).toHaveBeenCalledWith(
        'post-uuid-123',
        expect.objectContaining({ body: maliciousBody }),
      );
    });
  });
});
