/**
 * Lunar History View Component
 * Displays past lunar returns
 */

import React, { useState, useEffect } from 'react';
import { SavedLunarReturn, getLunarReturnHistory, deleteLunarReturn } from '@/services/lunarReturn.api';
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

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLunarReturnHistory(page, 10);
      setReturns(response.returns);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Error loading history:', err);
      setError(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lunar return?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLunarReturn(id);
      // Reload the current page
      await loadHistory();
    } catch (err: any) {
      console.error('Error deleting lunar return:', err);
      alert(err.response?.data?.error || 'Failed to delete lunar return');
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

  const renderReturnCard = (lunarReturn: SavedLunarReturn) => (
    <div key={lunarReturn.id} className="history-card">
      <div className="card-header">
        <div className="date-section">
          <h4>
            {new Date(lunarReturn.returnDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h4>
          <p className="theme">{lunarReturn.theme}</p>
        </div>
        <div className={`intensity-badge ${getIntensityColor(lunarReturn.intensity)}`}>
          {lunarReturn.intensity}/10
        </div>
      </div>

      <div className="card-body">
        <p className="emotional-theme">
          <strong>Emotional Focus:</strong> {lunarReturn.emotionalTheme}
        </p>

        <button
          onClick={() => onSelect && onSelect(lunarReturn)}
          className="view-details-button"
        >
          View Full Details
        </button>

        <button
          onClick={() => handleDelete(lunarReturn.id)}
          disabled={deletingId === lunarReturn.id}
          className="delete-button"
        >
          {deletingId === lunarReturn.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="card-footer">
        <span className="created-date">
          Created {new Date(lunarReturn.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="lunar-history-view">
      {/* Header */}
      <div className="history-header">
        {onBack && <button onClick={onBack} className="back-button">← Back</button>}
        <h2>Lunar Return History</h2>
        <p className="subtitle">Your past lunar returns and forecasts</p>
      </div>

      {/* Content */}
      <div className="history-content">
        {loading && returns.length === 0 ? (
          <div className="loading-spinner">Loading history...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadHistory} className="retry-button">
              Try Again
            </button>
          </div>
        ) : returns.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🌙</span>
            <h3>No Lunar Returns Yet</h3>
            <p>
              Your lunar return history will appear here once you start tracking them.
            </p>
            <button onClick={onBack} className="action-button">
              Calculate Your First Lunar Return
            </button>
          </div>
        ) : (
          <>
            <div className="returns-list">
              {returns.map((lunarReturn) => renderReturnCard(lunarReturn))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="pagination-button"
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
