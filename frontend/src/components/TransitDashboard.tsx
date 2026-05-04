import { useState } from 'react';
import { PlanetSymbol, AspectSymbol, EmptyState } from './';

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
            // TODO: Implement highlight click handler
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

// Today's Transits Component
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
        <div className="space-y-4">
          {sortedTransits.map((transit, index) => (
            <TransitCard key={index} transit={transit} onClick={() => onTransitClick?.(transit)} />
          ))}
        </div>
      )}
    </div>
  );
}

// Weekly Transits Component
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
              <TransitCard
                key={index}
                transit={transit}
                compact
                onClick={() => onTransitClick?.(transit)}
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
        glass-panel rounded-2xl border p-4 cursor-pointer transition-all
        ${onClick ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      `}
      style={{
        borderColor: intensityColor,
        borderWidth: transit.intensity >= 8 ? '2px' : '1px',
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
          {transit.intensity}/10
        </div>
      </div>

      {!compact && (
        <>
          {/* Date Range */}
          <div className="mt-3 text-sm text-slate-200">
            {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
          </div>

          {/* Themes */}
          {transit.interpretation.themes && transit.interpretation.themes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {transit.interpretation.themes.slice(0, 3).map((theme, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/15 rounded text-xs text-slate-200"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Interpretation */}
          <p className="mt-3 text-sm text-slate-200 line-clamp-2">
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
        glass-panel rounded-2xl border-2 p-4 cursor-pointer transition-all
        ${onClick ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
      `}
      style={{ borderColor: highlight.color ?? '#6366F1' }}
    >
      {/* Icon */}
      <div className="text-3xl mb-2">{highlight.icon ?? '✨'}</div>

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
      <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              className="p-2 hover:bg-white/15 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-200 mb-2">
              Duration
            </h4>
            <p className="text-slate-200">
              {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Peak: {formatDate(transit.peakDate)}
            </p>
          </div>

          {/* Interpretation */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-200 mb-2">
              Interpretation
            </h4>
            <p className="text-slate-200">{transit.interpretation.general}</p>
          </div>

          {/* Themes */}
          {transit.interpretation.themes && transit.interpretation.themes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-200 mb-2">
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {transit.interpretation.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
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
              <h4 className="text-sm font-medium text-green-400 mb-2">
                Best Practices
              </h4>
              <ul className="space-y-1">
                {transit.interpretation.advice.positive.map((item, index) => (
                  <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-400 mb-2">
                Challenges to Navigate
              </h4>
              <ul className="space-y-1">
                {transit.interpretation.advice.challenges.map((item, index) => (
                  <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
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
              <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                <h4 className="text-sm font-medium text-primary mb-2">
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {transit.interpretation.advice.suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="text-xs text-slate-200 flex items-start gap-2"
                    >
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
