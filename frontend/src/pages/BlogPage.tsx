/**
 * BlogPage — public blog listing with admin CRUD.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useBlogStore } from '../stores/blogStore';
import type { BlogPost } from '../services/blog.service';

const ADMIN_EMAILS: string[] = String(import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export default function BlogPage() {
  const { user } = useAuth();
  const {
    posts,
    total,
    isLoading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    uploadImage,
    clearError,
  } = useBlogStore();

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({ title: '', body: '', is_published: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const admin = isAdmin(user?.email);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleCreate = useCallback(async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setFormError('Title and body are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const post = await createPost({
        title: formData.title,
        body: formData.body,
        is_published: formData.is_published,
      });
      if (imageFile) {
        await uploadImage(post.id, imageFile);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, imageFile, createPost, uploadImage]);

  const handleUpdate = useCallback(async () => {
    if (!editingPost) return;
    if (!formData.title.trim() || !formData.body.trim()) {
      setFormError('Title and body are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await updatePost(editingPost.id, {
        title: formData.title,
        body: formData.body,
        is_published: formData.is_published,
      });
      if (imageFile) {
        await uploadImage(editingPost.id, imageFile);
      }
      setEditingPost(null);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingPost, formData, imageFile, updatePost, uploadImage]);

  const handleDelete = useCallback(
    async (post: BlogPost) => {
      try {
        await deletePost(post.id);
        setDeleteTarget(null);
      } catch {
        // error is in store
      }
    },
    [deletePost],
  );

  function resetForm() {
    setFormData({ title: '', body: '', is_published: true });
    setImageFile(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    setFormData({ title: post.title, body: post.body, is_published: post.is_published });
    setImageFile(null);
    setShowForm(false);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
    setEditingPost(null);
  }

  function closeAll() {
    setShowForm(false);
    setEditingPost(null);
    resetForm();
    clearError();
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-cosmic-page">
      {/* Header */}
      <div className="border-b border-white/5 bg-[var(--color-bg-card-solid,#141627)]">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                ✦ AstroVerse Blog
              </h1>
              <p className="mt-2 text-slate-400 text-lg">
                Cosmic insights, astrology guides, and platform updates
              </p>
            </div>
            {admin && (
              <button type="button"
                onClick={openCreate}
                aria-label="Create new blog post"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-[#8b5cf6] hover:from-primary hover:to-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button type="button" onClick={clearError} aria-label="Dismiss error" className="ml-auto text-red-400 hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && posts.length === 0 && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600">article</span>
            <p className="mt-4 text-slate-400 text-lg">No blog posts yet.</p>
            {admin && (
              <button type="button"
                onClick={openCreate}
                aria-label="Write the first blog post"
                className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/80 transition-colors"
              >
                Write the first post
              </button>
            )}
          </div>
        )}

        {/* Blog posts grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-[var(--color-bg-card-solid,#141627)] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Image */}
              {post.image_url ? (
                <div className="aspect-video bg-cosmic-page overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-[#8b5cf6]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-primary/30">article</span>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {formatDate(post.created_at)}
                  {!post.is_published && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-[10px] font-medium">
                      Draft
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>

                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {post.body}
                </p>

                {/* Admin actions */}
                {admin && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                    <button type="button"
                      onClick={() => openEdit(post)}
                      aria-label={`Edit post: ${post.title}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                    <button type="button"
                      onClick={() => setDeleteTarget(post)}
                      aria-label={`Delete post: ${post.title}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Post count */}
        {total > 0 && (
          <p className="text-center text-sm text-slate-500 mt-8">
            Showing {posts.length} of {total} posts
          </p>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingPost) && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeAll()}
        >
          <div className="w-full max-w-2xl bg-[var(--color-bg-card-solid,#141627)] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Post' : 'New Blog Post'}
              </h2>
              <button type="button"
                onClick={closeAll}
                aria-label="Close modal"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="blog-title" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title
                </label>
                <input
                  id="blog-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Enter post title..."
                  maxLength={200}
                  className="w-full px-4 py-2.5 bg-cosmic-page border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Body */}
              <div>
                <label htmlFor="blog-body" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Body
                </label>
                <textarea
                  id="blog-body"
                  value={formData.body}
                  onChange={(e) => setFormData((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Write your blog post content..."
                  rows={10}
                  className="w-full px-4 py-2.5 bg-cosmic-page border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors resize-y"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="blog-cover-image" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Cover Image
                </label>
                {editingPost?.image_url && !imageFile && (
                  <div className="mb-3 relative">
                    <img
                      src={editingPost.image_url}
                      alt="Current cover"
                      className="w-full max-h-48 object-cover rounded-xl border border-white/5"
                    />
                  </div>
                )}
                <input
                  id="blog-cover-image"
                  ref={fileInputRef}
                  type="file"
                  aria-label="Upload blog cover image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer file:transition-colors"
                />
                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG, or WebP. Max 5MB.
                </p>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle published status"
                  aria-checked={formData.is_published}
                  onClick={() => setFormData((f) => ({ ...f, is_published: !f.is_published }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_published ? 'bg-primary' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_published ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">
                  {formData.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button type="button"
                onClick={closeAll}
                className="px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button type="button"
                onClick={() => { void (editingPost ? handleUpdate() : handleCreate()); }}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-[#8b5cf6] text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {editingPost ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="w-full max-w-md bg-[var(--color-bg-card-solid,#141627)] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-xl">
                <span className="material-symbols-outlined text-red-400">warning</span>
              </div>
              <h3 className="text-lg font-bold text-white">Delete Post</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">"{deleteTarget.title}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button type="button"
                onClick={() => void handleDelete(deleteTarget)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center pb-12">
        <Link
          to="/"
          className="text-sm text-slate-500 hover:text-primary transition-colors"
        >
          ← Back to AstroVerse
        </Link>
      </div>
    </div>
  );
}
