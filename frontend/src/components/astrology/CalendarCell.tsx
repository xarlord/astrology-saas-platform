/**
 * CalendarCell Component
 * Individual calendar day cell with event indicators
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface CalendarEvent {
  id: string;
  type: string;
  color: string;
}

export interface CalendarCellProps {
  date: number;
  month?: number;
  year?: number;
  isToday?: boolean;
  isSelected?: boolean;
  isOtherMonth?: boolean;
  events?: CalendarEvent[];
  maxEventsShown?: number;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  'aria-label'?: string;
  'aria-selected'?: boolean;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  isToday = false,
  isSelected = false,
  isOtherMonth = false,
  events = [],
  maxEventsShown = 3,
  onClick,
  onKeyDown,
  'aria-label': ariaLabel,
  'aria-selected': ariaSelected,
}) => {
  const displayEvents = events.slice(0, maxEventsShown);
  const remainingEvents = Math.max(0, events.length - maxEventsShown);

  return (
    <motion.button
      className={`
        relative aspect-square p-1 rounded-lg border transition-all
        ${isSelected ? 'bg-primary/20 border-primary' : 'border-transparent hover:bg-white/5'}
        ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-dark' : ''}
        ${isOtherMonth ? 'opacity-30' : 'opacity-100'}
      `}
      onClick={onClick}
      onKeyDown={onKeyDown}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={ariaLabel ?? `Day ${date}${events.length > 0 ? `, ${events.length} events` : ''}`}
      aria-selected={ariaSelected ?? isSelected}
      role="gridcell"
    >
      {/* Date Number */}
      <span
        className={`
          text-sm font-medium
          ${isToday ? 'text-primary font-bold' : isSelected ? 'text-white' : 'text-slate-300'}
          ${isOtherMonth ? 'text-slate-500' : ''}
        `}
      >
        {date}
      </span>

      {/* Event Indicators */}
      {events.length > 0 && (
        <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
          {/* Event bars */}
          <div className="flex gap-0.5">
            {displayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="h-1 rounded-full flex-1"
                style={{ backgroundColor: event.color }}
                title={event.type}
              />
            ))}
          </div>

          {/* Event count badge */}
          {events.length > 3 && (
            <span className="text-[9px] text-slate-400 text-center">+{remainingEvents}</span>
          )}
        </div>
      )}

      {/* Event dots (alternative style) */}
      {events.length > 0 && events.length <= 3 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: event.color }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
};

export default CalendarCell;
