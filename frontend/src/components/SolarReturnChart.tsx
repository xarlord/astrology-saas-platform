/**
 * Solar Return Chart Component
 * Visualizes the solar return chart wheel with planets, houses, and aspects
 */

import React, { useState, useEffect } from 'react';
import { Loader2, ZoomIn, ZoomOut, Download } from 'lucide-react';
import './SolarReturnChart.css';

interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
}

interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  minute: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

interface SolarReturnChartData {
  planets: PlanetaryPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: {
    sign: string;
    degree: number;
    minute: number;
  };
  mc: {
    sign: string;
    degree: number;
    minute: number;
  };
  moonPhase: {
    phase: string;
    illumination: number;
  };
}

interface SolarReturnChartProps {
  chartData: SolarReturnChartData;
  year: number;
  location?: string;
  showAspects?: boolean;
  showHouses?: boolean;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#FFD700',
  moon: '#C0C0C0',
  mercury: '#8B4513',
  venus: '#FF69B4',
  mars: '#FF0000',
  jupiter: '#FFA500',
  saturn: '#696969',
  uranus: '#40E0D0',
  neptune: '#4169E1',
  pluto: '#8B0000',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#FF0000',
  opposition: '#FF0000',
  trine: '#00FF00',
  square: '#FF6600',
  sextile: '#00BFFF',
  'semi-sextile': '#9370DB',
  quincunx: '#9932CC',
};

