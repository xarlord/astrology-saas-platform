/**
 * Enhanced Synastry Page
 * Modern synastry/compatibility page with beautiful UI matching the design specs
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PersonSelector, { Chart } from '../components/synastry/PersonSelector';
import CompatibilityGauge from '../components/astrology/CompatibilityGauge';
import {
  compareCharts,
  getCompatibility,
  SynastryAspect,
  CompatibilityScores,
} from '../services/synastry.api';
import { chartService } from '../services/chart.service';
import { AppLayout } from '../components/AppLayout';
import { SkeletonLoader, EmptyState } from '../components';

interface SynastryPageProps {
  charts?: Chart[];
}

const SynastryPage: React.FC<SynastryPageProps> = ({ charts: propCharts }) => {
  const navigate = useNavigate();
  const [charts, setCharts] = useState<Chart[]>(propCharts ?? []);
  const [chart1Id, setChart1Id] = useState('');
  const [chart2Id, setChart2Id] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [results, setResults] = useState<{
    aspects: SynastryAspect[];
    scores: CompatibilityScores;
    theme: string;
    strengths: string[];
    challenges: string[];
  } | null>(null);

  useEffect(() => {
    if (!propCharts) {
      void loadCharts();
    }
  }, [propCharts]);

  const loadCharts = async () => {
    try {
      setLoading(true);
      const { charts: loadedCharts } = await chartService.getCharts();
      setCharts(loadedCharts);
    } catch (err) {
      console.error('Error loading charts:', err);
      setError('Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = chart1Id;
    setChart1Id(chart2Id);
    setChart2Id(temp);
  };

  const handleCompare = async () => {
    if (!chart1Id || !chart2Id) {
      setError('Please select two charts to compare');
      return;
    }

    if (chart1Id === chart2Id) {
      setError('Please select two different charts');
      return;
    }

    try {
      setCalculating(true);
      setError(null);
      setTimeoutWarning(false);

      // Show timeout warning after 45 seconds
      const timeoutTimer = setTimeout(() => {
        setTimeoutWarning(true);
      }, 45000);

      const [synastry, compatibility] = await Promise.all([
        compareCharts(chart1Id, chart2Id),
        getCompatibility(chart1Id, chart2Id, true),
      ]);

      clearTimeout(timeoutTimer);

      setResults({
        aspects: synastry.synastryAspects,
        scores: compatibility.scores,
        theme: synastry.relationshipTheme,
        strengths: synastry.strengths,
        challenges: synastry.challenges,
      });
    } catch (err) {
      console.error('Error calculating synastry:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to calculate compatibility. Please try again.';
      setError(errorMessage);
    } finally {
      setCalculating(false);
      setTimeoutWarning(false);
    }
  };

  const handleSaveReport = () => {
    // TODO: Implement save report functionality
    alert('Save report functionality coming soon!');
  };

  const handleShareResults = () => {
    if (navigator.share) {
      void navigator.share({
        title: 'AstroVerse Compatibility Report',
        text: `Check out our compatibility score: ${results?.scores.overall ?? 0}/100`,
        url: window.location.href,
      });
    } else {
      alert('Share functionality coming soon!');
    }
  };

  const handleStartNew = () => {
    setResults(null);
    setChart1Id('');
    setChart2Id('');
    setError(null);
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent Cosmic Connection';
    if (score >= 80) return 'Strong Cosmic Connection';
    if (score >= 70) return 'Good Compatibility';
    if (score >= 60) return 'Moderate Compatibility';
    if (score >= 40) return 'Challenging but Workable';
    return 'Difficult Connection';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      romantic: 'favorite',
      communication: 'chat_bubble',
      emotional: 'water_drop',
      intellectual: 'psychology',
      spiritual: 'spa',
      values: 'diamond',
      overall: 'auto_awesome',
    };
    return icons[category] || 'star';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      romantic: '#EC4899',
      communication: '#3B82F6',
      emotional: '#6C3CE1',
      intellectual: '#2DD4BF',
      spiritual: '#10B981',
      values: '#F5A623',
      overall: '#6C3CE1',
    };
    return colors[category] || '#6C3CE1';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <SkeletonLoader variant="card" count={2} />
        </div>
      </AppLayout>
    );
  }

  if (charts.length === 0) {
    return (
      <AppLayout>
        <EmptyState
          icon="💫"
          title="No charts available"
          description="You need at least two charts to compare compatibility. Create your charts first."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <motion.div
          className="flex flex-col items-center justify-center text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">favorite</span>
            Premium Feature
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Synastry & Compatibility
          </h1>
          <p className="text-slate-400 max-w-lg text-lg">
            Decode the cosmic blueprint of your relationship. Compare birth charts to uncover
            strengths, challenges, and karmic bonds.
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Person Selection */}
        <PersonSelector
          charts={charts}
          chart1Id={chart1Id}
          chart2Id={chart2Id}
          onChart1Change={setChart1Id}
          onChart2Change={setChart2Id}
          onSwap={handleSwap}
          onCreateNew={() => navigate('/charts/new')}
        />

        {/* Compare Button */}
        {!results && !calculating && (
          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => void handleCompare()}
              disabled={!chart1Id || !chart2Id || chart1Id === chart2Id}
              className="relative group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all text-white font-bold text-lg shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined align-middle mr-2">compare_arrows</span>
              Compare Charts
            </button>
          </motion.div>
        )}

        {/* Calculating State */}
        <AnimatePresence>
          {calculating && (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-t-secondary animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
              </div>
              <p className="text-white text-lg font-medium mb-2">Calculating compatibility...</p>
              <p className="text-slate-400 text-sm">
                This may take up to 60 seconds for complex calculations
              </p>
              {timeoutWarning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm"
                >
                  Taking longer than usual... Please wait.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && !calculating && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Overall Score */}
              <div className="bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>

                <CompatibilityGauge
                  score={results.scores.overall}
                  size="xl"
                  showLabel
                  aria-label={`Overall compatibility score: ${results.scores.overall}`}
                />

                <div className="flex flex-col text-center sm:text-left z-10">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
                    {getScoreLabel(results.scores.overall)}
                    <span className="material-symbols-outlined text-accent-gold text-xl animate-pulse">
                      auto_awesome
                    </span>
                  </h2>
                  <p className="text-slate-300 leading-relaxed">{results.theme}</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Compatibility Breakdown</h3>
                <div className="grid gap-4">
                  {Object.entries(results.scores)
                    .filter(([key]) => key !== 'overall')
                    .map(([category, score]) => (
                      <motion.div
                        key={category}
                        className="bg-card-glass border border-glass-border rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: Number(Object.keys(results.scores).indexOf(category)) * 0.1,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${getCategoryColor(category)}20`,
                            color: getCategoryColor(category),
                          }}
                        >
                          <span className="material-symbols-outlined">
                            {getCategoryIcon(category)}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-white capitalize">
                              {category}
                            </span>
                            <span
                              className="text-sm font-bold"
                              style={{ color: getCategoryColor(category) }}
                            >
                              {score}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: getCategoryColor(category) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Key Aspects */}
              {results.aspects.length > 0 && (
                <div className="bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Key Aspects</h3>
                  <div className="space-y-4">
                    {results.aspects.slice(0, 10).map((aspect, index) => {
                      const isHarmonious = ['trine', 'sextile', 'conjunction'].includes(
                        aspect.aspect,
                      );
                      const color = isHarmonious
                        ? '#22c55e'
                        : aspect.aspect === 'square' || aspect.aspect === 'opposition'
                          ? '#ef4444'
                          : '#3b82f6';
                      const label = isHarmonious
                        ? 'Harmony'
                        : aspect.aspect === 'square' || aspect.aspect === 'opposition'
                          ? 'Tension'
                          : 'Flow';

                      return (
                        <div
                          key={index}
                          className="flex gap-3 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0"
                        >
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: color }}
                          ></div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-white">
                                {aspect.planet1} {aspect.aspect} {aspect.planet2}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border"
                                style={{
                                  backgroundColor: `${color}20`,
                                  color,
                                  borderColor: `${color}40`,
                                }}
                              >
                                {label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-1">
                              Orb: {aspect.orb.toFixed(1)}° •{' '}
                              {aspect.applying ? 'Applying' : 'Separating'}
                            </p>
                            <p className="text-sm text-slate-300">{aspect.interpretation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths and Challenges */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-green">thumb_up</span>
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-accent-green mt-1">●</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-red">warning</span>
                    Challenges
                  </h3>
                  <ul className="space-y-2">
                    {results.challenges.map((challenge, index) => (
                      <li key={index} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-accent-red mt-1">●</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pb-10">
                <button
                  onClick={handleSaveReport}
                  className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all text-white font-bold text-lg shadow-glow hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined">lock_open</span>
                  Generate Full Report
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleShareResults}
                    className="flex items-center justify-center gap-2 h-14 px-6 rounded-xl bg-surface border border-glass-border hover:bg-white/5 transition-colors text-white font-medium"
                  >
                    <span className="material-symbols-outlined">share</span>
                    Share
                  </button>
                  <button
                    onClick={handleStartNew}
                    className="flex items-center justify-center gap-2 h-14 px-6 rounded-xl bg-surface border border-glass-border hover:bg-white/5 transition-colors text-white font-medium"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    New Comparison
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default SynastryPage;
