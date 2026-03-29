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
    } catch (err: unknown) {
      console.error('Error loading reports:', err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (view === 'history') {
      void loadReports();
    }
  }, [view, loadReports]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteSynastryReport(id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    return chart?.name ?? chartId;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'challenging';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white m-0">Synastry & Compatibility</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Compare two charts to discover relationship dynamics and compatibility</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'calculator'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          onClick={() => {
            setView('calculator');
            setPage(1);
          }}
        >
          Calculator
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'history'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
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
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="w-[50px] h-[50px] border-4 border-gray-200 dark:border-gray-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-4" />
              <p>Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center">{error}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No saved reports yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Compare two charts to save your first compatibility report</p>
              <button
                type="button"
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                onClick={() => setView('calculator')}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex justify-between items-start p-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                          {getChartName(report.chart1Id)} + {getChartName(report.chart2Id)}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        getScoreColor(report.overallCompatibility) === 'excellent' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        getScoreColor(report.overallCompatibility) === 'good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        getScoreColor(report.overallCompatibility) === 'fair' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {report.overallCompatibility}/10
                      </div>
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 m-0">{report.relationshipTheme}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {report.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Challenges</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {report.challenges.slice(0, 3).map((challenge, index) => (
                              <li key={index}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {report.notes && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 m-0">{report.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-lg transition-colors ${
                          report.isFavorite
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                        onClick={() => { void handleToggleFavorite(report.id, report.isFavorite ?? false); }}
                        title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {report.isFavorite ? '\u2605' : '\u2606'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        onClick={() => { void handleDeleteReport(report.id); }}
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
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
