/**
 * TransitTimeline Component
 * Horizontal scrolling timeline with morphing aspect-type icons.
 * Critical dates pulse. Swipe to scrub months.
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

/** Aspect type symbols */
export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

/** A single transit event on the timeline */
export interface TransitEvent {
  id: string;
  date: string; // ISO date string
  aspectType: AspectType;
  planet1: string;
  planet2: string;
  orb: number; // degrees
  description: string;
  isCritical?: boolean; // orb < 1° or involves Sun/Moon
}

export interface TransitTimelineProps {
  /** Transit events to display */
  events: TransitEvent[];
  /** Currently selected event ID */
  selectedEventId?: string;
  /** Called when an event is clicked */
  onEventSelect?: (event: TransitEvent) => void;
  /** Called when month is scrolled into view */
  onMonthChange?: (month: string) => void;
  /** Color scheme for harmonious aspects */
  harmoniousColor?: string;
  /** Color scheme for challenging aspects */
  challengingColor?: string;
  'aria-label'?: string;
}

/** Get symbol for aspect type */
export function getAspectSymbol(type: AspectType): string {
  const symbols: Record<AspectType, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚗',
  };
  return symbols[type];
}

/** Get color for aspect type */
export function getAspectColor(
  type: AspectType,
  harmonious = '#60a5fa',
  challenging = '#f87171',
): string {
  const harmoniousTypes: AspectType[] = ['trine', 'sextile'];
  const challengingTypes: AspectType[] = ['square', 'opposition', 'quincunx'];
  if (harmoniousTypes.includes(type)) return harmonious;
  if (challengingTypes.includes(type)) return challenging;
  return '#fbbf24'; // conjunction = gold
}

/** Group events by month */
export function groupByMonth(events: TransitEvent[]): Map<string, TransitEvent[]> {
  const groups = new Map<string, TransitEvent[]>();
  for (const event of events) {
    const monthKey = event.date.substring(0, 7); // YYYY-MM
    const existing = groups.get(monthKey) ?? [];
    existing.push(event);
    groups.set(monthKey, existing);
  }
  return groups;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const TransitTimeline: React.FC<TransitTimelineProps> = ({
  events,
  selectedEventId,
  onEventSelect,
  onMonthChange,
  harmoniousColor = '#60a5fa',
  challengingColor = '#f87171',
  'aria-label': ariaLabel,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const monthlyEvents = useMemo(() => groupByMonth(events), [events]);
  const months = useMemo(() => Array.from(monthlyEvents.keys()), [monthlyEvents]);
  const handleMonthScroll = useCallback(
    (monthKey: string) => {
      onMonthChange?.(monthKey);
    },
    [onMonthChange],
  );

  // Parse month key to display name
  const formatMonth = (key: string): string => {
    const [year, mon] = key.split('-');
    const monthIdx = parseInt(mon, 10) - 1;
    return `${MONTH_NAMES[monthIdx]} ${year}`;
  };

  if (events.length === 0) {
    return (
      <div
        className="text-center p-6 text-slate-500"
        aria-label="No transit events"
      >
        No upcoming transits
      </div>
    );
  }

  return (
    <div
      className="transit-timeline w-full"
      role="list"
      aria-label={ariaLabel ?? 'Transit timeline'}
    >
      {/* Scrollable timeline track */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-[2px] px-4 py-3 scrollbar-thin bg-slate-900/50 rounded-xl"
      >
        {months.map((monthKey) => (
          <div
            key={monthKey}
            role="listitem"
            className="snap-start min-w-[200px] shrink-0"
            onMouseEnter={() => handleMonthScroll(monthKey)}
          >
            {/* Month header */}
            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {formatMonth(monthKey)}
            </div>

            {/* Events in this month */}
            <div className="flex flex-col gap-1">
              {monthlyEvents.get(monthKey)?.map((event) => {
                const color = getAspectColor(event.aspectType, harmoniousColor, challengingColor);
                const symbol = getAspectSymbol(event.aspectType);
                const isSelected = event.id === selectedEventId;
                const isCritical = event.isCritical ?? (event.orb < 1);

                return (
                  <motion.button
                    key={event.id}
                    type="button"
                    onClick={() => onEventSelect?.(event)}
                    aria-label={`${event.planet1} ${event.aspectType} ${event.planet2}, orb ${event.orb.toFixed(1)} degrees`}
                    aria-pressed={isSelected}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md w-full text-left text-[0.8rem] text-slate-200 cursor-pointer"
                    style={{
                      border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                      background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Aspect icon with optional pulse */}
                    <motion.span
                      className="text-lg inline-flex items-center justify-center w-6 h-6"
                      style={{ color }}
                      animate={
                        isCritical
                          ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                          : { scale: 1 }
                      }
                      transition={
                        isCritical
                          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0 }
                      }
                    >
                      {symbol}
                    </motion.span>

                    {/* Event details */}
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {event.planet1}–{event.planet2}
                    </span>
                    <span className="text-[0.7rem] text-slate-500">
                      {event.orb.toFixed(1)}°
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline bar visualization */}
      <div className="relative h-1 bg-slate-500/30 rounded-sm mx-4 mt-2">
        {events.map((event) => {
          const eventDate = new Date(event.date);
          const firstDate = new Date(events[0].date);
          const lastDate = new Date(events[events.length - 1].date);
          const range = lastDate.getTime() - firstDate.getTime();
          const position = range > 0
            ? ((eventDate.getTime() - firstDate.getTime()) / range) * 100
            : 50;

          return (
            <motion.div
              key={`dot-${event.id}`}
              className="absolute -top-[3px] size-2.5 rounded-full -translate-x-1/2"
              style={{
                left: `${position}%`,
                background: getAspectColor(event.aspectType, harmoniousColor, challengingColor),
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: position * 0.01 }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TransitTimeline;
