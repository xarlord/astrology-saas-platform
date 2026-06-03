/**
 * Blog Service
 * API client for blog post CRUD operations.
 */

import api from './api';

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  body: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  limit: number;
  offset: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? '';

export const blogService = {
  /**
   * Get published blog posts (public)
   */
  async getPosts(limit = 20, offset = 0): Promise<BlogPostsResponse> {
    const { data } = await api.get<{ success: boolean; data: BlogPostsResponse }>(
      '/v1/blog',
      { params: { limit, offset } },
    );
    return data.data;
  },

  /**
   * Get a single blog post (public)
   */
  async getPost(id: string): Promise<BlogPost> {
    const { data } = await api.get<{ success: boolean; data: BlogPost }>(
      `/v1/blog/${id}`,
    );
    return data.data;
  },

  /**
   * Create a new blog post (admin only)
   */
  async createPost(params: {
    title: string;
    body: string;
    is_published?: boolean;
  }): Promise<BlogPost> {
    const { data } = await api.post<{ success: boolean; data: BlogPost }>(
      '/v1/blog',
      params,
    );
    return data.data;
  },

  /**
   * Update a blog post (admin only)
   */
  async updatePost(
    id: string,
    params: {
      title?: string;
      body?: string;
      is_published?: boolean;
    },
  ): Promise<BlogPost> {
    const { data } = await api.put<{ success: boolean; data: BlogPost }>(
      `/v1/blog/${id}`,
      params,
    );
    return data.data;
  },

  /**
   * Delete a blog post (admin only)
   */
  async deletePost(id: string): Promise<void> {
    await api.delete(`/v1/blog/${id}`);
  },

  /**
   * Upload an image for a blog post (admin only)
   */
  async uploadImage(postId: string, file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    // Use raw axios for multipart — skip JSON content-type
    const { data } = await api.post<{ success: boolean; data: { image_url: string } }>(
      `/v1/blog/${postId}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },
};

export default blogService;
