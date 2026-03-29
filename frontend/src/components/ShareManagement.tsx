/**
 * ShareManagement Component
 * UI for managing shared chart links
 */

import React, { useState, useCallback } from 'react';
import { Copy, Eye, EyeOff, Lock, Trash2, Share2, Clock, BarChart2 } from 'lucide-react';

interface SharedLink {
  id: string;
  shareToken: string;
  chartName: string;
  hasPassword: boolean;
  expiresAt: string | null;
  accessCount: number;
  createdAt: string;
}

interface ShareManagementProps {
  chartId: string;
  chartName: string;
  sharedLinks: SharedLink[];
  onCreateShare: (options: { password?: string; expiresIn?: number }) => Promise<void>;
  onRevokeShare: (shareId: string) => Promise<void>;
  onUpdateShare: (shareId: string, options: { password?: string }) => Promise<void>;
}

const EXPIRY_OPTIONS = [
  { label: '24 hours', value: 24 },
  { label: '7 days', value: 168 },
  { label: '30 days', value: 720 },
  { label: 'Never', value: 0 },
];

export const ShareManagement: React.FC<ShareManagementProps> = ({
  chartId: _chartId,
  chartName,
  sharedLinks,
  onCreateShare,
  onRevokeShare,
  onUpdateShare: _onUpdateShare,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState(168); // Default 7 days
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleCreateShare = useCallback(async () => {
    setIsLoading(true);
    try {
      await onCreateShare({
        password: password || undefined,
        expiresIn: expiresIn || undefined,
      });
      setShowCreateModal(false);
      setPassword('');
    } catch (error) {
      console.error('Failed to create share:', error);
    } finally {
      setIsLoading(false);
    }
  }, [password, expiresIn, onCreateShare]);

  const handleRevokeShare = useCallback(async (shareId: string) => {
    if (!window.confirm('Are you sure you want to revoke this share link? Anyone with the link will no longer be able to access this chart.')) {
      return;
    }
    setIsLoading(true);
    try {
      await onRevokeShare(shareId);
    } catch (error) {
      console.error('Failed to revoke share:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onRevokeShare]);

  const copyToClipboard = useCallback(async (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 dark:bg-black/20">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 sm:flex-row flex-col sm:items-start gap-4">
        <div className="flex items-center gap-4">
          <Share2 className="w-6 h-6 text-indigo-500" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold m-0">Share Chart</h3>
            <p className="text-sm text-white/60 mt-1">{chartName}</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new share link"
        >
          <Share2 size={16} aria-hidden="true" />
          Create Link
        </button>
      </div>

      {sharedLinks.length > 0 ? (
        <ul className="list-none p-0 m-0 flex flex-col gap-4" role="list">
          {sharedLinks.map((link) => {
            const expired = isExpired(link.expiresAt);
            return (
              <li
                key={link.id}
                className={`flex justify-between items-center p-4 bg-white/[0.03] rounded-lg border border-white/[0.08] transition-colors hover:border-indigo-500/30 sm:flex-row flex-col sm:items-start gap-4 ${expired ? 'opacity-60' : ''}`}
                role="listitem"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="font-mono text-sm bg-black/30 py-1 px-2 rounded">{link.shareToken.slice(0, 8)}...{link.shareToken.slice(-4)}</code>
                    {link.hasPassword && (
                      <span className="inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded bg-indigo-500/20 text-violet-400" title="Password protected">
                        <Lock size={12} aria-hidden="true" />
                        Protected
                      </span>
                    )}
                    {expired && (
                      <span className="inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded bg-red-500/20 text-red-400">Expired</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-white/50 sm:flex-row flex-col sm:gap-4 gap-2">
                    <span className="inline-flex items-center gap-1" title="Access count">
                      <BarChart2 size={12} aria-hidden="true" />
                      {link.accessCount} views
                    </span>
                    {link.expiresAt && (
                      <span className="inline-flex items-center gap-1" title="Expires">
                        <Clock size={12} aria-hidden="true" />
                        {expired ? 'Expired' : `Expires ${formatDate(link.expiresAt)}`}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1" title="Created">
                      Created {formatDate(link.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:w-auto w-full">
                  <button
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 min-h-[44px] text-xs font-medium rounded-md border-none cursor-pointer transition-all bg-white/10 text-white hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                    onClick={() => { void copyToClipboard(link.shareToken); }}
                    aria-label={`Copy share link ${copiedToken === link.shareToken ? '(copied!)' : ''}`}
                  >
                    {copiedToken === link.shareToken ? (
                      <>Copied!</>
                    ) : (
                      <>
                        <Copy size={14} aria-hidden="true" />
                        Copy Link
                      </>
                    )}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 min-h-[44px] text-xs font-medium rounded-md border-none cursor-pointer transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                    onClick={() => { void handleRevokeShare(link.id); }}
                    disabled={isLoading}
                    aria-label="Revoke share link"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Revoke
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center p-8 text-white/50">
          <Share2 size={32} className="opacity-30 mb-4" aria-hidden="true" />
          <p className="m-0">No share links created yet</p>
          <p className="m-0 text-sm mt-2">Create a link to share this chart with others</p>
        </div>
      )}

      {/* Create Share Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-[#1a1a2e] rounded-xl w-full max-w-[400px] border border-white/10 dark:bg-gray-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h3 id="modal-title" className="m-0 text-lg">Create Share Link</h3>
              <button
                className="bg-transparent border-none text-white/60 text-2xl cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center leading-none hover:text-white"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="mb-5 last:mb-0">
                <label htmlFor="share-password" className="block mb-2 text-sm font-medium">Password (optional)</label>
                <div className="relative">
                  <input
                    id="share-password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    autoComplete="new-password"
                    className="w-full py-3 pr-10 pl-3 bg-white/5 border border-white/15 rounded-md text-white text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-white/50 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white"
                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="block mt-1 text-xs text-white/50">Password protects access to the shared chart</span>
              </div>
              <div className="mb-5 last:mb-0">
                <label htmlFor="share-expiry" className="block mb-2 text-sm font-medium">Link expires after</label>
                <select
                  id="share-expiry"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full py-3 px-3 bg-white/5 border border-white/15 rounded-md text-white text-sm transition-colors focus:outline-none focus:border-indigo-500"
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-white/10 text-white hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => { void handleCreateShare(); }}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareManagement;
