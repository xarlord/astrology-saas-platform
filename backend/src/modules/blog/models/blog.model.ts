/**
 * Blog Post Model
 */

import knex from '../../../config/database';
import { AppError } from '../../../utils/appError';

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  body: string;
  image_url: string | null;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreateBlogPostData {
  author_id: string;
  title: string;
  body: string;
  image_url?: string | null;
  is_published?: boolean;
}

export interface UpdateBlogPostData {
  title?: string;
  body?: string;
  image_url?: string | null;
  is_published?: boolean;
}

class BlogModel {
  private tableName = 'blog_posts';

  async findById(id: string): Promise<BlogPost | null> {
    const post = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return post || null;
  }

  async findAllPublished(limit = 20, offset = 0): Promise<BlogPost[]> {
    return knex(this.tableName)
      .where({ is_published: true })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async countPublished(): Promise<number> {
    const result = await knex(this.tableName)
      .where({ is_published: true })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  async findAll(limit = 50, offset = 0): Promise<BlogPost[]> {
    return knex(this.tableName)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async create(data: CreateBlogPostData): Promise<BlogPost> {
    if (!data.title || data.title.trim().length === 0) {
      throw new AppError('Title is required', 400);
    }
    if (!data.body || data.body.trim().length === 0) {
      throw new AppError('Body is required', 400);
    }
    if (data.title.length > 200) {
      throw new AppError('Title must be 200 characters or less', 400);
    }

    const [post] = await knex(this.tableName)
      .insert({
        author_id: data.author_id,
        title: data.title.trim(),
        body: data.body.trim(),
        image_url: data.image_url || null,
        is_published: data.is_published !== false,
      })
      .returning('*');

    return post;
  }

  async update(id: string, data: UpdateBlogPostData): Promise<BlogPost | null> {
    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new AppError('Title cannot be empty', 400);
      }
      if (data.title.length > 200) {
        throw new AppError('Title must be 200 characters or less', 400);
      }
      updates.title = data.title.trim();
    }
    if (data.body !== undefined) {
      if (data.body.trim().length === 0) {
        throw new AppError('Body cannot be empty', 400);
      }
      updates.body = data.body.trim();
    }
    if (data.image_url !== undefined) {
      updates.image_url = data.image_url;
    }
    if (data.is_published !== undefined) {
      updates.is_published = data.is_published;
    }

    const [updated] = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update(updates)
      .returning('*');

    return updated || null;
  }

  async softDelete(id: string): Promise<boolean> {
    const count = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
    return count > 0;
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<void> {
    await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        image_url: imageUrl,
        updated_at: new Date(),
      });
  }
}

export default new BlogModel();
