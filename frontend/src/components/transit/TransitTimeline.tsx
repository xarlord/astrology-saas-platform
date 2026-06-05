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
      className="transit-timeline"
      role="list"
      aria-label={ariaLabel ?? 'Transit timeline'}
      style={{ width: '100%' }}
    >
      {/* Scrollable timeline track */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '2px',
          padding: '12px 16px',
          scrollbarWidth: 'thin',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '12px',
        }}
      >
        {months.map((monthKey) => (
          <div
            key={monthKey}
            role="listitem"
            style={{
              scrollSnapAlign: 'start',
              minWidth: '200px',
              flexShrink: 0,
            }}
            onMouseEnter={() => handleMonthScroll(monthKey)}
          >
            {/* Month header */}
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {formatMonth(monthKey)}
            </div>

            {/* Events in this month */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                      background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer',
                      color: '#e2e8f0',
                      fontSize: '0.8rem',
                      width: '100%',
                      textAlign: 'left',
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Aspect icon with optional pulse */}
                    <motion.span
                      style={{
                        fontSize: '1.1rem',
                        color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                      }}
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
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      <div
        style={{
          position: 'relative',
          height: '4px',
          background: 'rgba(100, 116, 139, 0.3)',
          borderRadius: '2px',
          margin: '8px 16px 0',
        }}
      >
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
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: '-3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: getAspectColor(event.aspectType, harmoniousColor, challengingColor),
                transform: 'translateX(-50%)',
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
