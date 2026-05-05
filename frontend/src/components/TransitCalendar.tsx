/**
 * TransitCalendar Component
 * Displays daily planetary transits in a calendar view
 */

import { useState, useMemo } from 'react';

// Types
export interface Transit {
  date: string;
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  aspect?: string;
  aspectPlanet?: string;
}

export interface TransitCalendarProps {
  transits: Transit[];
  onDateSelect?: (date: Date, transits: Transit[]) => void;
  onTransitClick?: (transit: Transit) => void;
  initialDate?: Date;
  highlightDates?: Date[];
  showMoonPhases?: boolean;
  showRetrogrades?: boolean;
}

// Material Symbol icon factories for planets (accept optional size in px)
const PLANET_CONFIG = {
  sun: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#FFD700' }}>light_mode</span>, color: '#FFD700', name: 'Sun' },
  moon: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#C0C0C0' }}>dark_mode</span>, color: '#C0C0C0', name: 'Moon' },
  mercury: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#8B4513' }}>circle</span>, color: '#8B4513', name: 'Mercury' },
  venus: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#FF69B4' }}>circle</span>, color: '#FF69B4', name: 'Venus' },
  mars: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#FF0000' }}>circle</span>, color: '#FF0000', name: 'Mars' },
  jupiter: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#FFA500' }}>circle</span>, color: '#FFA500', name: 'Jupiter' },
  saturn: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#696969' }}>circle</span>, color: '#696969', name: 'Saturn' },
  uranus: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#40E0D0' }}>circle</span>, color: '#40E0D0', name: 'Uranus' },
  neptune: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#4169E1' }}>circle</span>, color: '#4169E1', name: 'Neptune' },
  pluto: { icon: (size = 12) => <span className="material-symbols-outlined" style={{ fontSize: `${size}px`, color: '#8B0000' }}>circle</span>, color: '#8B0000', name: 'Pluto' },
};

