import React, { useState, useCallback, useMemo } from 'react';
import { PlanetSymbol, AspectSymbol, EmptyState } from './';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { INTENSITY_THRESHOLDS, UI, EVENT_COLORS } from '../utils/constants';

// Types based on findings.md
export interface Transit {
  transitingPlanet: string;
  natalPlanet: string;
  type: string;
  orb: number;
  applying: boolean;
  startDate: string;
  endDate: string;
  peakDate: string;
  intensity: number; // 1-10
  interpretation: {
    general: string;
    themes: string[];
    advice: {
      positive: string[];
      challenges: string[];
      suggestions: string[];
    };
  };
}

export interface TransitHighlight {
  type: 'major-transit' | 'moon-phase' | 'eclipse' | 'retrograde';
  title: string;
  date: string;
  description: string;
  icon?: string;
  color?: string;
  intensity?: number;
}

export interface TransitCalendarDay {
  date: string;
  hasMajorTransit: boolean;
  hasMoonPhase: boolean;
  hasEclipse: boolean;
  transits?: Transit[];
  moonPhase?: {
    phase: string;
    icon: string;
  };
}

export interface TransitDashboardData {
  today: Transit[];
  week: Transit[];
  month: TransitCalendarDay[];
  highlights: TransitHighlight[];
}

interface TransitDashboardProps {
  data: TransitDashboardData;
  onDateSelect?: (date: string) => void;
  onTransitClick?: (transit: Transit) => void;
}

export function TransitDashboard({ data, onDateSelect, onTransitClick }: TransitDashboardProps) {
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'calendar' | 'highlights'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Memoized handlers
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  }, [onDateSelect]);

  // Reserved for future use when TransitDashboard needs to handle transit clicks internally
  const _handleTransitClick = useCallback((transit: Transit) => {
    onTransitClick?.(transit);
  }, [onTransitClick]);
  void _handleTransitClick; // Suppress unused warning

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <DateSelector
        viewMode={viewMode}
        onViewChange={setViewMode}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Content based on view mode */}
      {viewMode === 'today' && (
        <TodaysTransits transits={data.today} onTransitClick={onTransitClick} />
      )}
      {viewMode === 'week' && (
        <WeeklyTransits transits={data.week} onTransitClick={onTransitClick} />
      )}
      {viewMode === 'calendar' && (
        <TransitCalendar
          days={data.month}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      )}
      {viewMode === 'highlights' && (
        <UpcomingHighlights
          highlights={data.highlights}
          onHighlightClick={(_highlight) => {
            // TransitHighlight doesn't have all Transit fields, so we handle it separately
            // We can't directly pass onTransitClick since the types are incompatible
            // TODO: Implement highlight click handler
          }}
        />
      )}
    </div>
  );
}

type ViewMode = 'today' | 'week' | 'calendar' | 'highlights';

// Date Range Selector Component
function DateSelector({
  viewMode,
  onViewChange,
  selectedDate,
  onDateChange,
}: {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}) {
  const viewModes = [
    { id: 'today', label: 'Today', icon: SunIcon },
    { id: 'week', label: 'This Week', icon: CalendarIcon },
    { id: 'calendar', label: 'This Month', icon: CalendarIcon },
    { id: 'highlights', label: 'Highlights', icon: MoonIcon },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* View Mode Buttons */}
 ??      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
 ??        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onViewChange(mode.id as ViewMode)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  viewMode === mode.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Date Navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - 1);
            onDateChange(date.toISOString().split('T')[0]);
          }}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
        />
        <button
          onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + 1);
            onDateChange(date.toISOString().split('T')[0]);
          }}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// Today's Transits Component
