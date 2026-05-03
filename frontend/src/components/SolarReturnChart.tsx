/**
 * Solar Return Chart Component
 * Visualizes the solar return chart wheel with planets, houses, and aspects
 */

import React, { useState, useEffect, useCallback } from 'react';



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
  const [loading] = useState(false);
  const [selectedPlanet] = useState<string | null>(null);
  const [hoveredAspect] = useState<Aspect | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const drawChart = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, zoom, showAspects, showHouses]);

  useEffect(() => {
    if (canvasRef.current && chartData) {
      drawChart();
    }
  }, [chartData, drawChart]);

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
    <div role="region" aria-label="Solar Return Chart" className="space-y-4" ref={containerRef}>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white m-0">Solar Return Chart for {year}</h3>
        {location && <p className="mt-1 text-slate-200 text-sm">{location}</p>}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button type="button" title="Zoom out" onClick={handleZoomOut} disabled={zoom <= 0.5} className="p-2 rounded-lg bg-white/15 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>zoom_out</span>
        </button>
        <span className="text-sm text-slate-200 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <button type="button" title="Zoom in" onClick={handleZoomIn} disabled={zoom >= 2} className="p-2 rounded-lg bg-white/15 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>zoom_in</span>
        </button>

        <button type="button" onClick={handleDownload} title="Download as PNG" className="flex items-center gap-1 ml-4 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/15 text-sm text-slate-200 transition-colors">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>download</span>
          Download
        </button>
      </div>

      <div className="relative flex justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cosmic-page/80 z-10">
            <span className="material-symbols-outlined animate-spin text-primary" aria-hidden="true" style={{ fontSize: '32px' }}>progress_activity</span>
            <p aria-live="polite" className="mt-2 text-slate-200">Calculating chart...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Solar return chart showing planetary positions for ${year}${location ? ` at ${location}` : ''}`}
          width={600}
          height={600}
          className="max-w-full h-auto"
        />
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-white mb-3">Planets</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PLANET_SYMBOLS).map(([name, symbol]) => (
            <div key={name} className="flex items-center gap-1.5 text-sm">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PLANET_COLORS[name] }}
              />
              <span className="text-white">{symbol}</span>
              <span className="text-slate-200 capitalize">{name}</span>
            </div>
          ))}
        </div>

        {showAspects && (
          <>
            <h4 className="text-sm font-semibold text-white mt-4 mb-3">Aspects</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ASPECT_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="w-4 h-0.5 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-200 capitalize">{name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPlanet && (
        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">{selectedPlanet}</h4>
          {chartData.planets
            .filter((p) => p.planet === selectedPlanet)
            .map((planet) => (
              <div key={planet.planet} className="space-y-1 text-sm text-slate-200">
                <p className="m-0"><strong>Sign:</strong> {planet.sign} {planet.degree}&deg;{planet.minute}&apos;</p>
                <p className="m-0"><strong>House:</strong> {planet.house}</p>
                {planet.retrograde && <p className="m-0"><strong>Retrograde</strong></p>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SolarReturnChart;
