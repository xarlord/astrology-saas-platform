/**
 * Solar Return Interpretation Component
 * Displays detailed birthday year themes and interpretations
 */

import React from 'react';
import {
  Star,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Gift,
  Lightbulb,
  Download,
  Share2,
} from 'lucide-react';
import { INTENSITY_THRESHOLDS, EVENT_COLORS } from '../utils/constants';
import './SolarReturnInterpretation.css';

interface LuckyDay {
  date: string;
  reason: string;
  intensity: number;
}

interface Challenge {
  area: string;
  description: string;
  advice: string;
}

interface Opportunity {
  area: string;
  description: string;
  timing: string;
}

interface SolarReturnInterpretation {
  themes: string[];
  sunHouse: {
    house: number;
    interpretation: string;
    focus: string[];
  };
  moonPhase: {
    phase: string;
    interpretation: string;
    energy: string;
    advice: string[];
  };
  luckyDays: LuckyDay[];
  challenges: Challenge[];
  opportunities: Opportunity[];
  advice: string[];
  keywords: string[];
}

interface SolarReturnInterpretationProps {
  interpretation: SolarReturnInterpretation;
  year: number;
  returnDate: string;
  onShare?: () => void;
  onDownload?: () => void;
}

const HOUSE_NAMES: Record<number, string> = {
  1: 'First House',
  2: 'Second House',
  3: 'Third House',
  4: 'Fourth House',
  5: 'Fifth House',
  6: 'Sixth House',
  7: 'Seventh House',
  8: 'Eighth House',
  9: 'Ninth House',
  10: 'Tenth House',
  11: 'Eleventh House',
  12: 'Twelfth House',
};

const MOON_PHASE_EMOJIS: Record<string, string> = {
  new: '🌑',
  'waxing-crescent': '🌒',
  'first-quarter': '🌓',
  'waxing-gibbous': '🌔',
  full: '🌕',
  'waning-gibbous': '🌖',
  'last-quarter': '🌗',
  'waning-crescent': '🌘',
};

export const SolarReturnInterpretation: React.FC<SolarReturnInterpretationProps> = ({
  interpretation,
  year,
  returnDate,
  onShare,
  onDownload,
}) => {
  const getIntensityColor = (intensity: number) => {
    if (intensity >= INTENSITY_THRESHOLDS.EXCELLENT_MIN) return EVENT_COLORS.EXCELLENT; // green
    if (intensity >= INTENSITY_THRESHOLDS.GOOD_MIN) return EVENT_COLORS.GOOD; // amber
    return EVENT_COLORS.CHALLENGING; // red
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= INTENSITY_THRESHOLDS.EXCELLENT_MIN) return 'Excellent';
    if (intensity >= INTENSITY_THRESHOLDS.GOOD_MIN) return 'Good';
    return 'Fair';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
            Your {year} Solar Return
          </h2>
          <p className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 m-0">
            <Calendar size={16} />
            Solar Return:{' '}
            {new Date(returnDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              <Download size={18} />
              Save
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-medium transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Sun House Interpretation */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Star className="text-amber-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
            Sun in {HOUSE_NAMES[interpretation.sunHouse.house]}
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed m-0 mb-4">
          {interpretation.sunHouse.interpretation}
        </p>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Your Focus This Year:
          </h4>
          <div className="flex flex-wrap gap-2">
            {interpretation.sunHouse.focus.map((focus, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
              >
                {focus}
              </span>
            ))}
          </div>
        </div>

        {interpretation.themes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Yearly Themes:
            </h4>
            <div className="flex flex-wrap gap-2">
              {interpretation.themes.map((theme, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Moon Phase */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">{MOON_PHASE_EMOJIS[interpretation.moonPhase.phase]}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
            Moon Phase: {interpretation.moonPhase.phase.replace('-', ' ')}
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed m-0 mb-4">
          {interpretation.moonPhase.interpretation}
        </p>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>Energy:</strong> {interpretation.moonPhase.energy}
        </div>

        {interpretation.moonPhase.advice && interpretation.moonPhase.advice.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Moon Phase Advice:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {interpretation.moonPhase.advice.map((advice, index) => (
                <li key={index}>{advice}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Lucky Days */}
      {interpretation.luckyDays && interpretation.luckyDays.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Star className="text-amber-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">Lucky Days</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interpretation.luckyDays.slice(0, 10).map((day, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex-1 mx-3 truncate">
                  {day.reason}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getIntensityColor(day.intensity) }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {getIntensityLabel(day.intensity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Challenges */}
      {interpretation.challenges && interpretation.challenges.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
              Challenges & Growth Opportunities
            </h3>
          </div>

          <div className="space-y-4">
            {interpretation.challenges.map((challenge, index) => (
              <div
                key={index}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg"
              >
                <div className="mb-2">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white m-0">
                    {challenge.area}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 m-0 mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Lightbulb size={16} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>Advice:</strong> {challenge.advice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Opportunities */}
      {interpretation.opportunities && interpretation.opportunities.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
              Opportunities
            </h3>
          </div>

          <div className="space-y-4">
            {interpretation.opportunities.map((opportunity, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={20} className="text-green-500" />
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white m-0">
                    {opportunity.area}
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 m-0 mb-2">
                  {opportunity.description}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Timing:</strong> {opportunity.timing}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* General Advice */}
      {interpretation.advice && interpretation.advice.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-indigo-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
              Your Advice for {year}
            </h3>
          </div>

          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {interpretation.advice.map((advice, index) => (
              <li key={index}>{advice}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Keywords */}
      {interpretation.keywords && interpretation.keywords.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white m-0 mb-3">
            Keywords for {year}
          </h3>
          <div className="flex flex-wrap gap-2">
            {interpretation.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-400 dark:text-gray-500 italic max-w-2xl mx-auto">
          This solar return reading is based on your natal chart and the exact return of the Sun to
          its natal position. The influences described are potentials that you can work with during
          this birthday year.
        </p>
      </div>
    </div>
  );
};

export default SolarReturnInterpretation;