function TodaysTransits({ transits, onTransitClick }: { transits: Transit[]; onTransitClick?: (transit: Transit) => void }) {
  // Memoized sort by intensity
  const sortedTransits = useMemo(() => {
    return [...transits].sort((a, b) => b.intensity - a.intensity);
  }, [transits]);

  // Memoized click handler wrapper
  const handleTransitClick = useCallback((transit: Transit) => {
    onTransitClick?.(transit);
  }, [onTransitClick]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Today&apos;s Transits
      </h3>

      {sortedTransits.length === 0 ? (
        <EmptyState
          icon="🌙"
          title="No major transits today"
          description="The cosmos is relatively quiet today. Check back later for upcoming astrological events."
          size="small"
        />
      ) : (
        <div className="space-y-4">
          {sortedTransits.map((transit, index) => (
            <TransitCard key={index} transit={transit} onClick={() => handleTransitClick(transit)} />
          ))}
        </div>
      )}
    </div>
  );
}

// Weekly Transits Component
function WeeklyTransits({ transits, onTransitClick }: { transits: Transit[]; onTransitClick?: (transit: Transit) => void }) {
  // Memoized group by date
  const { transitsByDate, sortedDates } = useMemo(() => {
    const grouped = transits.reduce((acc, transit) => {
      const date = transit.peakDate.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transit);
      return acc;
    }, {} as Record<string, Transit[]>);

    const sorted = Object.keys(grouped).sort();
    return { transitsByDate: grouped, sortedDates: sorted };
  }, [transits]);

  // Memoized click handler wrapper
  const handleTransitClick = useCallback((transit: Transit) => {
    onTransitClick?.(transit);
  }, [onTransitClick]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        This Week&apos;s Transits
      </h3>

      {sortedDates.map((date) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h4>
          <div className="space-y-3">
            {transitsByDate[date].map((transit, index) => (
              <TransitCard
                key={index}
                transit={transit}
                compact
                onClick={() => handleTransitClick(transit)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Transit Calendar Component
function TransitCalendar({
  days,
  selectedDate,
  onDateSelect,
}: {
  days: TransitCalendarDay[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}) {
  // Get current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const weeks = [];
  let week = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    week.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = days.find((d) => d.date === dateStr);
    const isSelected = dateStr === selectedDate;

    week.push(
      <CalendarDay
        key={day}
        day={day}
        date={dateStr}
        data={dayData}
        isSelected={isSelected}
        onClick={() => onDateSelect(dateStr)}
      />
    );

    if (week.length === 7) {
      weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">{week}</div>);
      week = [];
    }
  }

  // Remaining days in last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(<div key={`empty-end-${week.length}`} className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg" />);
    }
    weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">{week}</div>);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Transit Calendar - {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">{weeks}</div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600 dark:text-gray-400">Major Transit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Moon Phase</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Eclipse</span>
        </div>
      </div>
    </div>
  );
}

// Calendar Day Component
function CalendarDay({
  day,
  date: _date,
  data,
  isSelected,
  onClick,
}: {
  day: number;
  date: string;
  data?: TransitCalendarDay;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        h-24 rounded-lg p-2 text-left transition-all hover:shadow-md
        ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
      `}
    >
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{day}</div>

      {/* Transit indicators */}
      <div className="space-y-0.5">
        {data?.hasMajorTransit && (
          <div className="w-2 h-2 rounded-full bg-orange-500" title="Major Transit" />
        )}
        {data?.hasMoonPhase && (
          <div className="text-xs" title={`Moon Phase: ${data.moonPhase?.phase}`}>
            {data.moonPhase?.icon}
          </div>
        )}
        {data?.hasEclipse && (
          <div className="w-2 h-2 rounded-full bg-red-500" title="Eclipse" />
        )}
      </div>
    </button>
  );
}

// Upcoming Highlights Component
function UpcomingHighlights({
  highlights,
  onHighlightClick,
}: {
  highlights: TransitHighlight[];
  onHighlightClick?: (highlight: TransitHighlight) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Upcoming Highlights
      </h3>

      {highlights.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No upcoming highlights"
          description="There are no major astrological highlights in the near future. Check back later for updates."
          size="small"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((highlight, index) => (
            <HighlightCard
              key={index}
              highlight={highlight}
              onClick={() => onHighlightClick?.(highlight)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Transit Card Component
function TransitCard({
  transit,
  compact = false,
  onClick,
}: {
  transit: Transit;
  compact?: boolean;
  onClick?: () => void;
}) {
  const intensityColor = getIntensityColor(transit.intensity);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all
        ${onClick ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      `}
      style={{
        borderColor: intensityColor,
        borderWidth: transit.intensity >= INTENSITY_THRESHOLDS.HIGH_MAX ? '2px' : '1px',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlanetSymbol planet={transit.transitingPlanet} size={compact ? 'sm' : 'md'} />
          <AspectSymbol aspect={transit.type} size={compact ? 'sm' : 'md'} />
          <PlanetSymbol planet={transit.natalPlanet} size={compact ? 'sm' : 'md'} />
        </div>

        {/* Intensity Badge */}
        <div
          className="px-2 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: intensityColor }}
        >
          {transit.intensity}/{UI.INTENSITY_MAX}
        </div>
      </div>

      {!compact && (
        <>
          {/* Date Range */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
          </div>

          {/* Themes */}
          {transit.interpretation.themes && transit.interpretation.themes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {transit.interpretation.themes.slice(0, UI.THEMES_DISPLAY_LIMIT).map((theme, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Interpretation */}
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {transit.interpretation.general}
          </p>
        </>
      )}
    </div>
  );
}

// Highlight Card Component
function HighlightCard({
  highlight,
  onClick,
}: {
  highlight: TransitHighlight;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all
        ${onClick ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      `}
      style={{ borderColor: highlight.color ?? EVENT_COLORS.TRANSIT }}
    >
      {/* Icon */}
      <div className="text-3xl mb-2">{highlight.icon ?? '✨'}</div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{highlight.title}</h4>

      {/* Date */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {formatDate(highlight.date)}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-3">
        {highlight.description}
      </p>

      {/* Intensity indicator (if applicable) */}
      {highlight.intensity && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Intensity</span>
            <span>{highlight.intensity}/{UI.INTENSITY_MAX}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${highlight.intensity * (100 / UI.INTENSITY_MAX)}%`,
                backgroundColor: highlight.color ?? EVENT_COLORS.TRANSIT,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getIntensityColor(intensity: number): string {
  if (intensity >= INTENSITY_THRESHOLDS.HIGH_MAX) return EVENT_COLORS.CHALLENGING; // red
  if (intensity >= INTENSITY_THRESHOLDS.GOOD_MIN) return EVENT_COLORS.HIGH_INTENSITY; // amber
  if (intensity >= INTENSITY_THRESHOLDS.MODERATE_MIN) return EVENT_COLORS.TRANSIT; // indigo
  return EVENT_COLORS.NEUTRAL; // green
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Transit Detail Modal Component (for full transit view)
export function TransitDetailModal({ transit, onClose }: { transit: Transit; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <PlanetSymbol planet={transit.transitingPlanet} size="lg" />
              <AspectSymbol aspect={transit.type} size="lg" />
              <PlanetSymbol planet={transit.natalPlanet} size="lg" />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Peak: {formatDate(transit.peakDate)}
            </p>
          </div>

          {/* Interpretation */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interpretation
            </h4>
            <p className="text-gray-600 dark:text-gray-400">{transit.interpretation.general}</p>
          </div>

          {/* Themes */}
          {transit.interpretation.themes && transit.interpretation.themes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {transit.interpretation.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                Best Practices
              </h4>
              <ul className="space-y-1">
                {transit.interpretation.advice.positive.map((item, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
                Challenges to Navigate
              </h4>
              <ul className="space-y-1">
                {transit.interpretation.advice.challenges.map((item, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          {transit.interpretation.advice.suggestions &&
            transit.interpretation.advice.suggestions.length > 0 && (
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-2">
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {transit.interpretation.advice.suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-indigo-500">💡</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
