/**
 * ShareManagement Component
 * UI for managing shared chart links
 */

import React, { useState, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
  const modalRef = useFocusTrap<HTMLDivElement>({ active: showCreateModal });

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
    <div className="glass-card rounded-xl p-6 border border-cosmic-border-subtle">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-cosmic-border-subtle sm:flex-row flex-col sm:items-start gap-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }} aria-hidden="true">share</span>
          <div>
            <h3 className="text-lg font-semibold m-0">Share Chart</h3>
            <p className="text-sm text-slate-200 mt-1">{chartName}</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new share link"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">share</span>
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
                className={`flex justify-between items-center p-4 bg-white/[0.03] rounded-lg border border-white/[0.08] transition-colors hover:border-primary/30 sm:flex-row flex-col sm:items-start gap-4 ${expired ? 'opacity-60' : ''}`}
                role="listitem"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="font-mono text-sm bg-black/30 py-1 px-2 rounded">{link.shareToken.slice(0, 8)}...{link.shareToken.slice(-4)}</code>
                    {link.hasPassword && (
                      <span className="inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded bg-primary/20 text-primary" title="Password protected">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">lock</span>
                        Protected
                      </span>
                    )}
                    {expired && (
                      <span className="inline-flex items-center gap-1 text-xs py-0.5 px-2 rounded bg-red-500/20 text-red-400">Expired</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-200 sm:flex-row flex-col sm:gap-4 gap-2">
                    <span className="inline-flex items-center gap-1" title="Access count">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">bar_chart</span>
                      {link.accessCount} views
                    </span>
                    {link.expiresAt && (
                      <span className="inline-flex items-center gap-1" title="Expires">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">schedule</span>
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
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 min-h-[44px] text-xs font-medium rounded-md border-none cursor-pointer transition-all bg-white/15 text-white hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                    onClick={() => { void copyToClipboard(link.shareToken); }}
                    aria-label={`Copy share link ${copiedToken === link.shareToken ? '(copied!)' : ''}`}
                  >
                    {copiedToken === link.shareToken ? (
                      <>Copied!</>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">content_copy</span>
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
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">delete</span>
                    Revoke
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center p-8 text-slate-200">
          <span className="material-symbols-outlined opacity-30 mb-4" style={{ fontSize: '32px' }} aria-hidden="true">share</span>
          <p className="m-0">No share links created yet</p>
          <p className="m-0 text-sm mt-2">Create a link to share this chart with others</p>
        </div>
      )}

      {/* Create Share Modal */}
      {showCreateModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowCreateModal(false); }}
        >
          <div className="glass-card rounded-xl w-full max-w-[400px] border border-cosmic-border-subtle">
            <div className="flex justify-between items-center px-6 py-4 border-b border-cosmic-border-subtle">
              <h3 id="modal-title" className="m-0 text-lg">Create Share Link</h3>
              <button
                className="bg-transparent border-none text-slate-200 text-2xl cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center leading-none hover:text-white"
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
                    className="w-full py-3 pr-10 pl-3 bg-white/15 border border-white/15 rounded-md text-white text-sm transition-colors focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white"
                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.new ? <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>visibility_off</span> : <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>visibility</span>}
                  </button>
                </div>
                <span className="block mt-1 text-xs text-slate-200">Password protects access to the shared chart</span>
              </div>
              <div className="mb-5 last:mb-0">
                <label htmlFor="share-expiry" className="block mb-2 text-sm font-medium">Link expires after</label>
                <select
                  id="share-expiry"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full py-3 px-3 bg-white/15 border border-white/15 rounded-md text-white text-sm transition-colors focus:outline-none focus:border-primary"
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-cosmic-border-subtle">
              <button
                className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-white/15 text-white hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md border-none cursor-pointer transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
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
