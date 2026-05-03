/**
 * Ephemeris Page Component
 * Shows current planetary positions and active transits
 */

import { useMemo } from 'react';
import { AppLayout, SkeletonLoader, EmptyState } from '../components';
import { MeteorEffect } from '../components/effects';
import { useTodayTransits } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';
import type { TransitReading } from '../services/transit.service';

interface TransitEntry {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
}

function groupByPlanet(transits: TransitEntry[]): Map<string, TransitEntry[]> {
  const map = new Map<string, TransitEntry[]>();
  for (const t of transits) {
    const existing = map.get(t.transitPlanet) ?? [];
    existing.push(t);
    map.set(t.transitPlanet, existing);
  }
  return map;
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: 'bg-amber-900/30 text-amber-400',
  opposition: 'bg-red-900/30 text-red-400',
  trine: 'bg-green-900/30 text-green-400',
  square: 'bg-orange-900/30 text-orange-400',
  sextile: 'bg-blue-900/30 text-blue-400',
};

function getAspectColorClass(aspect: string): string {
  const normalized = aspect.toLowerCase();
  for (const [key, cls] of Object.entries(ASPECT_COLORS)) {
    if (normalized.includes(key)) return cls;
  }
  return 'bg-white/15 text-slate-200';
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷',
};

function formatAspectLabel(aspect: string): string {
  return aspect.charAt(0).toUpperCase() + aspect.slice(1).toLowerCase();
}

function TransitTable({ data }: { data: TransitReading }) {
  const transits = Array.isArray(data.transits) ? data.transits : [];
  const grouped = useMemo(() => groupByPlanet(transits), [transits]);

  if (transits.length === 0) {
    return (
      <EmptyState
        icon="🌙"
        title="No major transits today"
        description="The sky is relatively quiet right now. Check back later for upcoming astrological events."
        size="medium"
      />
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([planet, entries]) => (
        <div
          key={planet}
          className="glass-panel rounded-2xl border border-white/15 overflow-hidden"
        >
          {/* Planet header */}
          <div className="px-5 py-4 bg-white/15 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {PLANET_SYMBOLS[planet] ?? '◆'}
              </span>
              <div>
                <h4 className="font-semibold text-white">{planet}</h4>
                <p className="text-xs text-slate-200">
                  {entries.length} active {entries.length === 1 ? 'transit' : 'transits'}
                </p>
              </div>
            </div>
          </div>

          {/* Transit entries */}
          <div className="divide-y divide-white/[0.06]">
            {entries.map((entry, index) => (
              <div
                key={`${entry.transitPlanet}-${entry.natalPlanet}-${entry.aspect}-${index}`}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-white font-medium truncate">
                    {PLANET_SYMBOLS[entry.natalPlanet] ?? ''} {entry.natalPlanet}
                  </span>
                  <span className="text-slate-200 text-xs" aria-hidden="true">
                    &#8594;
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getAspectColorClass(entry.aspect)}`}
                  >
                    {formatAspectLabel(entry.aspect)}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-200">
                    Orb: {entry.orb.toFixed(1)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EphemerisPage() {
  const { data, isLoading, error, refetch } = useTodayTransits();

  const lastUpdated = useMemo(() => {
    if (!data?.date) return null;
    try {
      const d = new Date(data.date);
      return d.toLocaleString();
    } catch {
      return data.date;
    }
  }, [data?.date]);

  return (
    <AppLayout>
      <MeteorEffect count={15} />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '22px' }}>public</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Ephemeris</h1>
            <p className="text-slate-200 mt-1">
              Current planetary positions and active transits
            </p>
          </div>
          {data && (
            <button
              onClick={() => void refetch()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-white/15 border border-white/15 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Refresh transit data"
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>refresh</span>
              Refresh
            </button>
          )}
        </div>

        {/* Last updated timestamp */}
        {lastUpdated && (
          <p className="text-sm text-slate-200 flex items-center gap-1.5">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader variant="list" count={4} />
        </div>
      ) : error ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
          title="Unable to load transit data"
          description={getErrorMessage(error, 'Failed to fetch today\'s transits')}
          actionText="Retry"
          onAction={() => void refetch()}
        />
      ) : data ? (
        <TransitTable data={data} />
      ) : (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#8b5cf6' }}>nights_stay</span>}
          title="No transit data available"
          description="Create a natal chart first to see how current planetary positions affect your birth chart."
        />
      )}
    </AppLayout>
  );
}
