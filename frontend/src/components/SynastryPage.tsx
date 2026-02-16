/**
 * Synastry Page Component
 * Main page for synastry/compatibility feature
 */

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (view === 'history') {
      loadReports();
    }
  }, [view, page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSynastryReports(page, 10);
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteSynastryReport(id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await updateSynastryReport(id, { isFavorite: !isFavorite });
      setReports(
        reports.map((r) => (r.id === id ? { ...r, isFavorite: !isFavorite } : r))
      );
    } catch (err: any) {
      console.error('Error updating favorite:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChartName = (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    return chart?.name || chartId;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'challenging';
  };

  return (
    <div className="synastry-page">
      {/* Header */}
      <div className="page-header">
        <h1>Synastry & Compatibility</h1>
        <p>Compare two charts to discover relationship dynamics and compatibility</p>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-button ${view === 'calculator' ? 'active' : ''}`}
          onClick={() => {
            setView('calculator');
            setPage(1);
          }}
        >
          Calculator
        </button>
        <button
          className={`toggle-button ${view === 'history' ? 'active' : ''}`}
          onClick={() => {
            setView('history');
            setPage(1);
          }}
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
                onClick={() => setView('calculator')}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <>
              <div className="reports-list">
                {reports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <div className="charts-info">
                        <h3>
                          {getChartName(report.chart1Id)} + {getChartName(report.chart2Id)}
                        </h3>
                        <span className="report-date">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className={`score-badge ${getScoreColor(report.overallCompatibility)}`}>
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
                        onClick={() => handleToggleFavorite(report.id, report.isFavorite || false)}
                        title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {report.isFavorite ? '★' : '☆'}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete report"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="pagination-button"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
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
