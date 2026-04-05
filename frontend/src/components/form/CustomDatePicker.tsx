/**
 * CustomDatePicker Component
 *
 * Custom calendar grid date picker with month navigation, today highlighting,
 * selected state, and keyboard navigation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  className,
  placeholder = 'Select date',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (disabled) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [disabled, minDate, maxDate],
  );

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (isDateDisabled(newDate)) return;

    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowLeft':
        handlePrevMonth();
        break;
      case 'ArrowRight':
        handleNextMonth();
        break;
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={clsx('relative', className)} onKeyDown={handleKeyDown}>
      {/* Input */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 text-left rounded-xl',
          'bg-surface-dark/50 border border-white/10',
          'hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary',
          'text-slate-100 placeholder-slate-500',
          'transition-all duration-200',
          'flex items-center justify-between',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span>{selectedDate ? formatDate(selectedDate) : placeholder}</span>
        <span className="material-symbols-outlined text-slate-500">calendar_month</span>
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 w-full',
            'bg-card-dark border border-white/10 rounded-xl',
            'shadow-xl shadow-black/50',
            'p-4',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="text-white font-semibold">
              {currentMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={clsx(
                    'aspect-square rounded-lg text-sm font-medium transition-all',
                    'hover:bg-white/5 hover:scale-105',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    // Selected state
                    isSelected && 'bg-primary text-white shadow-lg shadow-primary/30',
                    // Today state
                    !isSelected && isToday && 'border border-primary text-primary',
                    // Disabled state
                    isDisabled &&
                      'opacity-30 cursor-not-allowed hover:bg-transparent hover:scale-100',
                    // Default
                    !isSelected && !isToday && !isDisabled && 'text-slate-300',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                if (!isDateDisabled(now)) {
                  setSelectedDate(now);
                  onChange?.(now);
                  setIsOpen(false);
                }
              }}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
