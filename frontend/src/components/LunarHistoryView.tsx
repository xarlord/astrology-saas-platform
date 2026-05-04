/**
 * Lunar History View Component
 * Displays past lunar returns
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SavedLunarReturn, getLunarReturnHistory, deleteLunarReturn } from '@/services/lunarReturn.api';

interface LunarHistoryViewProps {
  onBack?: () => void;
  onSelect?: (lunarReturn: SavedLunarReturn) => void;
}

const LunarHistoryView: React.FC<LunarHistoryViewProps> = ({ onBack, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<SavedLunarReturn[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLunarReturnHistory(page, 10);
      setReturns(response.returns);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      console.error('Error loading history:', err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lunar return?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLunarReturn(id);
      // Reload the current page
      await loadHistory();
    } catch (err: unknown) {
      console.error('Error deleting lunar return:', err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(axiosErr.response?.data?.error ?? 'Failed to delete lunar return');
    } finally {
      setDeletingId(null);
    }
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return 'low';
    if (intensity <= 6) return 'medium';
    if (intensity <= 8) return 'high';
    return 'extreme';
  };

  const getIntensityBadgeClasses = (intensity: number): string => {
    const color = getIntensityColor(intensity);
    switch (color) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'extreme': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/20 text-white';
    }
  };

  const renderReturnCard = (lunarReturn: SavedLunarReturn) => (
    <div key={lunarReturn.id} className="glass-panel rounded-2xl overflow-hidden">
      <div className="flex justify-between items-start p-5 bg-gradient-to-br from-primary to-purple-600 text-white">
        <div>
          <h4 className="m-0 mb-2 text-xl">
            {new Date(lunarReturn.returnDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h4>
          <p className="m-0 opacity-90">{lunarReturn.theme}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full font-semibold ${getIntensityBadgeClasses(lunarReturn.intensity)}`}>
          {lunarReturn.intensity}/10
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <p className="text-slate-200 leading-relaxed m-0">
          <strong className="text-white">Emotional Focus:</strong> {lunarReturn.emotionalTheme}
        </p>

        <button
          onClick={() => { if (onSelect) onSelect(lunarReturn); }}
          type="button"
          className="px-5 py-2.5 border-none rounded-md font-semibold cursor-pointer transition-all duration-200 bg-primary text-white hover:bg-primary/90"
        >
          View Full Details
        </button>

        <button
          onClick={() => { void handleDelete(lunarReturn.id); }}
          disabled={deletingId === lunarReturn.id}
          type="button"
          className="px-5 py-2.5 border border-white/15 rounded-md font-semibold cursor-pointer transition-all duration-200 bg-white/15 text-red-500 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deletingId === lunarReturn.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="px-5 py-3 bg-white/15 border-t border-white/15">
        <span className="text-slate-200 text-sm">
          Created {new Date(lunarReturn.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto p-5">
      {/* Header */}
      <div className="text-center mb-8">
        {onBack && <button onClick={onBack} type="button" className="inline-block px-4 py-2 bg-white/15 border border-white/15 rounded-md text-slate-200 cursor-pointer mb-4 text-sm hover:bg-white/15 transition-colors">&larr; Back</button>}
        <h2 className="text-3xl text-white m-0 mb-2">Lunar Return History</h2>
        <p className="text-slate-200">Your past lunar returns and forecasts</p>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading && returns.length === 0 ? (
          <div className="py-10 text-center text-slate-200 text-lg">Loading history...</div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-10 text-center text-red-400">
            <p className="mb-4">{error}</p>
            <button onClick={() => { void loadHistory(); }} type="button" className="rounded-md bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary/90 transition-colors">
              Try Again
            </button>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 px-5 glass-panel rounded-2xl">
            <span className="text-6xl block mb-4">🌙</span>
            <h3 className="m-0 mb-3 text-white">No Lunar Returns Yet</h3>
            <p className="text-slate-200 mb-6">
              Your lunar return history will appear here once you start tracking them.
            </p>
            <button onClick={onBack} type="button" className="px-6 py-3 bg-primary text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
              Calculate Your First Lunar Return
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-6">
              {returns.map((lunarReturn) => renderReturnCard(lunarReturn))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  type="button"
                  className="px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer font-semibold disabled:bg-white/15 disabled:cursor-not-allowed hover:bg-primary/90 disabled:hover:bg-white/15 transition-colors"
                >
                  Previous
                </button>
                <span className="text-slate-200 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  type="button"
                  className="px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer font-semibold disabled:bg-white/15 disabled:cursor-not-allowed hover:bg-primary/90 disabled:hover:bg-white/15 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LunarHistoryView;
