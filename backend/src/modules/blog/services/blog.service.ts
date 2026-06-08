/**
 * Blog Post Service
 * Handles CRUD operations and image storage for blog posts.
 */

import * as fs from 'fs';
import * as path from 'path';
import sanitizeHtml from 'sanitize-html';
import logger from '../../../utils/logger';
import blogModel from '../models/blog.model';
import type { BlogPost, CreateBlogPostData, UpdateBlogPostData } from '../models/blog.model';
import { ensureUploadsDir } from '../../../shared/utils/fileUtils';

/**
 * Sanitize HTML body to prevent XSS while preserving safe formatting tags.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'blockquote', 'pre', 'code',
    'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u', 's',
    'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    pre: ['class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

function sanitizeBody(body: string): string {
  return sanitizeHtml(body, SANITIZE_OPTIONS);
}

export class BlogService {
  async createPost(data: CreateBlogPostData): Promise<BlogPost> {
    const sanitizedData = { ...data, body: sanitizeBody(data.body) };
    const post = await blogModel.create(sanitizedData);
    logger.info('Blog post created', { postId: post.id, authorId: data.author_id });
    return post;
  }

  async getPublishedPosts(
    limit = 20,
    offset = 0,
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const [posts, total] = await Promise.all([
      blogModel.findAllPublished(limit, offset),
      blogModel.countPublished(),
    ]);
    return { posts, total };
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    return blogModel.findById(id);
  }

  async getAllPosts(limit = 50, offset = 0): Promise<BlogPost[]> {
    return blogModel.findAll(limit, offset);
  }

  async updatePost(
    id: string,
    data: UpdateBlogPostData,
  ): Promise<BlogPost | null> {
    const sanitizedData = data.body
      ? { ...data, body: sanitizeBody(data.body) }
      : data;
    const post = await blogModel.update(id, sanitizedData);
    if (!post) {
      return null;
    }
    logger.info('Blog post updated', { postId: id });
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const deleted = await blogModel.softDelete(id);
    if (deleted) {
      logger.info('Blog post deleted', { postId: id });
    }
    return deleted;
  }

  /**
   * Save an uploaded image and return the relative URL path.
   */
  async saveImage(
    postId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<string> {
    const uploadsDir = ensureUploadsDir('blog');

    // Validate postId to prevent path traversal (e.g., "../../etc/passwd")
    if (!/^[a-zA-Z0-9_-]+$/.test(postId)) {
      throw new Error('Invalid post ID format');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      throw new Error('Invalid image format. Allowed: jpg, jpeg, png, webp');
    }

    const filename = `${postId}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Verify resolved path is still within uploadsDir
    if (!filePath.startsWith(uploadsDir)) {
      throw new Error('Invalid file path');
    }

    fs.promises.writeFile(filePath, file.buffer);

    const imageUrl = `/uploads/blog/${filename}`;
    await blogModel.updateImageUrl(postId, imageUrl);

    logger.info('Blog image saved', { postId, imageUrl });
    return imageUrl;
  }
}

export const blogService = new BlogService();
export default BlogService;
