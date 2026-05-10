/**
 * TimeTravelSlider Component
 *
 * Horizontal date slider that scrubs through time, showing planetary
 * movements across the chart. Debounced API calls for smooth performance.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeTravelSliderProps {
  chartId: string;
  onDateChange: (date: string) => void;
  startDate: string;
  endDate: string;
  className?: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TimeTravelSlider: React.FC<TimeTravelSliderProps> = ({
  chartId: _chartId,
  onDateChange,
  startDate,
  endDate,
  className = '',
}) => {
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const totalDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));

  // Default to today's offset
  const todayMs = new Date().getTime();
  const todayOffset = Math.max(0, Math.min(totalDays, Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24))));

  const [dayOffset, setDayOffset] = useState(todayOffset);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // days per tick
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const offsetToDate = useCallback(
    (offset: number): string => {
      const ms = startMs + offset * 1000 * 60 * 60 * 24;
      return new Date(ms).toISOString().split('T')[0];
    },
    [startMs],
  );

  const selectedDate = useMemo(() => offsetToDate(dayOffset), [dayOffset, offsetToDate]);

  // Format date for display
  const displayDate = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDate]);

  // Notify parent of date changes (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifyDateChange = useCallback(
    (offset: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onDateChange(offsetToDate(offset));
      }, 150);
    },
    [onDateChange, offsetToDate],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      setDayOffset(val);
      notifyDateChange(val);
    },
    [notifyDateChange],
  );

  const handleNow = useCallback(() => {
    setDayOffset(todayOffset);
    onDateChange(offsetToDate(todayOffset));
  }, [todayOffset, onDateChange, offsetToDate]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setDayOffset((prev) => {
          const next = Math.min(prev + speed, totalDays);
          if (next >= totalDays) {
            setIsPlaying(false);
          }
          notifyDateChange(next);
          return next;
        });
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, totalDays, notifyDateChange]);

  // Generate month tick marks
  const monthTicks = useMemo(() => {
    const ticks: { label: string; position: number }[] = [];
    const startDateObj = new Date(startDate);
    for (let m = 0; m < 12; m++) {
      const tickDate = new Date(startDateObj.getFullYear(), startDateObj.getMonth() + m, 1);
      const tickMs = tickDate.getTime();
      if (tickMs >= startMs && tickMs <= endMs) {
        const offset = Math.floor((tickMs - startMs) / (1000 * 60 * 60 * 24));
        ticks.push({
          label: MONTH_LABELS[tickDate.getMonth()],
          position: (offset / totalDays) * 100,
        });
      }
    }
    return ticks;
  }, [startDate, startMs, endMs, totalDays]);

  const progressPercent = totalDays > 0 ? (dayOffset / totalDays) * 100 : 0;

  return (
    <div className={`relative ${className}`} data-testid="time-travel-slider">
      {/* Selected Date Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white" data-testid="selected-date">
            {displayDate}
          </span>
          <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-white/5">
            Day {dayOffset} / {totalDays}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Now Button */}
          <button
            onClick={handleNow}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            Now
          </button>
          {/* Play/Pause */}
          <button
            data-testid="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          {/* Speed Selector */}
          <select
            data-testid="speed-selector"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-2 py-1 text-xs rounded-lg bg-white/5 text-white border border-white/10"
          >
            <option value={1}>1x</option>
            <option value={7}>7x</option>
            <option value={30}>30x</option>
          </select>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-12">
        {/* Progress Fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full bg-gradient-to-r from-primary to-purple-400 shadow-[0_0_10px_rgba(107,61,225,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Track Background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-white/10" />

        {/* Month Tick Marks */}
        {monthTicks.map((tick) => (
          <div
            key={tick.label + tick.position}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${tick.position}%` }}
          >
            <div className="w-px h-3 bg-white/20" />
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 whitespace-nowrap">
              {tick.label}
            </span>
          </div>
        ))}

        {/* Slider Input */}
        <motion.input
          type="range"
          role="slider"
          min={0}
          max={totalDays}
          value={dayOffset}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          aria-label="Time travel date slider"
          aria-valuemin={0}
          aria-valuemax={totalDays}
          aria-valuenow={dayOffset}
        />

        {/* Thumb Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 -ml-2.5 rounded-full bg-primary border-2 border-white shadow-[0_0_12px_rgba(107,61,225,0.6)] pointer-events-none transition-[left] duration-100"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default TimeTravelSlider;
