/**
 * Blog Store (Zustand)
 * Manages blog post state.
 */

import { create } from 'zustand';
import { blogService, type BlogPost } from '../services/blog.service';

interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchPosts: (limit?: number, offset?: number) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (params: {
    title: string;
    body: string;
    is_published?: boolean;
  }) => Promise<BlogPost>;
  updatePost: (
    id: string,
    params: { title?: string; body?: string; is_published?: boolean },
  ) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  uploadImage: (postId: string, file: File) => Promise<string>;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  currentPost: null,
  total: 0,
  isLoading: false,
  error: null,

  fetchPosts: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });
    try {
      const result = await blogService.getPosts(limit, offset);
      set({ posts: result.posts, total: result.total, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      set({ error: message, isLoading: false });
    }
  },

  fetchPost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const post = await blogService.getPost(id);
      set({ currentPost: post, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch post';
      set({ error: message, isLoading: false });
    }
  },

  createPost: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const post = await blogService.createPost(params);
      set((state) => ({
        posts: [post, ...state.posts],
        total: state.total + 1,
        isLoading: false,
      }));
      return post;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updatePost: async (id, params) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await blogService.updatePost(id, params);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updated : p)),
        currentPost: state.currentPost?.id === id ? updated : state.currentPost,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.deletePost(id);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  uploadImage: async (postId, file) => {
    try {
      const result = await blogService.uploadImage(postId, file);
      // Update the post in state with the new image URL
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, image_url: result.image_url } : p,
        ),
        currentPost:
          state.currentPost?.id === postId
            ? { ...state.currentPost, image_url: result.image_url }
            : state.currentPost,
      }));
      return result.image_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
