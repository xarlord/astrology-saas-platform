/**
 * Unit Tests for Blog Service
 * Tests CRUD operations, XSS sanitization, and image storage
 */

import * as fs from 'fs';
import { BlogService } from '../../modules/blog/services/blog.service';

// Mock the blog model — define mocks inline inside the factory
jest.mock('../../modules/blog/models/blog.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findAllPublished: jest.fn(),
    countPublished: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateImageUrl: jest.fn(),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock logger (already mocked in setup.ts but explicit here)
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Import the mocked model so we can reference the jest.fns
import blogModel from '../../modules/blog/models/blog.model';

const mockCreate = blogModel.create as jest.Mock;
const mockFindAllPublished = blogModel.findAllPublished as jest.Mock;
const mockCountPublished = blogModel.countPublished as jest.Mock;
const mockFindById = blogModel.findById as jest.Mock;
const mockFindAll = blogModel.findAll as jest.Mock;
const mockUpdate = blogModel.update as jest.Mock;
const mockSoftDelete = blogModel.softDelete as jest.Mock;
const mockUpdateImageUrl = blogModel.updateImageUrl as jest.Mock;

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

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BlogService();
  });

  // ─── CREATE POST ────────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('should create a post and sanitize the body', async () => {
      mockCreate.mockResolvedValue(mockPost);

      const result = await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test Blog Post',
        body: '<p>Hello</p><script>alert("xss")</script>',
        is_published: true,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          author_id: 'user-uuid-456',
          title: 'Test Blog Post',
          // The body should be sanitized: <script> tag stripped
          body: expect.not.stringContaining('<script>'),
        }),
      );
      expect(result).toEqual(mockPost);
    });

    it('should preserve safe HTML tags in body', async () => {
      mockCreate.mockResolvedValue(mockPost);

      const safeBody = '<h1>Title</h1><p>Paragraph</p><strong>Bold</strong><em>Italic</em><a href="https://example.com">Link</a>';
      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: safeBody,
      });

      const calledWith = mockCreate.mock.calls[0][0];
      // All safe tags should still be present
      expect(calledWith.body).toContain('<h1>');
      expect(calledWith.body).toContain('<p>');
      expect(calledWith.body).toContain('<strong>');
      expect(calledWith.body).toContain('<em>');
      expect(calledWith.body).toContain('<a href="https://example.com">');
    });

    it('should strip dangerous script tags from body', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<p>Hello</p><script>alert("xss")</script>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('<script>');
      expect(calledWith.body).not.toContain('alert');
      expect(calledWith.body).toContain('<p>Hello</p>');
    });

    it('should strip onerror and other event handlers from tags', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<img src="x" onerror="alert(1)">',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('onerror');
    });

    it('should strip javascript: URLs from links', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<a href="javascript:void(0)">Click me</a>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('javascript:');
    });

    it('should pass through title unchanged', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'My <Special> Post',
        body: '<p>Content</p>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.title).toBe('My <Special> Post');
    });
  });

  // ─── GET PUBLISHED POSTS ───────────────────────────────────────────────────

  describe('getPublishedPosts', () => {
    it('should return published posts with total count', async () => {
      const posts = [mockPost];
      mockFindAllPublished.mockResolvedValue(posts);
      mockCountPublished.mockResolvedValue(1);

      const result = await service.getPublishedPosts(20, 0);

      expect(result).toEqual({ posts, total: 1 });
      expect(mockFindAllPublished).toHaveBeenCalledWith(20, 0);
      expect(mockCountPublished).toHaveBeenCalled();
    });

    it('should use default pagination values', async () => {
      mockFindAllPublished.mockResolvedValue([]);
      mockCountPublished.mockResolvedValue(0);

      await service.getPublishedPosts();

      expect(mockFindAllPublished).toHaveBeenCalledWith(20, 0);
    });

    it('should return empty array when no posts exist', async () => {
      mockFindAllPublished.mockResolvedValue([]);
      mockCountPublished.mockResolvedValue(0);

      const result = await service.getPublishedPosts();

      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ─── GET POST BY ID ─────────────────────────────────────────────────────────

  describe('getPostById', () => {
    it('should return a post by ID', async () => {
      mockFindById.mockResolvedValue(mockPost);

      const result = await service.getPostById('post-uuid-123');

      expect(mockFindById).toHaveBeenCalledWith('post-uuid-123');
      expect(result).toEqual(mockPost);
    });

    it('should return null when post not found', async () => {
      mockFindById.mockResolvedValue(null);

      const result = await service.getPostById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  // ─── GET ALL POSTS ──────────────────────────────────────────────────────────

  describe('getAllPosts', () => {
    it('should return all posts with default pagination', async () => {
      const posts = [mockPost];
      mockFindAll.mockResolvedValue(posts);

      const result = await service.getAllPosts();

      expect(mockFindAll).toHaveBeenCalledWith(50, 0);
      expect(result).toEqual(posts);
    });

    it('should accept custom limit and offset', async () => {
      mockFindAll.mockResolvedValue([]);

      await service.getAllPosts(10, 5);

      expect(mockFindAll).toHaveBeenCalledWith(10, 5);
    });
  });

  // ─── UPDATE POST ────────────────────────────────────────────────────────────

  describe('updatePost', () => {
    it('should update a post and return the updated post', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title' };
      mockUpdate.mockResolvedValue(updatedPost);

      const result = await service.updatePost('post-uuid-123', {
        title: 'Updated Title',
      });

      expect(mockUpdate).toHaveBeenCalledWith('post-uuid-123', {
        title: 'Updated Title',
      });
      expect(result).toEqual(updatedPost);
    });

    it('should sanitize body on update when body is provided', async () => {
      mockUpdate.mockResolvedValue(mockPost);

      await service.updatePost('post-uuid-123', {
        body: '<p>Updated</p><script>evil()</script>',
      });

      // mockUpdate is called with (id, data) — data is the second arg
      const calledWithData = mockUpdate.mock.calls[0][1];
      // Body should be sanitized
      expect(calledWithData.body).not.toContain('<script>');
      expect(calledWithData.body).toContain('<p>Updated</p>');
    });

    it('should not sanitize body when body is not provided', async () => {
      mockUpdate.mockResolvedValue(mockPost);

      await service.updatePost('post-uuid-123', {
        title: 'New Title',
      });

      // mockUpdate is called with (id, data) — data is the second arg
      const calledWithData = mockUpdate.mock.calls[0][1];
      // Should just pass title through, no body key
      expect(calledWithData).toEqual({ title: 'New Title' });
    });

    it('should return null when post to update is not found', async () => {
      mockUpdate.mockResolvedValue(null);

      const result = await service.updatePost('nonexistent-id', {
        title: 'Updated Title',
      });

      expect(result).toBeNull();
    });

    it('should update is_published status', async () => {
      mockUpdate.mockResolvedValue({ ...mockPost, is_published: false });

      await service.updatePost('post-uuid-123', {
        is_published: false,
      });

      expect(mockUpdate).toHaveBeenCalledWith('post-uuid-123', {
        is_published: false,
      });
    });
  });

  // ─── DELETE POST ────────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('should soft delete a post and return true', async () => {
      mockSoftDelete.mockResolvedValue(true);

      const result = await service.deletePost('post-uuid-123');

      expect(mockSoftDelete).toHaveBeenCalledWith('post-uuid-123');
      expect(result).toBe(true);
    });

    it('should return false when post to delete is not found', async () => {
      mockSoftDelete.mockResolvedValue(false);

      const result = await service.deletePost('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  // ─── SAVE IMAGE ─────────────────────────────────────────────────────────────

  describe('saveImage', () => {
    it('should save an image and return the URL', async () => {
      mockUpdateImageUrl.mockResolvedValue(undefined);

      const result = await service.saveImage('post-uuid-123', {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      });

      expect(result).toMatch(/^\/uploads\/blog\/post-uuid-123\.jpg$/);
      expect(mockUpdateImageUrl).toHaveBeenCalledWith(
        'post-uuid-123',
        expect.stringContaining('/uploads/blog/post-uuid-123'),
      );
    });

    it('should handle .jpeg extension', async () => {
      mockUpdateImageUrl.mockResolvedValue(undefined);

      const result = await service.saveImage('post-uuid-123', {
        buffer: Buffer.from('data'),
        originalname: 'photo.jpeg',
        mimetype: 'image/jpeg',
      });

      expect(result).toContain('.jpeg');
    });

    it('should handle .png extension', async () => {
      mockUpdateImageUrl.mockResolvedValue(undefined);

      const result = await service.saveImage('post-uuid-123', {
        buffer: Buffer.from('data'),
        originalname: 'image.png',
        mimetype: 'image/png',
      });

      expect(result).toContain('.png');
    });

    it('should handle .webp extension', async () => {
      mockUpdateImageUrl.mockResolvedValue(undefined);

      const result = await service.saveImage('post-uuid-123', {
        buffer: Buffer.from('data'),
        originalname: 'image.webp',
        mimetype: 'image/webp',
      });

      expect(result).toContain('.webp');
    });

    it('should reject invalid file extensions', async () => {
      await expect(
        service.saveImage('post-uuid-123', {
          buffer: Buffer.from('data'),
          originalname: 'malicious.exe',
          mimetype: 'application/octet-stream',
        }),
      ).rejects.toThrow('Invalid image format');
    });

    it('should reject path traversal in post ID', async () => {
      await expect(
        service.saveImage('../../etc/passwd', {
          buffer: Buffer.from('data'),
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
        }),
      ).rejects.toThrow('Invalid post ID format');
    });

    it('should reject post ID with special characters', async () => {
      await expect(
        service.saveImage('post!@#$', {
          buffer: Buffer.from('data'),
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
        }),
      ).rejects.toThrow('Invalid post ID format');
    });

    it('should create uploads directory if it does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      mockUpdateImageUrl.mockResolvedValue(undefined);

      await service.saveImage('post-uuid-123', {
        buffer: Buffer.from('data'),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
      });

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  // ─── SANITIZE BODY (unit test for the sanitization behavior) ────────────────

  describe('sanitizeBody behavior', () => {
    // These tests verify the sanitization configuration through the service

    it('should strip iframe tags', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<iframe src="https://evil.com"></iframe><p>Safe content</p>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('<iframe');
      expect(calledWith.body).toContain('<p>Safe content</p>');
    });

    it('should allow table formatting tags', async () => {
      mockCreate.mockResolvedValue(mockPost);

      const tableHtml = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: tableHtml,
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).toContain('<table>');
      expect(calledWith.body).toContain('<th>');
      expect(calledWith.body).toContain('<td>');
    });

    it('should allow code blocks with class attribute', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<pre><code class="language-typescript">const x = 1;</code></pre>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).toContain('<code class="language-typescript">');
    });

    it('should strip style tags', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<style>body{display:none}</style><p>Content</p>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('<style>');
      expect(calledWith.body).toContain('<p>Content</p>');
    });

    it('should strip form and input elements', async () => {
      mockCreate.mockResolvedValue(mockPost);

      await service.createPost({
        author_id: 'user-uuid-456',
        title: 'Test',
        body: '<form action="/steal"><input type="hidden" value="token"></form><p>Content</p>',
      });

      const calledWith = mockCreate.mock.calls[0][0];
      expect(calledWith.body).not.toContain('<form');
      expect(calledWith.body).not.toContain('<input');
      expect(calledWith.body).toContain('<p>Content</p>');
    });
  });
});