// Zodiac signs
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function TransitCalendar({
  transits,
  onDateSelect,
  onTransitClick,
  initialDate = new Date(),
  highlightDates = [],
  showMoonPhases: _showMoonPhases = true,
  showRetrogrades = true,
}: TransitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get transits for a specific date
  const getTransitsForDate = useMemo(() => {
    return (date: Date): Transit[] => {
      const dateStr = date.toISOString().split('T')[0];
      return transits.filter((t) => t.date === dateStr);
    };
  }, [transits]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; transits: Transit[] }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        transits: getTransitsForDate(date),
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        transits: getTransitsForDate(date),
      });
    }

    // Next month days (fill to complete the grid)
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        transits: getTransitsForDate(date),
      });
    }

    return days;
  }, [currentDate, getTransitsForDate]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Date click handler
  const handleDateClick = (date: Date, dayTransits: Transit[]) => {
    setSelectedDate(date);
    onDateSelect?.(date, dayTransits);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is highlighted
  const isHighlighted = (date: Date): boolean => {
    return highlightDates.some((d) => d.toDateString() === date.toDateString());
  };

  // Get zodiac symbol for sign
  const getZodiacSymbol = (sign: string): string => {
    const found = ZODIAC_SIGNS.find(
      (z) => z.name.toLowerCase() === sign.toLowerCase()
    );
    return found?.symbol ?? '';
  };

  return (
    <div
      className="w-full max-w-full overflow-x-auto glass-panel rounded-2xl overflow-hidden motion-safe:transition-all motion-safe:duration-200"
      role="region"
      aria-label="Transit Calendar"
    >
      {/* Calendar Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-white/15">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-white/15 transition-colors min-h-[44px] min-w-[44px] pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px] focus-visible:outline-2 focus-visible:outline-current high-contrast:focus-visible:outline-3 high-contrast:focus-visible:outline-current"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-slate-200" aria-hidden="true" style={{ fontSize: '20px' }}>chevron_left</span>
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[180px] text-center">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-white/15 transition-colors min-h-[44px] min-w-[44px] pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px] focus-visible:outline-2 focus-visible:outline-current high-contrast:focus-visible:outline-3 high-contrast:focus-visible:outline-current"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-current high-contrast:focus-visible:outline-3 high-contrast:focus-visible:outline-current"
          >
            Today
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-white/15 overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-current high-contrast:focus-visible:outline-3 high-contrast:focus-visible:outline-current ${
                viewMode === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'glass-panel text-slate-200 hover:bg-white/15'
              }`}
              aria-pressed={viewMode === 'month' ? 'true' : 'false'}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-current high-contrast:focus-visible:outline-3 high-contrast:focus-visible:outline-current ${
                viewMode === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'glass-panel text-slate-200 hover:bg-white/15'
              }`}
              aria-pressed={viewMode === 'week' ? 'true' : 'false'}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-white/15 border-b border-white/15">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-slate-200"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="min-w-[320px]" role="grid">
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7" role="row">
            {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, cellIdx) => {
              const index = weekIdx * 7 + cellIdx;
          const isSelected =
            selectedDate?.toDateString() === day.date.toDateString();
          const hasRetrograde = day.transits.some((t) => t.retrograde);

          return (
            <div
              key={index}
              className={`
                relative min-h-[60px] sm:min-h-[100px] md:min-h-[80px] p-1 sm:p-2 border-b border-r border-white/15
                ${!day.isCurrentMonth ? 'bg-white/[0.03]' : ''}
                ${isToday(day.date) ? 'bg-primary/10' : ''}
                ${isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''}
                ${isHighlighted(day.date) ? 'bg-yellow-500/10' : ''}
                hover:bg-white/15 cursor-pointer transition-all duration-200 ease-in-out
                pointer-coarse:min-h-[70px]
                high-contrast:border-2
                print:border print:border-gray-300 print:min-h-[60px]
              `}
              onClick={() => handleDateClick(day.date, day.transits)}
              role="gridcell"
              aria-label={`${day.date.getDate()} ${MONTHS[day.date.getMonth()]}, ${day.transits.length} transits`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDateClick(day.date, day.transits);
                }
              }}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isToday(day.date) ? 'w-7 h-7 flex items-center justify-center bg-primary-600 text-white rounded-full' : ''}
                    ${!day.isCurrentMonth ? 'text-slate-200' : 'text-white'}
                  `}
                >
                  {day.date.getDate()}
                </span>

                {/* Retrograde indicator */}
                {showRetrogrades && hasRetrograde && (
                  <span
                    className="text-xs text-red-500"
                    title="Retrograde activity"
                    aria-label="Retrograde activity"
                  >
                    Ⓡ
                  </span>
                )}
              </div>

              {/* Transits */}
              <div className="space-y-0.5 overflow-hidden text-[10px] sm:text-xs">
                {day.transits.slice(0, 3).map((transit, i) => {
                  const config = PLANET_CONFIG[transit.planet.toLowerCase() as keyof typeof PLANET_CONFIG];
                  if (!config) return null;

                  const IconComponent = config.icon;

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1 p-0.5 rounded hover:bg-white/15 cursor-pointer motion-safe:animate-[fadeIn_0.2s_ease-out]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTransitClick?.(transit);
                      }}
                      title={`${config.name} in ${transit.sign} ${transit.degree}°${transit.retrograde ? ' (R)' : ''}`}
                    >
                      {IconComponent()}
                      <span className="truncate text-slate-200">
                        {getZodiacSymbol(transit.sign)}
                      </span>
                      {transit.retrograde && (
                        <span className="text-red-500 text-[10px]">R</span>
                      )}
                    </div>
                  );
                })}

                {day.transits.length > 3 && (
                  <div className="text-xs text-slate-200 text-center">
                    +{day.transits.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-white/15 bg-white/15 print:hidden">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/10 border border-primary/20 rounded" />
            <span>Today</span>
          </div>
          {showRetrogrades && (
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">R</span>
              <span>Retrograde</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/10 border border-yellow-500/20 rounded" />
            <span>Highlighted</span>
          </div>
        </div>
      </div>

      {/* Selected Date Details Panel */}
      {selectedDate && (
        <div
          className="p-3 sm:p-4 border-t border-white/15 bg-white/15 motion-safe:animate-[slideUp_0.3s_ease-out]"
          role="region"
          aria-label={`Transits for ${selectedDate.toDateString()}`}
        >
          <h3 className="font-semibold text-white mb-3">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>

          {getTransitsForDate(selectedDate).length === 0 ? (
            <p className="text-slate-200 text-sm">
              No transits recorded for this date.
            </p>
          ) : (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {getTransitsForDate(selectedDate).map((transit, i) => {
                const config = PLANET_CONFIG[transit.planet.toLowerCase() as keyof typeof PLANET_CONFIG];
                if (!config) return null;

                const IconComponent = config.icon;

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 glass-panel rounded-2xl transition-shadow cursor-pointer"
                    onClick={() => onTransitClick?.(transit)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTransitClick?.(transit);
                      }
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      {IconComponent(20)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {config.name}
                        </span>
                        {transit.retrograde && (
                          <span className="text-xs text-red-500 font-medium">
                            Retrograde
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-200">
                        {getZodiacSymbol(transit.sign)} {transit.sign} {transit.degree}°
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-200" style={{ fontSize: '16px' }}>info</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
