/**
 * NatalChartDetailPage Component
 *
 * Detailed view of a natal chart with:
 * - Chart header with name and birth data
 * - Interactive SVG chart wheel
 * - Big Three section
 * - Planetary positions table
 * - Aspect grid
 * - Elemental balance
 * - House cusps
 * - Action buttons
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCharts } from '../hooks/useCharts';
import { Button } from '../components/ui/Button';

type DetailTab = 'personality' | 'houses' | 'aspects' | 'report';

interface PlanetPosition {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  isRetrograde?: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  orbMinutes: number;
}

const PLANETS: PlanetPosition[] = [
  { name: 'Sun', symbol: 'sunny', sign: 'Capricorn', degree: 24, minute: 50, house: 10 },
  { name: 'Moon', symbol: 'dark_mode', sign: 'Pisces', degree: 12, minute: 10, house: 5 },
  { name: 'Mercury', symbol: 'public', sign: 'Aquarius', degree: 5, minute: 22, house: 4, isRetrograde: true },
  { name: 'Venus', symbol: 'favorite', sign: 'Capricorn', degree: 18, minute: 45, house: 3 },
  { name: 'Mars', symbol: 'local_fire_department', sign: 'Sagittarius', degree: 29, minute: 1, house: 2 },
  { name: 'Jupiter', symbol: 'bolt', sign: 'Cancer', degree: 4, minute: 15, house: 9 },
  { name: 'Saturn', symbol: 'circle', sign: 'Pisces', degree: 15, minute: 30, house: 5 },
  { name: 'Uranus', symbol: 'explore', sign: 'Virgo', degree: 22, minute: 0, house: 8 },
  { name: 'Neptune', symbol: 'water_drop', sign: 'Scorpio', degree: 18, minute: 45, house: 7 },
  { name: 'Pluto', symbol: 'trip_origin', sign: 'Libra', degree: 8, minute: 30, house: 6 },
];

const ASPECTS: Aspect[] = [
  { planet1: 'Sun', planet2: 'Mars', type: 'trine', orb: 0, orbMinutes: 12 },
  { planet1: 'Moon', planet2: 'Jupiter', type: 'square', orb: 2, orbMinutes: 5 },
  { planet1: 'Venus', planet2: 'Mercury', type: 'sextile', orb: 1, orbMinutes: 30 },
  { planet1: 'Sun', planet2: 'Saturn', type: 'opposition', orb: 3, orbMinutes: 20 },
];

const ELEMENT_DATA = {
  fire: { percentage: 25, signs: ['Aries', 'Leo', 'Sagittarius'] },
  earth: { percentage: 35, signs: ['Taurus', 'Virgo', 'Capricorn'] },
  air: { percentage: 20, signs: ['Gemini', 'Libra', 'Aquarius'] },
  water: { percentage: 20, signs: ['Cancer', 'Scorpio', 'Pisces'] },
};

const ZODIAC_COLORS: Record<string, string> = {
  Aries: '#ef4444',
  Taurus: '#22c55e',
  Gemini: '#38bdf8',
  Cancer: '#6366f1',
  Leo: '#f59e0b',
  Virgo: '#84cc16',
  Libra: '#ec4899',
  Scorpio: '#8b5cf6',
  Sagittarius: '#f97316',
  Capricorn: '#78716c',
  Aquarius: '#06b6d4',
  Pisces: '#a855f7',
};

const ASPECT_CONFIG = {
  conjunction: { color: 'text-slate-400', bgColor: 'bg-slate-500/10', icon: 'circle' },
  opposition: { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: 'remove' },
  trine: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: 'change_history' },
  square: { color: 'text-red-400', bgColor: 'bg-red-500/10', icon: 'square' },
  sextile: { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: 'emergency' },
};

export const NatalChartDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChart, loadChart, isLoading } = useCharts();

  const [activeTab, setActiveTab] = useState<DetailTab>('personality');
  const [_hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      void loadChart(id);
    }
  }, [id, loadChart]);

  const _handleDelete = useCallback(() => {
    // Implement delete confirmation
    console.log('Delete chart:', id);
  }, [id]);

  const handleDownload = useCallback(() => {
    // Implement chart download
    console.log('Download chart:', id);
  }, [id]);

  const handleShare = useCallback(() => {
    // Implement chart sharing
    console.log('Share chart:', id);
  }, [id]);

  if (isLoading || !currentChart) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  const chartName = currentChart.name || 'Birth Chart';
  const birthDate = currentChart.birthData?.birthDate
    ? new Date(currentChart.birthData.birthDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const birthTime = currentChart.birthData?.birthTime ?? '';
  const birthLocation = currentChart.birthData?.birthPlace ?? '';

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/5 bg-card-dark/90 backdrop-blur-md px-6 py-3 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 text-primary">
              <span className="material-symbols-outlined text-3xl">token</span>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">AstroVerse</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/dashboard"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
            <a className="text-white text-sm font-medium transition-colors">Charts</a>
            <a
              href="/transits"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Transits
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              className="bg-card-dark border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
              placeholder="Search charts..."
            />
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-primary">person</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="flex w-full h-full z-10">
          {/* LEFT SIDEBAR: Planetary Positions */}
          <aside className="w-80 border-r border-white/5 bg-deep-navy/50 flex flex-col h-full overflow-hidden shrink-0 hidden lg:flex">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">planet</span>
                Planetary Positions
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="text-xs text-slate-400 uppercase tracking-wider sticky top-0 bg-deep-navy z-10">
                  <tr>
                    <th className="pb-3 pl-2 font-medium">Planet</th>
                    <th className="pb-3 font-medium">Pos</th>
                    <th className="pb-3 pr-2 text-right font-medium">House</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {PLANETS.map((planet) => (
                    <tr
                      key={planet.name}
                      className="group hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pl-2 flex items-center gap-3">
                        <div
                          className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            planet.name === 'Sun' && 'bg-orange-500/10 text-orange-400',
                            planet.name === 'Moon' && 'bg-blue-500/10 text-blue-400',
                            planet.name === 'Mercury' && 'bg-slate-500/10 text-slate-400',
                            planet.name === 'Venus' && 'bg-pink-500/10 text-pink-400',
                            planet.name === 'Mars' && 'bg-red-600/10 text-red-500',
                            planet.name === 'Jupiter' && 'bg-purple-500/10 text-purple-400',
                            planet.name === 'Saturn' && 'bg-yellow-600/10 text-yellow-600',
                            planet.name === 'Uranus' && 'bg-cyan-500/10 text-cyan-400',
                            planet.name === 'Neptune' && 'bg-indigo-500/10 text-indigo-400',
                            planet.name === 'Pluto' && 'bg-rose-500/10 text-rose-400'
                          )}
                        >
                          <span
                            className={clsx(
                              'material-symbols-outlined',
                              planet.isRetrograde && 'relative'
                            )}
                          >
                            {planet.symbol}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{planet.name}</span>
                          {planet.isRetrograde && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 px-1 rounded w-fit">
                              Retro
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-xs text-slate-300">
                            <span style={{ color: ZODIAC_COLORS[planet.sign] }}>
                              {planet.symbol}
                            </span>{' '}
                            {planet.sign.slice(0, 3)}
                          </div>
                          <span className="text-xs text-slate-500">
                            {planet.degree}°{planet.minute}&apos;
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 text-right text-slate-400 group-hover:text-primary">
                        {planet.house}
                        {['1', '2', '3'].includes(planet.house.toString().slice(-1)) && 'st'}
                        {['4', '5', '6'].includes(planet.house.toString().slice(-1)) && 'th'}
                        {['7', '8', '9'].includes(planet.house.toString().slice(-1)) && 'th'}
                        {!['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(
                          planet.house.toString().slice(-1)
                        ) && 'th'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>

          {/* CENTER STAGE: Chart & Main Info */}
          <section className="flex-1 flex flex-col h-full min-w-0 bg-deep-navy relative">
            {/* Header Breadcrumbs & Actions */}
            <div className="px-8 py-6 flex flex-wrap justify-between items-start gap-4 z-20">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <a
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Dashboard
                  </a>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <a
                    href="/charts"
                    className="hover:text-primary transition-colors"
                  >
                    Charts
                  </a>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-white">{chartName}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {chartName}
                </h1>
                <div className="flex items-center gap-2 text-sm font-mono text-slate-400 mt-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>{birthDate}</span>
                  {birthTime && (
                    <>
                      <span className="mx-1 text-slate-600">•</span>
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{birthTime}</span>
                    </>
                  )}
                  <span className="mx-1 text-slate-600">•</span>
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>{birthLocation}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/charts/${id}/edit`)}
                  className="w-10 h-10 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="w-10 h-10 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </Button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/transits?chart=${id}`)}
                >
                  View Transits
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </div>
            </div>

            {/* Chart Wheel Display */}
            <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-hidden">
              <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center rounded-full bg-deep-navy shadow-[0_0_20px_rgba(107,61,225,0.1)]">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 bg-card-dark" />

                {/* Zodiac Ring */}
                <div className="absolute inset-[10px] rounded-full border-[20px] border-deep-navy flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full opacity-80" viewBox="0 0 100 100">
                    {Object.entries(ZODIAC_COLORS).map(([sign, color], index) => {
                      const rotation = index * 30;
                      return (
                        <circle
                          key={sign}
                          cx="50"
                          cy="50"
                          fill="none"
                          r="45"
                          stroke={color}
                          strokeDasharray="23 260"
                          strokeWidth="10"
                          transform={`rotate(${rotation} 50 50)`}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Houses Ring */}
                <div className="absolute inset-[40px] rounded-full border border-white/20 flex items-center justify-center">
                  {[0, 30, 60, 90, 120, 150].map((rotation) => (
                    <div
                      key={rotation}
                      className="absolute w-full h-[1px] bg-white/10"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  ))}
                </div>

                {/* Aspect Lines */}
                <div className="absolute inset-[80px] rounded-full flex items-center justify-center z-10">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                    {/* Trines */}
                    <line
                      opacity="0.8"
                      stroke="#3b82f6"
                      strokeWidth="0.5"
                      x1="50"
                      x2="85"
                      y1="10"
                      y2="70"
                    />
                    <line
                      opacity="0.8"
                      stroke="#3b82f6"
                      strokeWidth="0.5"
                      x1="85"
                      x2="15"
                      y1="70"
                      y2="70"
                    />
                    {/* Squares */}
                    <line
                      opacity="0.8"
                      stroke="#ef4444"
                      strokeWidth="0.5"
                      x1="50"
                      x2="90"
                      y1="10"
                      y2="50"
                    />
                    {/* Sextiles */}
                    <line
                      opacity="0.6"
                      stroke="#22c55e"
                      strokeDasharray="2 1"
                      strokeWidth="0.5"
                      x1="10"
                      x2="30"
                      y1="50"
                      y2="85"
                    />
                  </svg>
                </div>

                {/* Planets */}
                <div
                  className="absolute top-[10%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform cursor-pointer group"
                  onMouseEnter={() => setHoveredPlanet('Sun')}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <div className="w-7 h-7 bg-card-dark border border-orange-400 rounded-full flex items-center justify-center text-orange-400 shadow-lg">
                    <span className="material-symbols-outlined text-[16px]">sunny</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card-dark border border-white/10 px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    Sun in Capricorn
                  </div>
                </div>

                <div
                  className="absolute top-[70%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform cursor-pointer group"
                  onMouseEnter={() => setHoveredPlanet('Moon')}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <div className="w-7 h-7 bg-card-dark border border-blue-400 rounded-full flex items-center justify-center text-blue-400 shadow-lg">
                    <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                  </div>
                </div>

                <div
                  className="absolute top-[50%] right-[10%] -translate-x-1/2 -translate-y-1/2 z-20 hover:scale-125 transition-transform cursor-pointer group"
                  onMouseEnter={() => setHoveredPlanet('Mars')}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <div className="w-7 h-7 bg-card-dark border border-red-500 rounded-full flex items-center justify-center text-red-500 shadow-lg">
                    <span className="material-symbols-outlined text-[16px]">
                      local_fire_department
                    </span>
                  </div>
                </div>

                {/* Inner Hub */}
                <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-deep-navy border border-white/10 flex flex-col items-center justify-center z-20">
                  <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                    {chartName.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Tab Navigation */}
            <div className="bg-card-dark/50 backdrop-blur-sm border-t border-white/5 px-8 pt-0">
              <div className="flex items-end gap-8 overflow-x-auto">
                {(
                  [
                    { id: 'personality' as DetailTab, label: 'Personality Analysis', icon: 'psychology' },
                    { id: 'houses' as DetailTab, label: 'House Interpretations', icon: 'home' },
                    { id: 'aspects' as DetailTab, label: 'Aspects Detail', icon: 'hub' },
                    { id: 'report' as DetailTab, label: 'Download Report', icon: 'description' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'pb-4 pt-4 border-b-2 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors',
                      activeTab === tab.id
                        ? 'border-primary text-white'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR: Insights & Aspects */}
          <aside className="w-80 xl:w-96 border-l border-white/5 bg-deep-navy/50 flex flex-col h-full overflow-hidden shrink-0 hidden md:flex">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                Analysis Overview
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {/* Big Three Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  The Big Three
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Sun', sign: 'Capricorn', desc: 'Ambitious, disciplined, and practical' },
                    { name: 'Moon', sign: 'Pisces', desc: 'Highly intuitive and empathetic' },
                    { name: 'Rising', sign: 'Leo', desc: 'Charismatic and bold' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="bg-card-dark border border-white/5 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={clsx(
                              'w-8 h-8 rounded-full flex items-center justify-center',
                              item.name === 'Sun' && 'bg-orange-500/10 text-orange-400',
                              item.name === 'Moon' && 'bg-blue-500/10 text-blue-400',
                              item.name === 'Rising' && 'bg-yellow-500/10 text-yellow-400'
                            )}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {item.name === 'Sun' ? 'sunny' : item.name === 'Moon' ? 'dark_mode' : 'arrow_upward'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold">
                              {item.name} in {item.sign}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                              {item.name === 'Sun' ? 'Identity' : item.name === 'Moon' ? 'Emotions' : 'Persona'}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary text-[16px]">
                          open_in_new
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Aspects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Major Aspects
                  </h4>
                  <button className="text-[10px] text-primary hover:text-white transition-colors">
                    View All
                  </button>
                </div>
                <div className="bg-card-dark rounded-xl border border-white/5 overflow-hidden">
                  {ASPECTS.map((aspect, index) => (
                    <div
                      key={index}
                      className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-card-dark flex items-center justify-center z-10">
                            <span className="material-symbols-outlined text-[12px]">
                              {aspect.planet1 === 'Sun' ? 'sunny' : aspect.planet1 === 'Moon' ? 'dark_mode' : 'bolt'}
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 border border-card-dark flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">
                              {aspect.planet2 === 'Mars' ? 'local_fire_department' : aspect.planet2 === 'Jupiter' ? 'bolt' : 'public'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white group-hover:text-primary">
                            {aspect.planet1} {aspect.type.charAt(0).toUpperCase() + aspect.type.slice(1)} {aspect.planet2}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Orb: {aspect.orb}°{aspect.orbMinutes}&apos;
                          </span>
                        </div>
                      </div>
                      <div
                        className={clsx(
                          'w-6 h-6 rounded-full flex items-center justify-center',
                          ASPECT_CONFIG[aspect.type].bgColor,
                          ASPECT_CONFIG[aspect.type].color
                        )}
                        title={aspect.type}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {aspect.type === 'trine' ? 'check_circle' : aspect.type === 'square' ? 'error' : 'stars'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elemental Balance */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Elemental Balance
                </h4>
                <div className="space-y-3">
                  {Object.entries(ELEMENT_DATA).map(([element, data]) => (
                    <div key={element}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white capitalize">{element}</span>
                        <span className="text-slate-400">{data.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            element === 'fire' && 'bg-orange-500',
                            element === 'earth' && 'bg-green-500',
                            element === 'air' && 'bg-yellow-400',
                            element === 'water' && 'bg-blue-500'
                          )}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NatalChartDetailPage;
