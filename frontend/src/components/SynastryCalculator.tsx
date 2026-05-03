/**
 * Synastry Calculator Component
 * Main component for comparing two charts and calculating compatibility
 */

import React, { useState } from 'react';
import {
  compareCharts,
  getCompatibility,
  SynastryChart,
  CompatibilityScores,
  ElementalBalance,
  CompositeChart,
} from '../services/synastry.api';
import { PlanetSymbol } from './PlanetSymbol';
import { ZodiacBadge } from './ZodiacBadge';

interface Chart {
  id: string;
  name: string;
  userId?: string;
}

interface SynastryCalculatorProps {
  charts: Chart[];
  onReportSave?: (report: SynastryChart) => void;
}

const SynastryCalculator: React.FC<SynastryCalculatorProps> = ({ charts, onReportSave: _onReportSave }) => {
  const [chart1, setChart1] = useState<string>('');
  const [chart2, setChart2] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synastryData, setSynastryData] = useState<SynastryChart | null>(null);
  const [compatibilityData, setCompatibilityData] = useState<{
    scores: CompatibilityScores;
    elementalBalance: ElementalBalance;
    compositeChart?: CompositeChart;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'aspects' | 'composite' | 'scores'>('overview');

  const handleCalculate = async () => {
    if (!chart1 || !chart2) {
      setError('Please select two charts to compare');
      return;
    }

    if (chart1 === chart2) {
      setError('Please select two different charts');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [synastry, compatibility] = await Promise.all([
        compareCharts(chart1, chart2),
        getCompatibility(chart1, chart2, true),
      ]);

      setSynastryData(synastry);
      setCompatibilityData(compatibility);
    } catch (err: unknown) {
      console.error('Error calculating synastry:', err);
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = axiosErr.response?.data?.error ?? axiosErr.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to calculate compatibility');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'challenging';
  };

  const getBalanceType = (balance: ElementalBalance): string => {
    const { fire, earth, air, water } = balance;
    const max = Math.max(fire, earth, air, water);
    const min = Math.min(fire, earth, air, water);

    if (max - min <= 2) return 'well-balanced';
    if (max - min <= 4) return 'balanced';
    return 'imbalanced';
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 md:p-8" role="region" aria-label="Synastry Chart Calculator" aria-busy="true">
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-[50px] h-[50px] border-4 border-white/15 border-t-primary rounded-full animate-spin mb-4" />
          <p>Calculating compatibility...</p>
        </div>
      </div>
    );
  }

  const scoreGradient: Record<string, string> = {
    excellent: 'from-green-500 to-green-600',
    good: 'from-blue-500 to-blue-600',
    fair: 'from-amber-500 to-orange-600',
    challenging: 'from-red-500 to-red-600',
  };

  const scoreValueColor: Record<string, string> = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-amber-500',
    challenging: 'text-red-500',
  };

  const scoreFillBg: Record<string, string> = {
    excellent: 'bg-gradient-to-r from-green-500 to-green-400',
    good: 'bg-gradient-to-r from-blue-500 to-blue-400',
    fair: 'bg-gradient-to-r from-amber-500 to-amber-400',
    challenging: 'bg-gradient-to-r from-red-500 to-red-400',
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8" role="region" aria-label="Synastry Chart Calculator">
      {/* Chart Selection */}
      <div className="glass-panel rounded-2xl p-8 mb-8">
        <h2 className="m-0 mb-6 text-white text-center text-xl font-semibold">Compare Two Charts</h2>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="flex-1 w-full">
            <label htmlFor="chart1" className="block mb-2 text-slate-200 text-sm font-medium">First Chart</label>
            <select
              id="chart1"
              value={chart1}
              onChange={(e) => setChart1(e.target.value)}
              aria-required="true"
              className="w-full p-3 border-2 border-white/15 rounded-lg text-base bg-white/15 text-white cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a chart...</option>
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  {chart.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center w-[50px] h-[50px] bg-primary text-white rounded-full font-bold text-xl shrink-0 md:rotate-0 rotate-0">VS</div>

          <div className="flex-1 w-full">
            <label htmlFor="chart2" className="block mb-2 text-slate-200 text-sm font-medium">Second Chart</label>
            <select
              id="chart2"
              value={chart2}
              onChange={(e) => setChart2(e.target.value)}
              aria-required="true"
              className="w-full p-3 border-2 border-white/15 rounded-lg text-base bg-white/15 text-white cursor-pointer focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a chart...</option>
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  {chart.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => { void handleCalculate(); }}
          className="w-full p-4 bg-primary text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-all hover:bg-primary/90 active:scale-[0.98] disabled:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!chart1 || !chart2 || chart1 === chart2}
        >
          Calculate Compatibility
        </button>

        {error && <div className="mt-4 p-4 bg-red-900/30 text-red-400 rounded-lg text-center" role="alert">{error}</div>}
      </div>

      {/* Results */}
      {synastryData && compatibilityData && (
        <div className="glass-panel rounded-2xl overflow-hidden" aria-live="polite">
          {/* Overall Score */}
          <div className={`flex flex-col md:flex-row items-center gap-8 p-8 bg-gradient-to-br ${scoreGradient[getScoreColor(compatibilityData.scores.overall)]} text-white`}>
            <div className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-white/20 rounded-full shrink-0">
              <span className="text-5xl font-bold leading-none">{compatibilityData.scores.overall}</span>
              <span className="text-xl opacity-90">/10</span>
            </div>
            <div>
              <h3 className="m-0 mb-2 text-3xl">Overall Compatibility</h3>
              <p className="m-0 text-lg opacity-95 leading-relaxed">{String(synastryData.relationshipTheme ?? '')}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-8 pt-4 glass-panel border-b border-white/15 overflow-x-auto">
            <button
              className={`px-6 py-3 bg-transparent border-none border-b-3 text-base font-medium cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'text-primary border-b-3 border-primary' : 'text-slate-200 hover:text-white border-b-3 border-transparent'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-6 py-3 bg-transparent border-none border-b-3 text-base font-medium cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'scores' ? 'text-primary border-b-3 border-primary' : 'text-slate-200 hover:text-white border-b-3 border-transparent'}`}
              onClick={() => setActiveTab('scores')}
            >
              Category Scores
            </button>
            <button
              className={`px-6 py-3 bg-transparent border-none border-b-3 text-base font-medium cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'aspects' ? 'text-primary border-b-3 border-primary' : 'text-slate-200 hover:text-white border-b-3 border-transparent'}`}
              onClick={() => setActiveTab('aspects')}
            >
              Aspects
            </button>
            <button
              className={`px-6 py-3 bg-transparent border-none border-b-3 text-base font-medium cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'composite' ? 'text-primary border-b-3 border-primary' : 'text-slate-200 hover:text-white border-b-3 border-transparent'}`}
              onClick={() => setActiveTab('composite')}
            >
              Composite
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                {/* Strengths */}
                <div>
                  <h3 className="m-0 mb-4 text-white text-xl">Strengths</h3>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3">
                    {(synastryData.strengths ?? []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-3 p-4 bg-green-900/20 border-l-4 border-green-500 rounded">
                        <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full shrink-0 font-bold text-sm">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h3 className="m-0 mb-4 text-white text-xl">Challenges</h3>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3">
                    {(synastryData.challenges ?? []).map((challenge, index) => (
                      <li key={index} className="flex items-start gap-3 p-4 bg-red-900/20 border-l-4 border-red-500 rounded">
                        <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full shrink-0 font-bold text-sm">!</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advice */}
                <div>
                  <h3 className="m-0 mb-4 text-white text-xl">Relationship Advice</h3>
                  <p className="m-0 p-4 bg-white/15 border-l-4 border-primary rounded leading-relaxed">{String(synastryData.advice ?? '')}</p>
                </div>

                {/* Elemental Balance */}
                <div className="p-6 bg-white/15 rounded-lg">
                  <h3 className="m-0 mb-4 text-white text-xl">Elemental Balance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col items-center p-6 glass-panel rounded-2xl gap-2 border-t-[3px] border-red-500">
                      <span className="text-4xl">🔥</span>
                      <span className="text-4xl font-bold text-white">{compatibilityData.elementalBalance.fire}</span>
                      <span className="text-sm text-slate-200 capitalize">Fire</span>
                    </div>
                    <div className="flex flex-col items-center p-6 glass-panel rounded-2xl gap-2 border-t-[3px] border-amber-700">
                      <span className="text-4xl">🌍</span>
                      <span className="text-4xl font-bold text-white">{compatibilityData.elementalBalance.earth}</span>
                      <span className="text-sm text-slate-200 capitalize">Earth</span>
                    </div>
                    <div className="flex flex-col items-center p-6 glass-panel rounded-2xl gap-2 border-t-[3px] border-blue-300">
                      <span className="text-4xl">💨</span>
                      <span className="text-4xl font-bold text-white">{compatibilityData.elementalBalance.air}</span>
                      <span className="text-sm text-slate-200 capitalize">Air</span>
                    </div>
                    <div className="flex flex-col items-center p-6 glass-panel rounded-2xl gap-2 border-t-[3px] border-blue-500">
                      <span className="text-4xl">💧</span>
                      <span className="text-4xl font-bold text-white">{compatibilityData.elementalBalance.water}</span>
                      <span className="text-sm text-slate-200 capitalize">Water</span>
                    </div>
                  </div>
                  <p className={`text-center text-lg font-semibold capitalize ${
                    getBalanceType(compatibilityData.elementalBalance) === 'well-balanced' ? 'text-green-500' :
                    getBalanceType(compatibilityData.elementalBalance) === 'balanced' ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {getBalanceType(compatibilityData.elementalBalance).replace('-', ' ')}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'scores' && (
              <div>
                <h3 className="m-0 mb-6 text-white text-2xl">Compatibility by Category</h3>
                <div className="flex flex-col gap-6">
                  {Object.entries(compatibilityData.scores).map(([category, score]) => (
                    <div key={category} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-white capitalize">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className={`text-lg font-bold ${scoreValueColor[getScoreColor(score as number)]}`}>
                          {score as number}/10
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-[width] duration-300 ease-in-out rounded-full ${scoreFillBg[getScoreColor(score as number)]}`}
                          style={{ width: `${(score as number) * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'aspects' && (
              <div>
                <h3 className="m-0 mb-6 text-white text-2xl">Cross-Chart Aspects</h3>
                {(synastryData.synastryAspects ?? []).length === 0 ? (
                  <p className="text-center text-slate-200 italic">No significant aspects found between these charts.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                    {(synastryData.synastryAspects ?? []).map((aspect, index) => (
                      <div
                        key={index}
                        className={`p-6 rounded-lg border-2 border-transparent transition-all hover:border-white/15 hover:-translate-y-0.5 ${
                          aspect.soulmateIndicator
                            ? 'border-pink-500 bg-gradient-to-br from-pink-900/30 to-pink-800/30'
                            : 'bg-white/15'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <PlanetSymbol planet={aspect.planet1} />
                            <span className="text-sm font-semibold text-slate-200 capitalize">{aspect.aspect}</span>
                            <PlanetSymbol planet={aspect.planet2} />
                          </div>
                          <div className="text-sm text-slate-200">
                            {aspect.orb.toFixed(1)}°
                            {aspect.applying ? ' ⚡' : ''}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="m-0 mb-2 leading-relaxed text-white">{aspect.interpretation}</p>
                          {aspect.soulmateIndicator && (
                            <span className="inline-block px-3 py-1 bg-pink-500 text-white rounded-xl text-xs font-semibold">Soulmate Connection</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/15">
                          <span className="text-sm text-slate-200">Weight: {aspect.weight}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'composite' && compatibilityData.compositeChart && (
              <div>
                <h3 className="m-0 mb-4 text-white text-2xl">Composite Chart</h3>
                <p className="m-0 mb-8 text-slate-200 text-lg leading-relaxed">
                  The composite chart represents your relationship as a separate entity.
                  It shows the midpoint of your two charts.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {Object.entries(compatibilityData.compositeChart.planets).map(([name, planet]) => (
                    <div key={name} className="flex flex-col items-center gap-2 p-6 bg-white/15 rounded-lg">
                      <PlanetSymbol planet={name} />
                      <ZodiacBadge sign={planet.sign} />
                      <span className="text-sm text-slate-200">
                        {planet.degree}° {planet.minute}&apos; {planet.second}&quot;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SynastryCalculator;