export const SolarReturnChart: React.FC<SolarReturnChartProps> = ({
  chartData,
  year,
  location,
  showAspects = true,
  showHouses = true,
}) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredAspect, setHoveredAspect] = useState<Aspect | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && chartData) {
      drawChart();
    }
  }, [chartData, zoom, showAspects, showHouses]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (Math.min(canvas.width, canvas.height) / 2 - 40) * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw zodiac wheel
    drawZodiacWheel(ctx, centerX, centerY, radius);

    // Draw houses
    if (showHouses) {
      drawHouses(ctx, centerX, centerY, radius);
    }

    // Draw planets
    drawPlanets(ctx, centerX, centerY, radius);

    // Draw aspects
    if (showAspects) {
      drawAspects(ctx, centerX, centerY, radius);
    }

    // Draw labels
    drawLabels(ctx, centerX, centerY, radius);
  };

  const drawZodiacWheel = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const signs = Object.keys(ZODIAC_SYMBOLS);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw sign divisions
    signs.forEach((sign, index) => {
      const startAngle = (index * 30 - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * 30 - 90) * (Math.PI / 180);

      // Draw sign sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = index % 2 === 0 ? '#f7fafc' : '#edf2f7';
      ctx.fill();
      ctx.stroke();

      // Draw sign symbol
      const symbolAngle = startAngle + 15 * (Math.PI / 180);
      const symbolX = cx + (r - 20) * Math.cos(symbolAngle);
      const symbolY = cy + (r - 20) * Math.sin(symbolAngle);

      ctx.font = '20px Arial';
      ctx.fillStyle = '#2d3748';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ZODIAC_SYMBOLS[sign], symbolX, symbolY);
    });

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, 2 * Math.PI);
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawHouses = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    chartData.houses.forEach((house) => {
      const angle = (house.degree + (house.house - 1) * 30 - 90) * (Math.PI / 180);

      // Draw house cusp line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + r * 0.7 * Math.cos(angle),
        cy + r * 0.7 * Math.sin(angle)
      );
      ctx.strokeStyle = '#a0aec0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw house number
      const textAngle = angle + 15 * (Math.PI / 180);
      const textX = cx + r * 0.35 * Math.cos(textAngle);
      const textY = cy + r * 0.35 * Math.sin(textAngle);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#4a5568';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(house.house.toString(), textX, textY);
    });
  };

  const drawPlanets = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    chartData.planets.forEach((planet) => {
      const angle = (planet.degree + (getSignIndex(planet.sign) * 30) - 90) * (Math.PI / 180);
      const distance = r * 0.85;

      const x = cx + distance * Math.cos(angle);
      const y = cy + distance * Math.sin(angle);

      // Draw planet circle
      ctx.beginPath();
      ctx.arc(x, y, selectedPlanet === planet.planet ? 16 : 12, 0, 2 * Math.PI);
      ctx.fillStyle = PLANET_COLORS[planet.planet];
      ctx.fill();
      ctx.strokeStyle = selectedPlanet === planet.planet ? '#2d3748' : '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw planet symbol
      ctx.font = '16px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(PLANET_SYMBOLS[planet.planet], x, y);

      // Draw retrograde symbol if applicable
      if (planet.retrograde) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Ⓡ', x, y - 8);
      }
    });
  };

  const drawAspects = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const planetPositions = new Map<string, { x: number; y: number }>();

    chartData.planets.forEach((planet) => {
      const angle = (planet.degree + (getSignIndex(planet.sign) * 30) - 90) * (Math.PI / 180);
      const distance = r * 0.85;
      const x = cx + distance * Math.cos(angle);
      const y = cy + distance * Math.sin(angle);
      planetPositions.set(planet.planet, { x, y });
    });

    chartData.aspects.forEach((aspect) => {
      const pos1 = planetPositions.get(aspect.planet1);
      const pos2 = planetPositions.get(aspect.planet2);

      if (pos1 && pos2) {
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.strokeStyle = ASPECT_COLORS[aspect.type];
        ctx.lineWidth = hoveredAspect === aspect ? 3 : 1;
        ctx.globalAlpha = hoveredAspect && hoveredAspect !== aspect ? 0.2 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw aspect symbol in middle
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        ctx.beginPath();
        ctx.arc(midX, midY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = ASPECT_COLORS[aspect.type];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };

  const drawLabels = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    // Draw ASC label
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#2d3748';
    ctx.textAlign = 'center';
    ctx.fillText('ASC', cx, cy - r - 20);

    // Draw MC label
    ctx.fillText('MC', cx, cy - r * 0.7 - 10);

    // Draw moon phase
    const phaseEmoji = getMoonPhaseEmoji(chartData.moonPhase.phase);
    ctx.font = '24px Arial';
    ctx.fillText(phaseEmoji, cx + r + 30, cy);

    ctx.font = '10px Arial';
    ctx.fillStyle = '#718096';
    ctx.fillText(`${chartData.moonPhase.illumination}%`, cx + r + 30, cy + 20);
  };

  const getSignIndex = (sign: string): number => {
    const signs = Object.keys(ZODIAC_SYMBOLS);
    return signs.indexOf(sign);
  };

  const getMoonPhaseEmoji = (phase: string): string => {
    const emojis: Record<string, string> = {
      'new': '🌑',
      'waxing-crescent': '🌒',
      'first-quarter': '🌓',
      'waxing-gibbous': '🌔',
      'full': '🌕',
      'waning-gibbous': '🌖',
      'last-quarter': '🌗',
      'waning-crescent': '🌘',
    };
    return emojis[phase] || '🌑';
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `solar-return-${year}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="solar-return-chart" ref={containerRef}>
      <div className="chart-header">
        <h3>Solar Return Chart for {year}</h3>
        {location && <p className="location">{location}</p>}
      </div>

      <div className="chart-controls">
        <button onClick={handleZoomOut} disabled={zoom <= 0.5}>
          <ZoomOut size={18} />
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} disabled={zoom >= 2}>
          <ZoomIn size={18} />
        </button>

        <button onClick={handleDownload} title="Download as PNG">
          <Download size={18} />
          Download
        </button>
      </div>

      <div className="chart-canvas-container">
        {loading && (
          <div className="chart-loading">
            <Loader2 size={32} className="spinner" />
            <p>Calculating chart...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="chart-canvas"
        />
      </div>

      <div className="chart-legend">
        <h4>Planets</h4>
        <div className="legend-items">
          {Object.entries(PLANET_SYMBOLS).map(([name, symbol]) => (
            <div key={name} className="legend-item">
              <span
                className="planet-dot"
                style={{ backgroundColor: PLANET_COLORS[name] }}
              />
              <span className="planet-symbol">{symbol}</span>
              <span className="planet-name">{name}</span>
            </div>
          ))}
        </div>

        {showAspects && (
          <>
            <h4>Aspects</h4>
            <div className="legend-items">
              {Object.entries(ASPECT_COLORS).map(([name, color]) => (
                <div key={name} className="legend-item">
                  <span
                    className="aspect-line"
                    style={{ backgroundColor: color }}
                  />
                  <span className="aspect-name">{name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPlanet && (
        <div className="planet-info">
          <h4>{selectedPlanet}</h4>
          {chartData.planets
            .filter((p) => p.planet === selectedPlanet)
            .map((planet) => (
              <div key={planet.planet} className="planet-details">
                <p><strong>Sign:</strong> {planet.sign} {planet.degree}°{planet.minute}'</p>
                <p><strong>House:</strong> {planet.house}</p>
                {planet.retrograde && <p><strong>Retrograde</strong></p>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SolarReturnChart;
