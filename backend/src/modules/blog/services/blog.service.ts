/**
 * Blog Post Service
 * Handles CRUD operations and image storage for blog posts.
 */

import * as fs from 'fs';
import * as path from 'path';
import logger from '../../../utils/logger';
import blogModel from '../models/blog.model';
import type { BlogPost, CreateBlogPostData, UpdateBlogPostData } from '../models/blog.model';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'blog');

function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export class BlogService {
  async createPost(data: CreateBlogPostData): Promise<BlogPost> {
    const post = await blogModel.create(data);
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
    const post = await blogModel.update(id, data);
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
    ensureUploadsDir();

    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      throw new Error('Invalid image format. Allowed: jpg, jpeg, png, webp');
    }

    const filename = `${postId}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, file.buffer);

    const imageUrl = `/uploads/blog/${filename}`;
    await blogModel.updateImageUrl(postId, imageUrl);

    logger.info('Blog image saved', { postId, imageUrl });
    return imageUrl;
  }
}

export const blogService = new BlogService();
export default BlogService;
