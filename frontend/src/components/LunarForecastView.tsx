/**
 * Lunar Forecast View Component
 * Displays the complete monthly lunar forecast
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LunarMonthForecast,
  getLunarMonthForecast,
  MonthlyPrediction,
  MonthlyRitual,
} from '@/services/lunarReturn.api';
import { INTENSITY_THRESHOLDS, UI } from '../utils/constants';
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

  const loadForecast = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLunarMonthForecast(returnDate);
      setForecast(data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('Error loading forecast:', err);
      setError(error.response?.data?.error ?? 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  }, [returnDate]);

  useEffect(() => {
    void loadForecast();
  }, [loadForecast]);

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= INTENSITY_THRESHOLDS.LOW_MAX) return 'low';
    if (intensity <= INTENSITY_THRESHOLDS.MEDIUM_MAX) return 'medium';
    if (intensity <= INTENSITY_THRESHOLDS.HIGH_MAX) return 'high';
    return 'extreme';
  };

  const getIntensityClasses = (intensity: number): string => {
    const color = getIntensityColor(intensity);
    switch (color) {
      case 'low': return 'bg-green-600/30';
      case 'medium': return 'bg-yellow-500/30';
      case 'high': return 'bg-orange-500/30';
      case 'extreme': return 'bg-red-500/30';
      default: return 'bg-white/20';
    }
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
    const likelihoodBars = Array.from({ length: UI.LIKELIHOOD_MAX }, (_, i) => i < prediction.likelihood);

    return (
      <div key={index} className="bg-gray-50 p-5 rounded-xl border-l-4 border-indigo-500">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-2xl">{getCategoryIcon(prediction.category)}</span>
          <h4 className="m-0 text-gray-800 capitalize">{prediction.category}</h4>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm">Likelihood:</span>
            <div className="flex gap-0.5">
              {likelihoodBars.map((_, i) => (
                <span key={i} className={`text-[0.6rem] ${i < prediction.likelihood ? 'text-indigo-500' : 'text-gray-300'}`}>&#9632;</span>
              ))}
            </div>
            <span className="number">{prediction.likelihood}/{UI.LIKELIHOOD_MAX}</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed m-0 mb-3">{prediction.prediction}</p>
        {prediction.advice && prediction.advice.length > 0 && (
          <ul className="m-0 pl-5">
            {prediction.advice.map((advice, i) => (
              <li key={i} className="text-gray-500 leading-relaxed mb-1.5">{advice}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderRitualCard = (ritual: MonthlyRitual, index: number) => (
    <div key={index} className="bg-gray-50 p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{ritual.phase === 'new-moon' ? '🌑' : ritual.phase === 'full-moon' ? '🌕' : '🌓'}</span>
        <h4 className="m-0 text-gray-800 grow">{ritual.title}</h4>
        <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm">{ritual.phase.replace('-', ' ')}</span>
      </div>
      <p className="text-gray-700 leading-relaxed m-0 mb-4">{ritual.description}</p>
      {ritual.materials && ritual.materials.length > 0 && (
        <div className="mb-4">
          <strong>Materials needed:</strong>
          <ul className="mt-2 pl-5 m-0">
            {ritual.materials.map((material, i) => (
              <li key={i} className="text-gray-500 leading-relaxed">{material}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <strong>Steps:</strong>
        <ol className="mt-2 pl-5 m-0">
          {ritual.steps.map((step, i) => (
            <li key={i} className="text-gray-500 leading-loose mb-2">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto p-5">
        <div className="py-10 text-center text-gray-400 text-lg">Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lunar-forecast-view">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => { void loadForecast(); }} className="retry-button">
            Try Again
          </button>
        </div>
        {onBack && <button onClick={onBack} type="button" className="inline-block px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 cursor-pointer mb-4 text-sm hover:bg-gray-100 transition-colors">Back</button>}
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  return (
    <div className="max-w-[1000px] mx-auto p-5">
      {/* Header */}
      <div className="text-center mb-6">
        {onBack && <button onClick={onBack} type="button" className="inline-block px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 cursor-pointer mb-4 text-sm hover:bg-gray-100 transition-colors">&larr; Back</button>}
        <h2 className="text-3xl text-gray-800 m-0 mb-2">Lunar Month Forecast</h2>
        <p className="text-gray-400 text-lg">
          {new Date(forecast.returnDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          className={`px-6 py-3 border-none rounded-lg cursor-pointer font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === 'overview' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`px-6 py-3 border-none rounded-lg cursor-pointer font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === 'predictions' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('predictions')}
        >
          Predictions
        </button>
        <button
          type="button"
          className={`px-6 py-3 border-none rounded-lg cursor-pointer font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === 'rituals' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('rituals')}
        >
          Rituals
        </button>
        <button
          type="button"
          className={`px-6 py-3 border-none rounded-lg cursor-pointer font-medium whitespace-nowrap transition-all duration-200 ${
            activeTab === 'journal' ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('journal')}
        >
          Journal
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm shadow-black/10">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Theme Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="m-0 mb-3 text-xl">Monthly Theme</h3>
              <p className="text-lg leading-relaxed mb-4">{forecast.theme}</p>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getIntensityClasses(forecast.intensity)}`}>
                <span>Intensity:</span>
                <span className="ml-1">{forecast.intensity}/10</span>
              </div>
            </div>

            {/* Emotional Theme */}
            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="m-0 mb-3 text-gray-800">Emotional Focus</h3>
              <p className="text-gray-500 leading-relaxed m-0">{forecast.emotionalTheme}</p>
            </div>

            {/* Action Advice */}
            {forecast.actionAdvice && forecast.actionAdvice.length > 0 && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="m-0 mb-3 text-gray-800">Actions to Take This Month</h3>
                <ul className="m-0 pl-5">
                  {forecast.actionAdvice.map((advice, i) => (
                    <li key={i} className="text-gray-500 leading-loose mb-2">{advice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Dates */}
            {forecast.keyDates && forecast.keyDates.length > 0 && (
              <div>
                <h3 className="m-0 mb-4 text-gray-800">Key Dates</h3>
                <div className="flex flex-col gap-3">
                  {forecast.keyDates.map((date, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-white rounded-lg border-l-4 border-indigo-500">
                      <span className="inline-block w-fit px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-semibold">{date.type.replace('-', ' ')}</span>
                      <span className="text-indigo-500 font-semibold">
                        {new Date(date.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <p className="m-0 text-gray-700 font-medium">{date.description}</p>
                      <p className="m-0 text-gray-500 text-[0.95rem]">{date.significance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <h3 className="m-0 mb-5 text-gray-800">Monthly Predictions</h3>
            <div className="grid gap-4">
              {forecast.predictions.map((prediction, i) => renderPredictionCard(prediction, i))}
            </div>
          </div>
        )}

        {activeTab === 'rituals' && (
          <div>
            <h3 className="m-0 mb-5 text-gray-800">Monthly Rituals</h3>
            <div className="grid gap-5">
              {forecast.rituals.map((ritual, i) => renderRitualCard(ritual, i))}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div>
            <h3 className="m-0 mb-3 text-gray-800">Journal Prompts</h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Reflect on these questions throughout the lunar month to deepen your self-awareness.
            </p>
            <div className="flex flex-col gap-4">
              {forecast.journalPrompts.map((prompt, i) => (
                <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full font-semibold">{i + 1}</span>
                  <p className="m-0 text-gray-700 leading-relaxed">{prompt}</p>
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
