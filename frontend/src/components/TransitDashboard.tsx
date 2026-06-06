import { useState } from 'react';
import { PlanetSymbol } from './PlanetSymbol';
import { AspectSymbol } from './AspectSymbol';
import { EmptyState } from './EmptyState';
import { TransitForecastCard } from './transit/TransitForecastCard';
import type { TransitForecastCardData } from './transit/TransitForecastCard';
import type { TransitInterpretationOutput } from '../utils/transitHelpers';

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
    coreMeaning?: string;
    psychologicalPattern?: string;
    realLifeExpression?: string;
    reflectionQuestion?: string;
    beginnerTip?: string;
    advice: {
      positive: string[];
      challenges: string[];
      suggestions: string[];
    };
    /** Full structured interpretation from transitInterpretation.ts */
    _structured?: TransitInterpretationOutput;
  };
}

/** Convert a Transit (legacy) to TransitForecastCardData */
// eslint-disable-next-line react-refresh/only-export-components
export function transitToForecastData(t: Transit): TransitForecastCardData {
  return {
    transitingPlanet: t.transitingPlanet,
    natalPlanet: t.natalPlanet,
    aspect: t.type,
    orb: t.orb,
    applying: t.applying,
    startDate: t.startDate,
    endDate: t.endDate,
    peakDate: t.peakDate,
    intensity: t.intensity,
    interpretation: {
      general: t.interpretation.general,
      themes: t.interpretation.themes,
      coreMeaning: t.interpretation.coreMeaning ?? '',
      psychologicalPattern: t.interpretation.psychologicalPattern ?? '',
      realLifeExpression: t.interpretation.realLifeExpression ?? '',
      reflectionQuestion: t.interpretation.reflectionQuestion ?? '',
      beginnerTip: t.interpretation.beginnerTip ?? '',
      advice: t.interpretation.advice,
    },
  };
}

export interface TransitHighlight {
  type: 'major-transit' | 'minor-transit' | 'personal-transit' | 'moon-phase' | 'eclipse' | 'retrograde';
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
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export function TransitDashboard({ data, onDateSelect, onTransitClick, selectedDate: externalDate, onDateChange }: TransitDashboardProps) {
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'calendar' | 'highlights'>('today');
  const [internalDate, setInternalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const selectedDate = externalDate ?? internalDate;
  const setSelectedDate = onDateChange ?? setInternalDate;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <DateSelector
        viewMode={viewMode}
        onViewChange={(mode) => setViewMode(mode as 'today' | 'week' | 'calendar' | 'highlights')}
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
          onDateSelect={(date) => {
            setSelectedDate(date);
            onDateSelect?.(date);
          }}
        />
      )}
      {viewMode === 'highlights' && (
        <UpcomingHighlights
          highlights={data.highlights}
          onHighlightClick={(_highlight) => {
            // TransitHighlight doesn't have all Transit fields, so we handle it separately
            // We can't directly pass onTransitClick since the types are incompatible
            // TODO(#98): Implement highlight click handler — show transit details popup
          }}
        />
      )}
    </div>
  );
}

