/**
 * Ephemeris Page
 *
 * Shows planetary ephemeris data (current planetary positions)
 * Uses the useTodayTransits hook to fetch current transit data
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTodayTransits } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';

// Aspect label mapping
const ASPECT_LABELS: Record<string, string> = {
  conjunction: 'Conjunction',
  opposition: 'Opposition',
  trine: 'Trine',
  square: 'Square',
  sextile: 'Sextile',
  quincunx: 'Quincunx',
  semisextile: 'Semi-Sextile',
};

// Planet symbol mapping (for display in transit cards)
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
  northnode: '☊',
  southnode: '☋',
  chiron: '⚷',
};

// Planet colors for display
const PLANET_COLORS: Record<string, string> = {
  sun: 'text-yellow-500',
  moon: 'text-slate-300',
  mercury: 'text-amber-400',
  venus: 'text-pink-400',
  mars: 'text-red-500',
  jupiter: 'text-orange-500',
  saturn: 'text-indigo-400',
  uranus: 'text-cyan-400',
  neptune: 'text-blue-400',
  pluto: 'text-rose-400',
  northnode: 'text-purple-400',
  southnode: 'text-purple-300',
  chiron: 'text-teal-400',
};

interface TransitItem {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
}

interface GroupedTransits {
  [planet: string]: TransitItem[];
}

const EphemerisPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useTodayTransits();

  // Group transits by transit planet
  const groupedTransits = useMemo<GroupedTransits>(() => {
    if (!data?.transits || !Array.isArray(data.transits)) return {};

    const grouped: GroupedTransits = {};
    for (const transit of data.transits) {
      const planet = transit.transitPlanet;
      if (!grouped[planet]) {
        grouped[planet] = [];
      }
      grouped[planet].push(transit);
    }
    return grouped;
  }, [data?.transits]);

  // Format the date for display
  const formattedDate = useMemo(() => {
    if (!data?.date) return null;
    try {
      const dateStr = data.date.includes('T') ? data.date : `${data.date}T12:00:00Z`;
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return data.date;
    }
  }, [data?.date]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-page p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Ephemeris</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-cosmic-page p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Ephemeris</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-2 block">
            cloud_off
          </span>
          <h3 className="text-red-400 font-semibold mb-1">Unable to load transit data</h3>
          <p className="text-red-300/70 text-sm mb-4">
            {getErrorMessage(error, "Failed to fetch today's transits")}
          </p>
          <button
            onClick={() => void refetch()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state (no data at all)
  if (!data) {
    return (
      <div className="min-h-screen bg-cosmic-page p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Ephemeris</h1>
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-slate-500 text-5xl block mb-3">
            planet
          </span>
          <h3 className="text-white font-semibold mb-2">No transit data available</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Create a natal chart first to see how current planetary positions affect your birth chart.
          </p>
        </div>
      </div>
    );
  }

  // Render empty transits (data loaded but no active transits)
  const hasTransits = data.transits && Array.isArray(data.transits) && data.transits.length > 0;

  return (
    <div className="min-h-screen bg-cosmic-page p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ephemeris</h1>
          <p className="text-slate-400 text-sm">Current planetary positions and active transits</p>
        </div>
        <button
          onClick={() => void refetch()}
          aria-label="Refresh transit data"
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {/* Date Display */}
      {formattedDate && (
        <div className="mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
            <span className="text-white font-medium">{formattedDate}</span>
          </div>
        </div>
      )}

      {/* Transit Planetary Positions */}
      {data.transitPlanets && Object.keys(data.transitPlanets).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">public</span>
            Current Planetary Positions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(data.transitPlanets).map(([planetName, position]) => {
              const pos = position as { sign?: string; degree?: number; retrograde?: boolean };
              const displayName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
              const symbol = PLANET_SYMBOLS[planetName] || '';
              const color = PLANET_COLORS[planetName] || 'text-slate-300';

              return (
                <motion.div
                  key={planetName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-center hover:bg-white/8 transition-colors"
                >
                  <div className={`text-2xl mb-1 ${color}`}>{symbol}</div>
                  <div className="text-white text-sm font-medium">{displayName}</div>
                  <div className="text-slate-400 text-xs capitalize">
                    {pos.sign} {typeof pos.degree === 'number' ? pos.degree.toFixed(1) : ''}°
                  </div>
                  {pos.retrograde && (
                    <span className="text-xs text-red-400 font-medium">℞</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Transits */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">swap_horiz</span>
          Active Transits
        </h2>

        {!hasTransits ? (
          <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-slate-500 text-3xl block mb-2">
              check_circle
            </span>
            <h3 className="text-white font-medium mb-1">No major transits today</h3>
            <p className="text-slate-400 text-sm">The current planetary positions show no major aspects to your natal chart.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTransits).map(([planet, transits]) => {
              const symbol = PLANET_SYMBOLS[planet] || '';
              const color = PLANET_COLORS[planet] || 'text-slate-300';
              const displayName = planet.charAt(0).toUpperCase() + planet.slice(1);
              const transitCount = transits.length;

              return (
                <motion.div
                  key={planet}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  {/* Planet header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-2xl ${color}`}>{symbol}</span>
                    <div>
                      <h3 className="text-white font-semibold">{displayName}</h3>
                      <p className="text-slate-500 text-xs">
                        {transitCount} active transit{transitCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Transit details */}
                  <div className="space-y-2 ml-9">
                    {transits.map((transit, idx) => {
                      const natalPlanetSymbol = PLANET_SYMBOLS[transit.natalPlanet?.toLowerCase()] || '';
                      const natalPlanetName = transit.natalPlanet;
                      const aspectLabel = ASPECT_LABELS[transit.aspect?.toLowerCase()] || transit.aspect;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-300">
                              {natalPlanetSymbol} {natalPlanetName}
                            </span>
                            <span className="text-primary font-medium">{aspectLabel}</span>
                          </div>
                          <span className="text-slate-500 text-xs">
                            Orb: {transit.orb.toFixed(1)}°
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {data.date && (
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            Last updated: {formattedDate || data.date}
          </p>
        </div>
      )}
    </div>
  );
};

export default EphemerisPage;
