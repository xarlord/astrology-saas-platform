/**
 * useCalendar Hook
 *
 * Custom hook for calendar state and methods
 * Wraps the calendar store for easier use in components
 */

import { useCallback, useEffect } from 'react';
import { useCalendarStore } from '../stores';
import type { CalendarEvent } from '../services/api.types';

export const useCalendar = () => {
  const {
    viewMode,
    selectedDate,
    events,
    lunarPhases,
    isLoading,
    error,
    filters,
    setViewMode,
    setSelectedDate,
    loadEvents,
    loadLunarPhases,
    createEvent,
    updateEvent,
    deleteEvent,
    setFilters,
    clearError,
  } = useCalendarStore();

  // Load events for selected date
  // Note: API expects months 1-12, but Date.getMonth() returns 0-11
  useEffect(() => {
    if (selectedDate) {
      void loadEvents(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      void loadLunarPhases(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    }
  }, [selectedDate, loadEvents, loadLunarPhases]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  }, [selectedDate, setSelectedDate]);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  }, [selectedDate, setSelectedDate]);

  // Navigate to today
  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  // Navigate to specific date
  const goTo_date = useCallback((date: Date) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  // Create event wrapper
  const handleCreateEvent = useCallback(
    async (event: Partial<CalendarEvent>): Promise<boolean> => {
      try {
        await createEvent(event);
        return true;
      } catch {
        return false;
      }
    },
    [createEvent]
  );

  // Update event wrapper
  const handleUpdateEvent = useCallback(
    async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
      try {
        await updateEvent(id, updates);
        return true;
      } catch {
        return false;
      }
    },
    [updateEvent]
  );

  // Delete event wrapper
  const handleDeleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteEvent(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteEvent]
  );

  // Get events for specific date
  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      return events.filter((event) => {
        const eventDate = new Date(event.start_date);
        return (
          eventDate.toDateString() === date.toDateString() ||
          (event.end_date &&
            date >= new Date(event.start_date) &&
            date <= new Date(event.end_date))
        );
      });
    },
    [events]
  );

  // Get lunar phase for specific date
  const getLunarPhaseForDate = useCallback(
    (date: Date): typeof lunarPhases[0] | undefined => {
      return lunarPhases.find((phase) => {
        const phaseDate = new Date(phase.date);
        return phaseDate.toDateString() === date.toDateString();
      });
    },
    [lunarPhases]
  );

  // Toggle event type filter
  const toggleEventTypeFilter = useCallback((eventType: string) => {
    const currentFilters = filters.eventTypes;
    const newFilters = currentFilters.includes(eventType)
      ? currentFilters.filter((t) => t !== eventType)
      : [...currentFilters, eventType];

    setFilters({ eventTypes: newFilters });
  }, [filters.eventTypes, setFilters]);

  return {
    // State
    viewMode,
    selectedDate,
    events,
    lunarPhases,
    isLoading,
    error,
    filters,

    // Methods
    setViewMode,
    setSelectedDate,
    loadEvents,
    loadLunarPhases,
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    setFilters,
    clearError,

    // Navigation
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goTo_date,

    // Computed
    getEventsForDate,
    getLunarPhaseForDate,
    toggleEventTypeFilter,
  };
};

export default useCalendar;