// Date Range Selector Component
function DateSelector({
  viewMode,
  onViewChange,
  selectedDate,
  onDateChange,
}: {
  viewMode: string;
  onViewChange: (mode: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}) {
  const viewModes = [
    { id: 'today', label: 'Today', icon: () => <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>light_mode</span> },
    { id: 'week', label: 'This Week', icon: () => <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>calendar_today</span> },
    { id: 'calendar', label: 'This Month', icon: () => <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>calendar_today</span> },
    { id: 'highlights', label: 'Highlights', icon: () => <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>dark_mode</span> },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* View Mode Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onViewChange(mode.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                ${
                  viewMode === mode.id
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(107,61,225,0.4)]'
                    : 'bg-cosmic-card-solid text-slate-200 hover:bg-white/15 hover:border-white/15 border border-white/15'
                }
              `}
            >
              <Icon />
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
          className="p-2 rounded-lg bg-cosmic-card-solid border border-white/15 hover:bg-white/15"
          aria-label="Previous day"
        >
          <span className="material-symbols-outlined text-slate-200" aria-hidden="true" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Select date"
          className="px-4 py-2 bg-cosmic-card-solid border border-white/15 rounded-lg text-sm text-white"
        />
        <button
          onClick={() => {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() + 1);
            onDateChange(date.toISOString().split('T')[0]);
          }}
          className="p-2 rounded-lg bg-cosmic-card-solid border border-white/15 hover:bg-white/15"
          aria-label="Next day"
        >
          <span className="material-symbols-outlined text-slate-200" aria-hidden="true" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>
    </div>
  );
}

// Today's Transits Component — uses TransitForecastCard
function TodaysTransits({ transits, onTransitClick }: { transits: Transit[]; onTransitClick?: (transit: Transit) => void }) {
  // Sort by intensity
  const sortedTransits = [...transits].sort((a, b) => b.intensity - a.intensity);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
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
        <div className="space-y-3">
          {sortedTransits.map((transit, index) => (
            <TransitForecastCard
              key={index}
              transit={transitToForecastData(transit)}
              onTransitClick={() => onTransitClick?.(transit)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Weekly Transits Component — uses TransitForecastCard
function WeeklyTransits({ transits, onTransitClick }: { transits: Transit[]; onTransitClick?: (transit: Transit) => void }) {
  // Group by date
  const transitsByDate = transits.reduce((acc, transit) => {
    const date = transit.peakDate.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transit);
    return acc;
  }, {} as Record<string, Transit[]>);

  const sortedDates = Object.keys(transitsByDate).sort();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        This Week&apos;s Transits
      </h3>

      {sortedDates.map((date) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-slate-200 mb-3">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h4>
          <div className="space-y-3">
            {transitsByDate[date].map((transit, index) => (
              <TransitForecastCard
                key={index}
                transit={transitToForecastData(transit)}
                onTransitClick={() => onTransitClick?.(transit)}
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
    week.push(<div key={`empty-${i}`} className="h-24 bg-white/15 rounded-lg" />);
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
      week.push(<div key={`empty-end-${week.length}`} className="h-24 bg-white/15 rounded-lg" />);
    }
    weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">{week}</div>);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Transit Calendar - {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-200">
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
          <span className="text-slate-200">Major Transit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span className="text-slate-200">Moon Phase</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-200">Eclipse</span>
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
        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'bg-cosmic-card-solid/70 border border-white/15'}
      `}
    >
      <div className="text-sm font-medium text-white mb-1">{day}</div>

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
      <h3 className="text-lg font-semibold text-white">
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
          {highlights.map((highlight) => (
            <HighlightCard
              key={`${highlight.type}-${highlight.date}`}
              highlight={highlight}
              onClick={() => onHighlightClick?.(highlight)}
            />
          ))}
        </div>
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
  // Type-specific styling
  const typeStyles: Record<string, { icon: string; borderColor: string; bgColor: string }> = {
    'major-transit': { icon: '⚡', borderColor: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    'moon-phase': { icon: '🌙', borderColor: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    'eclipse': { icon: '🌑', borderColor: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    'retrograde': { icon: '🔄', borderColor: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  };
  const style = typeStyles[highlight.type] ?? { icon: highlight.icon ?? '✨', borderColor: highlight.color ?? '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' };

  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(); } } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${highlight.title} — ${highlight.type.replace('-', ' ')}` : undefined}
      className={`
        rounded-2xl border-2 p-4 cursor-pointer transition-all
        ${onClick ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      `}
      style={{ borderColor: style.borderColor, backgroundColor: style.bgColor }}
    >
      {/* Icon */}
      <div className="text-3xl mb-2">{style.icon}</div>

      {/* Type Badge */}
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 bg-white/10 text-slate-200 capitalize">
        {highlight.type.replace('-', ' ')}
      </span>

      {/* Title */}
      <h4 className="font-semibold text-white mb-1">{highlight.title}</h4>

      {/* Date */}
      <p className="text-sm text-slate-200 mb-2">
        {formatDate(highlight.date)}
      </p>

      {/* Description */}
      <p className="text-sm text-slate-200 line-clamp-3">
        {highlight.description}
      </p>

      {/* Intensity indicator (if applicable) */}
      {highlight.intensity && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-200 mb-1">
            <span>Intensity</span>
            <span>{highlight.intensity}/10</span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${highlight.intensity * 10}%`,
                backgroundColor: highlight.color ?? '#6366F1',
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
  if (intensity >= 8) return '#EF4444'; // red
  if (intensity >= 6) return '#F59E0B'; // amber
  if (intensity >= 4) return '#6366F1'; // indigo
  return '#10B981'; // green
}

/** Alias for TransitDetailModal usage */
const getIntensityColorModal = getIntensityColor;

function formatOrbModal(orb: number): string {
  const abs = Math.abs(orb);
  const degrees = Math.floor(abs);
  const minutes = Math.round((abs - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, '0')}'`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Transit Detail Modal Component (full-screen overlay with expanded detail)
export function TransitDetailModal({ transit, onClose }: { transit: Transit; onClose: () => void }) {
  const interp = transit.interpretation;
  const status = Math.abs(transit.orb) <= 0.08 ? 'Exact' : transit.applying ? 'Applying' : 'Separating';

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              className="p-2 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3">
            Transiting {transit.transitingPlanet} {transit.type} Natal {transit.natalPlanet}
          </h3>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs">
              <span className="material-symbols-outlined text-[12px]">date_range</span>
              {formatDate(transit.startDate)} – {formatDate(transit.endDate)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs">
              <span className="material-symbols-outlined text-[12px]">today</span>
              Peak: {formatDate(transit.peakDate)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs">
              Orb: {formatOrbModal(transit.orb)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium ${
              status === 'Exact' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
              status === 'Applying' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
              'text-blue-400 bg-blue-500/10 border-blue-500/20'
            }`}>
              {status}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-xs font-bold"
              style={{ backgroundColor: getIntensityColorModal(transit.intensity) }}>
              Intensity: {transit.intensity}/10
            </span>
          </div>

          {/* Intensity Bar */}
          <div className="mb-6">
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${transit.intensity * 10}%`,
                  backgroundColor: getIntensityColorModal(transit.intensity),
                }}
              />
            </div>
          </div>

          {/* Short Summary */}
          {interp.general && (
            <div className="mb-6">
              <p className="text-slate-200 text-sm leading-relaxed">{interp.general}</p>
            </div>
          )}

          {/* Themes */}
          {interp.themes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-200 mb-2">Key Themes</h4>
              <div className="flex flex-wrap gap-2">
                {interp.themes.map((theme, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Core Meaning */}
          {interp.coreMeaning && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#6b3de1] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Core Meaning
              </h4>
              <p className="text-slate-200 text-sm">{interp.coreMeaning}</p>
            </div>
          )}

          {/* Psychological Pattern */}
          {interp.psychologicalPattern && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#3b82f6] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                Psychological Pattern
              </h4>
              <p className="text-slate-200 text-sm">{interp.psychologicalPattern}</p>
            </div>
          )}

          {/* Real-Life Expression */}
          {interp.realLifeExpression && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#10b981] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">theater_comedy</span>
                Real-Life Expression
              </h4>
              <p className="text-slate-200 text-sm">{interp.realLifeExpression}</p>
            </div>
          )}

          {/* Best Practices + Challenges grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Best Practices
              </h4>
              <ul className="space-y-1">
                {interp.advice.positive.map((item, index) => (
                  <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Challenges to Navigate
              </h4>
              <ul className="space-y-1">
                {interp.advice.challenges.map((item, index) => (
                  <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reflection Question */}
          {interp.reflectionQuestion && (
            <div className="mb-6 bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">help</span>
                Reflection Question
              </h4>
              <p className="text-slate-100 text-sm italic">&ldquo;{interp.reflectionQuestion}&rdquo;</p>
            </div>
          )}

          {/* Beginner Tip */}
          {interp.beginnerTip && (
            <div className="mb-4 bg-primary/5 border border-primary/15 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">lightbulb</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">
                    Beginner Tip
                  </span>
                  <p className="text-slate-200 text-sm">{interp.beginnerTip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {interp.advice.suggestions && interp.advice.suggestions.length > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-medium text-primary mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {interp.advice.suggestions.map((item, index) => (
                  <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-primary">💡</span>
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
