/**
 * Unit Tests for Blog Controller
 * Tests blog post CRUD operations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from 'express';
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from '../../modules/blog/controllers/blog.controller';
import { blogService } from '../../modules/blog/services/blog.service';

jest.mock('../../modules/blog/services/blog.service', () => ({
  blogService: {
    createPost: jest.fn(),
    getAllPosts: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  },
}));

jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function createAuthenticatedRequest(overrides: any = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    body: overrides.body || {},
    params: overrides.params || {},
    ...overrides,
  };
}

describe('Blog Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a blog post successfully', async () => {
      const postData = {
        title: 'Test Post',
        body: 'This is a test post content.',
        is_published: true,
      };

      const mockPost = { id: 'post-1', ...postData, author_id: 'user-123', created_at: new Date() };
      (blogService.createPost as jest.Mock).mockResolvedValue(mockPost);

      const req = createAuthenticatedRequest({ body: postData });
      const res = createMockResponse();

      await createPost(req as any, res as unknown as Response);

      expect(blogService.createPost).toHaveBeenCalledWith({
        author_id: 'user-123',
        ...postData,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });

    it('should handle service errors', async () => {
      (blogService.createPost as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = createAuthenticatedRequest({ body: { title: 'Test', body: 'Content' } });
      const res = createMockResponse();

      await expect(createPost(req as any, res as unknown as Response)).rejects.toThrow('Database error');
    });
  });

  describe('getAllPosts', () => {
    it('should return all published posts', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Post 1', is_published: true },
        { id: 'post-2', title: 'Post 2', is_published: true },
      ];

      (blogService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      const req = createAuthenticatedRequest();
      const res = createMockResponse();

      await getAllPosts(req as any, res as unknown as Response);

      expect(blogService.getAllPosts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });
  });

  describe('getPostById', () => {
    it('should return a single post', async () => {
      const mockPost = { id: 'post-1', title: 'Test Post', body: 'Content' };
      (blogService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      const req = createAuthenticatedRequest({ params: { id: 'post-1' } });
      const res = createMockResponse();

      await getPostById(req as any, res as unknown as Response);

      expect(blogService.getPostById).toHaveBeenCalledWith('post-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });
  });

  describe('updatePost', () => {
    it('should update a blog post', async () => {
      const updateData = { title: 'Updated Title', body: 'Updated content' };
      const mockPost = { id: 'post-1', ...updateData };

      (blogService.updatePost as jest.Mock).mockResolvedValue(mockPost);

      const req = createAuthenticatedRequest({ params: { id: 'post-1' }, body: updateData });
      const res = createMockResponse();

      await updatePost(req as any, res as unknown as Response);

      expect(blogService.updatePost).toHaveBeenCalledWith('post-1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPost,
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a blog post', async () => {
      (blogService.deletePost as jest.Mock).mockResolvedValue(undefined);

      const req = createAuthenticatedRequest({ params: { id: 'post-1' } });
      const res = createMockResponse();

      await deletePost(req as any, res as unknown as Response);

      expect(blogService.deletePost).toHaveBeenCalledWith('post-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Post deleted successfully',
      });
    });
  });
});
