/**
 * Lunar Forecast View Component
 * Displays the complete monthly lunar forecast
 */

import React, { useState, useEffect } from 'react';
import {
  LunarMonthForecast,
  getLunarMonthForecast,
  MonthlyPrediction,
  MonthlyRitual,
} from '@services/lunarReturn.api';
import './LunarReturn.css';

interface LunarForecastViewProps {
  returnDate?: Date;
  onBack?: () => void;
}

const LunarForecastView: React.FC<LunarForecastViewProps> = ({ returnDate, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<LunarMonthForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'rituals' | 'journal'>('overview');

  useEffect(() => {
    loadForecast();
  }, [returnDate]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLunarMonthForecast(returnDate);
      setForecast(data);
    } catch (err: any) {
      console.error('Error loading forecast:', err);
      setError(err.response?.data?.error || 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return 'low';
    if (intensity <= 6) return 'medium';
    if (intensity <= 8) return 'high';
    return 'extreme';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      relationships: '❤️',
      career: '💼',
      finances: '💰',
      health: '🏥',
      creativity: '🎨',
      spirituality: '✨',
    };
    return icons[category] || '📌';
  };

  const renderPredictionCard = (prediction: MonthlyPrediction, index: number) => {
    const likelihoodBars = Array.from({ length: 10 }, (_, i) => i < prediction.likelihood);

    return (
      <div key={index} className="prediction-card">
        <div className="prediction-header">
          <span className="category-icon">{getCategoryIcon(prediction.category)}</span>
          <h4>{prediction.category}</h4>
          <div className="likelihood">
            <span className="label">Likelihood:</span>
            <div className="likelihood-bar">
              {likelihoodBars.map((_, i) => (
                <span key={i} className={`bar ${i < prediction.likelihood ? 'filled' : ''}`}>■</span>
              ))}
            </div>
            <span className="number">{prediction.likelihood}/10</span>
          </div>
        </div>
        <p className="prediction-text">{prediction.prediction}</p>
        {prediction.advice && prediction.advice.length > 0 && (
          <ul className="advice-list">
            {prediction.advice.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderRitualCard = (ritual: MonthlyRitual, index: number) => (
    <div key={index} className="ritual-card">
      <div className="ritual-header">
        <span className="phase-icon">{ritual.phase === 'new-moon' ? '🌑' : ritual.phase === 'full-moon' ? '🌕' : '🌓'}</span>
        <h4>{ritual.title}</h4>
        <span className="phase">{ritual.phase.replace('-', ' ')}</span>
      </div>
      <p className="ritual-description">{ritual.description}</p>
      {ritual.materials && ritual.materials.length > 0 && (
        <div className="materials">
          <strong>Materials needed:</strong>
          <ul>
            {ritual.materials.map((material, i) => (
              <li key={i}>{material}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="ritual-steps">
        <strong>Steps:</strong>
        <ol>
          {ritual.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="lunar-forecast-view">
        <div className="loading-spinner">Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lunar-forecast-view">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadForecast} className="retry-button">
            Try Again
          </button>
        </div>
        {onBack && <button onClick={onBack} className="back-button">Back</button>}
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  return (
    <div className="lunar-forecast-view">
      {/* Header */}
      <div className="forecast-header">
        {onBack && <button onClick={onBack} className="back-button">← Back</button>}
        <h2>Lunar Month Forecast</h2>
        <p className="return-date">
          {new Date(forecast.returnDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Tabs */}
      <div className="forecast-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          Predictions
        </button>
        <button
          className={`tab ${activeTab === 'rituals' ? 'active' : ''}`}
          onClick={() => setActiveTab('rituals')}
        >
          Rituals
        </button>
        <button
          className={`tab ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          Journal
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Theme Card */}
            <div className="theme-card">
              <h3>Monthly Theme</h3>
              <p className="theme-text">{forecast.theme}</p>
              <div className={`intensity-indicator ${getIntensityColor(forecast.intensity)}`}>
                <span className="label">Intensity:</span>
                <span className="value">{forecast.intensity}/10</span>
              </div>
            </div>

            {/* Emotional Theme */}
            <div className="emotional-theme-card">
              <h3>Emotional Focus</h3>
              <p>{forecast.emotionalTheme}</p>
            </div>

            {/* Action Advice */}
            {forecast.actionAdvice && forecast.actionAdvice.length > 0 && (
              <div className="action-advice-card">
                <h3>Actions to Take This Month</h3>
                <ul>
                  {forecast.actionAdvice.map((advice, i) => (
                    <li key={i}>{advice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Dates */}
            {forecast.keyDates && forecast.keyDates.length > 0 && (
              <div className="key-dates-card">
                <h3>Key Dates</h3>
                <div className="key-dates-list">
                  {forecast.keyDates.map((date, i) => (
                    <div key={i} className="key-date-item">
                      <span className="date-badge">{date.type.replace('-', ' ')}</span>
                      <span className="date">
                        {new Date(date.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <p className="description">{date.description}</p>
                      <p className="significance">{date.significance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-tab">
            <h3>Monthly Predictions</h3>
            <div className="predictions-grid">
              {forecast.predictions.map((prediction, i) => renderPredictionCard(prediction, i))}
            </div>
          </div>
        )}

        {activeTab === 'rituals' && (
          <div className="rituals-tab">
            <h3>Monthly Rituals</h3>
            <div className="rituals-list">
              {forecast.rituals.map((ritual, i) => renderRitualCard(ritual, i))}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="journal-tab">
            <h3>Journal Prompts</h3>
            <p className="journal-intro">
              Reflect on these questions throughout the lunar month to deepen your self-awareness.
            </p>
            <div className="journal-prompts-list">
              {forecast.journalPrompts.map((prompt, i) => (
                <div key={i} className="journal-prompt">
                  <span className="prompt-number">{i + 1}</span>
                  <p className="prompt-text">{prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunarForecastView;
