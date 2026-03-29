/**
 * Lunar History View Component
 * Displays past lunar returns
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SavedLunarReturn, getLunarReturnHistory, deleteLunarReturn } from '@/services/lunarReturn.api';
import { INTENSITY_THRESHOLDS } from '../utils/constants';
import './LunarReturn.css';

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
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Error loading history:', err);
      setError(error.response?.data?.error ?? 'Failed to load history');
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
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Error deleting lunar return:', err);
      alert(error.response?.data?.error ?? 'Failed to delete lunar return');
    } finally {
      setDeletingId(null);
    }
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= INTENSITY_THRESHOLDS.LOW_MAX) return 'low';
    if (intensity <= INTENSITY_THRESHOLDS.MEDIUM_MAX) return 'medium';
    if (intensity <= INTENSITY_THRESHOLDS.HIGH_MAX) return 'high';
    return 'extreme';
  };

  const getIntensityBadgeClasses = (intensity: number): string => {
    const color = getIntensityColor(intensity);
    switch (color) {
      case 'low': return 'bg-green-200 text-green-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'high': return 'bg-orange-200 text-orange-900';
      case 'extreme': return 'bg-red-200 text-red-900';
      default: return 'bg-white/20 text-white';
    }
  };

  const renderReturnCard = (lunarReturn: SavedLunarReturn) => (
    <div key={lunarReturn.id} className="bg-white rounded-xl shadow-sm shadow-black/10 overflow-hidden">
      <div className="flex justify-between items-start p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
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
        <p className="text-gray-600 leading-relaxed m-0">
          <strong className="text-gray-800">Emotional Focus:</strong> {lunarReturn.emotionalTheme}
        </p>

        <button
          onClick={() => { if (onSelect) onSelect(lunarReturn); }}
          type="button"
          className="px-5 py-2.5 border-none rounded-md font-semibold cursor-pointer transition-all duration-200 bg-indigo-500 text-white hover:bg-indigo-600"
        >
          View Full Details
        </button>

        <button
          onClick={() => {
            void handleDelete(lunarReturn.id);
          }}
          disabled={deletingId === lunarReturn.id}
          type="button"
          className="px-5 py-2.5 border border-gray-200 rounded-md font-semibold cursor-pointer transition-all duration-200 bg-gray-50 text-red-500 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deletingId === lunarReturn.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-gray-400 text-sm">
          Created {new Date(lunarReturn.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto p-5">
      {/* Header */}
      <div className="history-header">
        {onBack && <button onClick={() => onBack()} className="back-button">← Back</button>}
        <h2>Lunar Return History</h2>
        <p className="subtitle">Your past lunar returns and forecasts</p>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading && returns.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-lg">Loading history...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => void loadHistory()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16 px-5 bg-white rounded-xl shadow-sm shadow-black/10">
            <span className="text-6xl block mb-4">🌙</span>
            <h3 className="m-0 mb-3 text-gray-800">No Lunar Returns Yet</h3>
            <p className="text-gray-400 mb-6">
              Your lunar return history will appear here once you start tracking them.
            </p>
            <button onClick={onBack} type="button" className="px-6 py-3 bg-indigo-500 text-white border-none rounded-lg font-semibold cursor-pointer hover:bg-indigo-600 transition-colors">
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
                  className="px-4 py-2 bg-indigo-500 text-white border-none rounded-md cursor-pointer font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-600 disabled:hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-500 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  type="button"
                  className="px-4 py-2 bg-indigo-500 text-white border-none rounded-md cursor-pointer font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-600 disabled:hover:bg-gray-300 transition-colors"
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
