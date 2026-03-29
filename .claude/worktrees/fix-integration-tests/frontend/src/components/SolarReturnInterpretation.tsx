/**
 * Solar Return Interpretation Component
 * Displays detailed birthday year themes and interpretations
 */

import React from 'react';
import { Star, Calendar, TrendingUp, AlertTriangle, Gift, Lightbulb, Download, Share2 } from 'lucide-react';
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
  'new': '🌑',
  'waxing-crescent': '🌒',
  'first-quarter': '🌓',
  'waxing-gibbous': '🌔',
  'full': '🌕',
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
    <div className="solar-return-interpretation">
      {/* Header */}
      <div className="interpretation-header">
        <div>
          <h2>Your {year} Solar Return</h2>
          <p className="return-date">
            <Calendar size={16} />
            Solar Return: {new Date(returnDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="header-actions">
          {onDownload && (
            <button onClick={onDownload} className="action-btn">
              <Download size={18} />
              Save
            </button>
          )}
          {onShare && (
            <button onClick={onShare} className="action-btn primary">
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Sun House Interpretation */}
      <section className="interpretation-section sun-house">
        <div className="section-header">
          <Star className="section-icon" size={24} />
          <h3>Sun in {HOUSE_NAMES[interpretation.sunHouse.house]}</h3>
        </div>

        <p className="main-interpretation">{interpretation.sunHouse.interpretation}</p>

        <div className="focus-areas">
          <h4>Your Focus This Year:</h4>
          <div className="focus-tags">
            {interpretation.sunHouse.focus.map((focus, index) => (
              <span key={index} className="focus-tag">
                {focus}
              </span>
            ))}
          </div>
        </div>

        {interpretation.themes.length > 0 && (
          <div className="themes-grid">
            <h4>Yearly Themes:</h4>
            {interpretation.themes.map((theme, index) => (
              <div key={index} className="theme-card">
                {theme}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Moon Phase */}
      <section className="interpretation-section moon-phase">
        <div className="section-header">
          <div className="moon-icon">{MOON_PHASE_EMOJIS[interpretation.moonPhase.phase]}</div>
          <h3>Moon Phase: {interpretation.moonPhase.phase.replace('-', ' ')}</h3>
        </div>

        <p className="moon-interpretation">{interpretation.moonPhase.interpretation}</p>

        <div className="moon-energy">
          <strong>Energy:</strong> {interpretation.moonPhase.energy}
        </div>

        {interpretation.moonPhase.advice && interpretation.moonPhase.advice.length > 0 && (
          <div className="moon-advice">
            <h4>Moon Phase Advice:</h4>
            <ul>
              {interpretation.moonPhase.advice.map((advice, index) => (
                <li key={index}>{advice}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Lucky Days */}
      {interpretation.luckyDays && interpretation.luckyDays.length > 0 && (
        <section className="interpretation-section lucky-days">
          <div className="section-header">
            <Star className="section-icon gold" size={24} />
            <h3>Lucky Days</h3>
          </div>

          <div className="lucky-days-list">
            {interpretation.luckyDays.slice(0, 10).map((day, index) => (
              <div key={index} className="lucky-day-card">
                <div className="day-date">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="day-reason">{day.reason}</div>
                <div className="day-intensity">
                  <span
                    className="intensity-dot"
                    style={{ backgroundColor: getIntensityColor(day.intensity) }}
                  />
                  {getIntensityLabel(day.intensity)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Challenges */}
      {interpretation.challenges && interpretation.challenges.length > 0 && (
        <section className="interpretation-section challenges">
          <div className="section-header">
            <AlertTriangle className="section-icon warning" size={24} />
            <h3>Challenges & Growth Opportunities</h3>
          </div>

          <div className="challenges-list">
            {interpretation.challenges.map((challenge, index) => (
              <div key={index} className="challenge-card">
                <div className="challenge-header">
                  <h4>{challenge.area}</h4>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-advice">
                  <Lightbulb size={16} />
                  <strong>Advice:</strong> {challenge.advice}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Opportunities */}
      {interpretation.opportunities && interpretation.opportunities.length > 0 && (
        <section className="interpretation-section opportunities">
          <div className="section-header">
            <TrendingUp className="section-icon success" size={24} />
            <h3>Opportunities</h3>
          </div>

          <div className="opportunities-list">
            {interpretation.opportunities.map((opportunity, index) => (
              <div key={index} className="opportunity-card">
                <div className="opportunity-header">
                  <Gift size={20} />
                  <h4>{opportunity.area}</h4>
                </div>
                <p className="opportunity-description">{opportunity.description}</p>
                <div className="opportunity-timing">
                  <strong>Timing:</strong> {opportunity.timing}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* General Advice */}
      {interpretation.advice && interpretation.advice.length > 0 && (
        <section className="interpretation-section advice">
          <div className="section-header">
            <Lightbulb className="section-icon" size={24} />
            <h3>Your Advice for {year}</h3>
          </div>

          <ul className="advice-list">
            {interpretation.advice.map((advice, index) => (
              <li key={index}>{advice}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Keywords */}
      {interpretation.keywords && interpretation.keywords.length > 0 && (
        <section className="interpretation-section keywords">
          <h3>Keywords for {year}</h3>
          <div className="keywords-cloud">
            {interpretation.keywords.map((keyword, index) => (
              <span key={index} className="keyword-item">
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="interpretation-footer">
        <p className="disclaimer">
          This solar return reading is based on your natal chart and the exact return of the Sun to its natal position.
          The influences described are potentials that you can work with during this birthday year.
        </p>
      </div>
    </div>
  );
};

export default SolarReturnInterpretation;
