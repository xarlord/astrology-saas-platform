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
import './SynastryCalculator.css';

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
    } catch (err) {
      console.error('Error calculating synastry:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate compatibility';
      setError(errorMessage);
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
      <div className="synastry-calculator">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Calculating compatibility...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="synastry-calculator">
      {/* Chart Selection */}
      <div className="chart-selection">
        <h2>Compare Two Charts</h2>
        <div className="chart-selectors">
          <div className="chart-selector">
            <label htmlFor="chart1">First Chart</label>
            <select
              id="chart1"
              value={chart1}
              onChange={(e) => setChart1(e.target.value)}
            >
              <option value="">Select a chart...</option>
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  {chart.name}
                </option>
              ))}
            </select>
          </div>

          <div className="vs-divider">VS</div>

          <div className="chart-selector">
            <label htmlFor="chart2">Second Chart</label>
            <select
              id="chart2"
              value={chart2}
              onChange={(e) => setChart2(e.target.value)}
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
          onClick={() => void handleCalculate()}
          className="calculate-button"
          disabled={!chart1 || !chart2 || chart1 === chart2}
        >
          Calculate Compatibility
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Results */}
      {synastryData && compatibilityData && (
        <div className="synastry-results">
          {/* Overall Score */}
          <div className={`overall-score ${getScoreColor(compatibilityData.scores.overall)}`}>
            <div className="score-circle">
              <span className="score-number">{compatibilityData.scores.overall}</span>
              <span className="score-out-of">/10</span>
            </div>
            <div className="score-details">
              <h3>Overall Compatibility</h3>
              <p className="theme">{synastryData.relationshipTheme}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="result-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === 'scores' ? 'active' : ''}`}
              onClick={() => setActiveTab('scores')}
            >
              Category Scores
            </button>
            <button
              className={`tab ${activeTab === 'aspects' ? 'active' : ''}`}
              onClick={() => setActiveTab('aspects')}
            >
              Aspects
            </button>
            <button
              className={`tab ${activeTab === 'composite' ? 'active' : ''}`}
              onClick={() => setActiveTab('composite')}
            >
              Composite
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {/* Strengths */}
                <div className="strengths-section">
 ??                  <h3>Strengths</h3>
                  <ul className="strengths-list">
                    {synastryData.strengths.map((strength, index) => (
                      <li key={index} className="strength-item">
                        <span className="icon">✓</span>
                        {strength}
                      </li>
                    ))}
 ??                  </ul>
                </div>

                {/* Challenges */}
                <div className="challenges-section">
                  <h3>Challenges</h3>
                  <ul className="challenges-list">
                    {synastryData.challenges.map((challenge, index) => (
                      <li key={index} className="challenge-item">
                        <span className="icon">!</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advice */}
                <div className="advice-section">
                  <h3>Relationship Advice</h3>
                  <p>{synastryData.advice}</p>
                </div>

                {/* Elemental Balance */}
                <div className="elemental-balance">
                  <h3>Elemental Balance</h3>
                  <div className="elements-grid">
                    <div className="element-card fire">
                      <span className="element-icon">🔥</span>
                      <span className="element-count">{compatibilityData.elementalBalance.fire}</span>
                      <span className="element-name">Fire</span>
                    </div>
                    <div className="element-card earth">
                      <span className="element-icon">🌍</span>
                      <span className="element-count">{compatibilityData.elementalBalance.earth}</span>
                      <span className="element-name">Earth</span>
                    </div>
                    <div className="element-card air">
                      <span className="element-icon">💨</span>
                      <span className="element-count">{compatibilityData.elementalBalance.air}</span>
                      <span className="element-name">Air</span>
                    </div>
                    <div className="element-card water">
                      <span className="element-icon">💧</span>
                      <span className="element-count">{compatibilityData.elementalBalance.water}</span>
                      <span className="element-name">Water</span>
                    </div>
                  </div>
                  <p className={`balance-type ${getBalanceType(compatibilityData.elementalBalance)}`}>
                    {getBalanceType(compatibilityData.elementalBalance).replace('-', ' ')}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'scores' && (
              <div className="scores-tab">
                <h3>Compatibility by Category</h3>
                <div className="category-scores">
                  {Object.entries(compatibilityData.scores).map(([category, score]) => (
                    <div key={category} className="category-score">
                      <div className="score-header">
                        <span className="category-name">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className={`score-value ${getScoreColor(score as number)}`}>
                          {score as number}/10
                        </span>
                      </div>
                      <div className="score-bar">
                        <div
                          className={`score-fill ${getScoreColor(score as number)}`}
                          style={{ width: `${(score as number) * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'aspects' && (
              <div className="aspects-tab">
                <h3>Cross-Chart Aspects</h3>
                {synastryData.synastryAspects.length === 0 ? (
                  <p className="no-aspects">No significant aspects found between these charts.</p>
                ) : (
                  <div className="aspects-grid">
                    {synastryData.synastryAspects.map((aspect, index) => (
                      <div
                        key={index}
                        className={`aspect-card ${aspect.soulmateIndicator ? 'soulmate' : ''}`}
                      >
                        <div className="aspect-header">
                          <div className="planets">
                            <PlanetSymbol planet={aspect.planet1} />
                            <span className="aspect-name">{aspect.aspect}</span>
                            <PlanetSymbol planet={aspect.planet2} />
                          </div>
                          <div className="orb">
                            {aspect.orb.toFixed(1)}°
                            {aspect.applying ? ' ⚡' : ''}
                          </div>
                        </div>
                        <div className="aspect-body">
                          <p className="interpretation">{aspect.interpretation}</p>
                          {aspect.soulmateIndicator && (
                            <span className="soulmate-badge">Soulmate Connection</span>
                          )}
                        </div>
                        <div className="aspect-footer">
                          <span className="weight">Weight: {aspect.weight}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'composite' && compatibilityData.compositeChart && (
              <div className="composite-tab">
                <h3>Composite Chart</h3>
                <p className="composite-description">
                  The composite chart represents your relationship as a separate entity.
                  It shows the midpoint of your two charts.
                </p>
                <div className="composite-planets">
                  {Object.entries(compatibilityData.compositeChart.planets).map(([name, planet]) => (
                    <div key={name} className="composite-planet">
                      <PlanetSymbol planet={name} />
                      <ZodiacBadge sign={planet.sign} />
                      <span className="degree">
                        {planet.degree}° {planet.minute}' {planet.second}"
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
