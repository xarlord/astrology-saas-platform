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
        <h1 className="text-3xl font-bold text-white m-0 gradient-text">Synastry & Compatibility</h1>
        <p className="mt-2 text-slate-200">Compare two charts to discover relationship dynamics and compatibility</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            view === 'calculator'
              ? 'bg-primary text-white'
              : 'bg-white/15 text-slate-200 hover:bg-white/15'
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
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            view === 'history'
              ? 'bg-primary text-white'
              : 'bg-white/15 text-slate-200 hover:bg-white/15'
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
              <div className="w-[50px] h-[50px] border-4 border-white/15 border-t-primary rounded-full animate-spin mb-4" />
              <p>Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/20 text-red-400 rounded-xl text-center">{error}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">No saved reports yet</h3>
              <p className="text-slate-200 mb-6">Compare two charts to save your first compatibility report</p>
              <button
                type="button"
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                onClick={() => setView('calculator')}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-cosmic-card backdrop-blur-md rounded-2xl shadow-sm border border-white/15 overflow-hidden">
                    <div className="flex justify-between items-start p-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white m-0">
                          {getChartName(report.chart1Id)} + {getChartName(report.chart2Id)}
                        </h3>
                        <span className="text-sm text-slate-200">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        getScoreColor(report.overallCompatibility) === 'excellent' ? 'bg-green-500/20 text-green-400' :
                        getScoreColor(report.overallCompatibility) === 'good' ? 'bg-blue-500/20 text-blue-400' :
                        getScoreColor(report.overallCompatibility) === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {report.overallCompatibility}/10
                      </div>
                    </div>

                    <div className="px-6 pb-6 space-y-4">
                      <p className="text-slate-200 m-0">{report.relationshipTheme}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                            {report.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Challenges</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                            {report.challenges.slice(0, 3).map((challenge, index) => (
                              <li key={index}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {report.notes && (
                        <div className="bg-white/15 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-white mb-1">Notes</h4>
                          <p className="text-sm text-slate-200 m-0">{report.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-6 py-4 border-t border-white/15 bg-white/15">
                      <button
                        type="button"
                        className={`px-3 py-1 rounded-lg text-lg transition-colors ${
                          report.isFavorite
                            ? 'text-amber-500 bg-amber-500/20'
                            : 'text-slate-200 hover:text-amber-500 hover:bg-amber-500/20'
                        }`}
                        onClick={() => { void handleToggleFavorite(report.id, report.isFavorite ?? false); }}
                        title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {report.isFavorite ? '\u2605' : '\u2606'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"
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
                    className="px-4 py-2 rounded-xl bg-white/15 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-200">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/15 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 transition-colors"
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
