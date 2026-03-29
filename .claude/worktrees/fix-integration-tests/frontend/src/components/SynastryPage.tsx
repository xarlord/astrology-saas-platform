/**
 * Synastry Page Component
 * Main page for synastry/compatibility feature
 */

import React, { useState, useEffect, useCallback } from 'react';
import SynastryCalculator from './SynastryCalculator';
import {
  getSynastryReports,
  deleteSynastryReport,
  updateSynastryReport,
  SynastryReport,
} from '../services/synastry.api';
import { Chart } from '../services/chart.service';
import './SynastryPage.css';

interface SynastryPageProps {
  charts: Chart[];
}

const SynastryPage: React.FC<SynastryPageProps> = ({ charts }) => {
  const [view, setView] = useState<'calculator' | 'history'>('calculator');
  const [reports, setReports] = useState<SynastryReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSynastryReports(page, 10);
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading reports:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (view === 'history') {
      void loadReports();
    }
  }, [view, page, loadReports]);

  const handleDeleteReport = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteSynastryReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  }, []);

  const handleToggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      await updateSynastryReport(id, { isFavorite: !isFavorite });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorite: !isFavorite } : r))
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  }, []);

  const handleViewChange = useCallback((newView: 'calculator' | 'history') => {
    setView(newView);
    setPage(1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage((prev) => prev - 1);
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  // Memoized helper functions
  const getChartName = useCallback((chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    return chart?.name ?? chartId;
  }, [charts]);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'challenging';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="synastry-page" data-testid="synastry-page">
      {/* Header */}
      <div className="page-header">
        <h1>Synastry & Compatibility</h1>
        <p>Compare two charts to discover relationship dynamics and compatibility</p>
      </div>

      {/* View Toggle */}
      <div className="view-toggle" data-testid="synastry-view-toggle">
        <button
          className={`toggle-button ${view === 'calculator' ? 'active' : ''}`}
          onClick={() => handleViewChange('calculator')}
          data-testid="synastry-view-calculator"
        >
          Calculator
        </button>
        <button
          className={`toggle-button ${view === 'history' ? 'active' : ''}`}
          onClick={() => handleViewChange('history')}
          data-testid="synastry-view-history"
        >
          Saved Reports
        </button>
      </div>

      {/* Calculator View */}
      {view === 'calculator' && <SynastryCalculator charts={charts} />}

      {/* History View */}
      {view === 'history' && (
        <div className="history-view">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading reports...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <h3>No saved reports yet</h3>
              <p>Compare two charts to save your first compatibility report</p>
              <button
                className="primary-button"
                onClick={() => handleViewChange('calculator')}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <>
              <div className="reports-list" data-testid="synastry-reports-list">
                {reports.map((report) => (
                  <div key={report.id} className="report-card" data-testid={`synastry-report-${report.id}`}>
                    <div className="report-header">
                      <div className="charts-info">
                        <h3 data-testid={`report-charts-${report.id}`}>
                          {getChartName(report.chart1Id)} + {getChartName(report.chart2Id)}
                        </h3>
                        <span className="report-date">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className={`score-badge ${getScoreColor(report.overallCompatibility)}`} data-testid={`report-score-${report.id}`}>
                        {report.overallCompatibility}/10
                      </div>
                    </div>

                    <div className="report-body">
                      <p className="theme">{report.relationshipTheme}</p>

                      <div className="report-highlights">
                        <div className="highlight-section">
                          <h4>Strengths</h4>
                          <ul>
                            {report.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="highlight-section">
                          <h4>Challenges</h4>
                          <ul>
                            {report.challenges.slice(0, 3).map((challenge, index) => (
                              <li key={index}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {report.notes && (
                        <div className="report-notes">
                          <h4>Notes</h4>
                          <p>{report.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="report-actions">
                      <button
                        className={`favorite-button ${report.isFavorite ? 'favorited' : ''}`}
                        onClick={() => { void handleToggleFavorite(report.id, report.isFavorite ?? false); }}
                        title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        data-testid={`report-favorite-${report.id}`}
                      >
                        {report.isFavorite ? '★' : '☆'}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => { void handleDeleteReport(report.id); }}
                        title="Delete report"
                        data-testid={`report-delete-${report.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination" data-testid="synastry-pagination">
                  <button
                    className="pagination-button"
                    disabled={page === 1}
                    onClick={handlePrevPage}
                    data-testid="pagination-prev"
                  >
                    Previous
                  </button>
                  <span className="pagination-info" data-testid="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="pagination-button"
                    disabled={page === totalPages}
                    onClick={handleNextPage}
                    data-testid="pagination-next"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SynastryPage;
