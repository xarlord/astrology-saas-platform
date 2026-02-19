/**
 * Lunar Chart View Component
 * Visual display of lunar return chart
 */

// import React from 'react';
import { LunarReturnChart, LunarAspect } from '@/services/lunarReturn.api';
import './LunarReturn.css';

interface LunarChartViewProps {
  chart: LunarReturnChart;
  onBack?: () => void;
}

const LunarChartView: React.FC<LunarChartViewProps> = ({ chart, onBack }) => {
  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return 'low';
    if (intensity <= 6) return 'medium';
    if (intensity <= 8) return 'high';
    return 'extreme';
  };

  const getAspectIcon = (type: string): string => {
    const icons: Record<string, string> = {
      conjunction: '☌',
      opposition: '☍',
      trine: '△',
      square: '□',
      sextile: '⚹',
    };
    return icons[type] || '●';
  };

  const getAspectColor = (type: string): string => {
    const colors: Record<string, string> = {
      conjunction: '#FF6B6B',
      opposition: '#4ECDC4',
      trine: '#45B7D1',
      square: '#FFA07A',
      sextile: '#98D8C8',
    };
    return colors[type] || '#CCCCCC';
  };

  const getMoonPhaseIcon = (phase: string): string => {
    const icons: Record<string, string> = {
      'new': '🌑',
      'waxing-crescent': '🌒',
      'first-quarter': '🌓',
      'waxing-gibbous': '🌔',
      'full': '🌕',
      'waning-gibbous': '🌖',
      'last-quarter': '🌗',
      'waning-crescent': '🌘',
    };
    return icons[phase] || '🌙';
  };

  const renderHouseWheel = () => {
    const houses = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentHouse = chart.housePlacement;

    return (
      <div className="house-wheel">
        <svg viewBox="0 0 200 200" className="wheel-svg">
          {/* Outer circle */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="#333" strokeWidth="2" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="#ddd" strokeWidth="1" />

          {/* House lines */}
          {houses.map((house) => {
            const angle = (house - 1) * 30;
            const startAngle = angle - 15;
            const endAngle = angle + 15;
            const startX = 100 + 85 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 100 + 85 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 100 + 85 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 100 + 85 * Math.sin((endAngle * Math.PI) / 180);
            void endX, endY; // Mark as used

            const isCurrentHouse = house === currentHouse;

            return (
              <g key={house}>
                <line
                  x1="100"
                  y1="100"
                  x2={startX}
                  y2={startY}
                  stroke={isCurrentHouse ? '#FF6B6B' : '#ddd'}
                  strokeWidth={isCurrentHouse ? 2 : 1}
                />
                <text
                  x={100 + 70 * Math.cos((angle * Math.PI) / 180)}
                  y={100 + 70 * Math.sin((angle * Math.PI) / 180)}
                  fontSize="10"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isCurrentHouse ? '#FF6B6B' : '#666'}
                  fontWeight={isCurrentHouse ? 'bold' : 'normal'}
                >
                  {house}
                </text>
              </g>
            );
          })}

          {/* Moon indicator */}
          <circle cx="100" cy="100" r="25" fill="#FFFACD" stroke="#333" strokeWidth="2" />
          <text x="100" y="100" fontSize="20" textAnchor="middle" dominantBaseline="middle">
            {getMoonPhaseIcon(chart.moonPhase)}
          </text>
        </svg>
      </div>
    );
  };

  const renderAspect = (aspect: LunarAspect, index: number) => (
    <div key={index} className="aspect-item">
      <div className="aspect-header">
        <span
          className="aspect-symbol"
          style={{ color: getAspectColor(aspect.type) }}
        >
          {getAspectIcon(aspect.type)}
        </span>
        <span className="aspect-type">{aspect.type}</span>
        <span className="aspect-orb">{aspect.orb}° orb</span>
      </div>
      <div className="aspect-planets">
        <span className="planet">{aspect.planets[0]}</span>
        <span className="separator">—</span>
        <span className="planet">{aspect.planets[1]}</span>
      </div>
      <p className="aspect-interpretation">{aspect.interpretation}</p>
      {aspect.applying && <span className="applying-badge">Applying</span>}
    </div>
  );

  return (
    <div className="lunar-chart-view">
      {/* Header */}
      <div className="chart-header">
        {onBack && <button onClick={onBack} className="back-button">← Back</button>}
        <h2>Lunar Return Chart</h2>
        <p className="return-date">
          {new Date(chart.returnDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="chart-content">
        {/* Chart Wheel */}
        <div className="chart-wheel-section">
          <h3>Chart Wheel</h3>
          {renderHouseWheel()}
          <div className="wheel-info">
            <p><strong>Moon in House {chart.housePlacement}</strong></p>
            <p className="house-meaning">
              {getHouseMeaning(chart.housePlacement)}
            </p>
          </div>
        </div>

        {/* Chart Details */}
        <div className="chart-details">
          {/* Moon Position */}
          <div className="moon-position-card">
            <h3>Moon Position</h3>
            <div className="position-details">
              <div className="position-row">
                <span className="label">Sign:</span>
                <span className="value">{chart.moonPosition.sign}</span>
              </div>
              <div className="position-row">
                <span className="label">Position:</span>
                <span className="value">
                  {chart.moonPosition.degree}° {chart.moonPosition.minute}' {chart.moonPosition.second}"
                </span>
              </div>
              <div className="position-row">
                <span className="label">Phase:</span>
                <span className="value">
                  {getMoonPhaseIcon(chart.moonPhase)} {chart.moonPhase.replace('-', ' ')}
                </span>
              </div>
              <div className="position-row">
                <span className="label">House:</span>
                <span className="value">House {chart.housePlacement}</span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="theme-card">
            <h3>Monthly Theme</h3>
            <p>{chart.theme}</p>
            <div className={`intensity-badge ${getIntensityColor(chart.intensity)}`}>
              <span className="label">Intensity:</span>
              <span className="value">{chart.intensity}/10</span>
            </div>
          </div>

          {/* Aspects */}
          {chart.aspects && chart.aspects.length > 0 && (
            <div className="aspects-card">
              <h3>Lunar Aspects</h3>
              <div className="aspects-list">
                {chart.aspects.map((aspect: LunarAspect, i: number) => renderAspect(aspect, i))}
              </div>
            </div>
          )}

          {/* No aspects message */}
          {(!chart.aspects || chart.aspects.length === 0) && (
            <div className="no-aspects">
              <p>No major aspects in this lunar return.</p>
              <p className="note">
                The moon is moving freely without strong connections to other planets.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for house meanings
function getHouseMeaning(house: number): string {
  const meanings: Record<number, string> = {
    1: 'Focus on self-identity, new beginnings, and personal initiatives.',
    2: 'Emotional focus on values, finances, and self-worth.',
    3: 'Communication, learning, and connections with your immediate environment.',
    4: 'Home, family, and emotional foundations take priority.',
    5: 'Creativity, romance, and self-expression are highlighted.',
    6: 'Work, service, and daily routines need attention.',
    7: 'Partnerships, relationships, and balance with others.',
    8: 'Deep transformation, intimacy, and shared resources.',
    9: 'Philosophy, travel, and higher learning expand your horizons.',
    10: 'Career, ambition, and public image are in focus.',
    11: 'Friendships, social networks, and community connections.',
    12: 'Spirituality, endings, and the unconscious mind.',
  };
  return meanings[house] || '';
}

export default LunarChartView;
