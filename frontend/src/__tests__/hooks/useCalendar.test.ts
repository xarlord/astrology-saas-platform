/**
 * Tests for useCalendar Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCalendar } from '../../hooks/useCalendar';
import type { CalendarEvent, LunarPhase } from '../../services/api.types';

// Mock calendar event data
const mockEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Test Event',
  type: 'custom',
  start_date: '2024-01-15T10:00:00Z',
  end_date: '2024-01-15T12:00:00Z',
  description: 'Test description',
};

const mockLunarPhase: LunarPhase = {
  date: '2024-01-15T00:00:00Z',
  phase: 'Full Moon',
  illumination: 100,
  sign: 'Cancer',
  degree: 25,
  influence: 'Emotional intensity',
};

// Mock the calendar store
const mockCalendarStore = {
  viewMode: 'month' as 'month' | 'week' | 'day' | 'list',
  selectedDate: new Date('2024-01-15'),
  events: [] as CalendarEvent[],
  lunarPhases: [] as LunarPhase[],
  isLoading: false,
  error: null as string | null,
  filters: {
    eventTypes: [] as string[],
    showGlobal: true,
    showPersonal: true,
  },
  setViewMode: vi.fn(),
  setSelectedDate: vi.fn(),
  loadEvents: vi.fn(),
  loadLunarPhases: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  setFilters: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useCalendarStore: vi.fn((selector?: (state: typeof mockCalendarStore) => unknown) => {
    if (selector) {
      return selector(mockCalendarStore);
    }
    return mockCalendarStore;
  }),
}));

describe('useCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalendarStore.viewMode = 'month';
    mockCalendarStore.selectedDate = new Date('2024-01-15');
    mockCalendarStore.events = [];
    mockCalendarStore.lunarPhases = [];
    mockCalendarStore.isLoading = false;
    mockCalendarStore.error = null;
    mockCalendarStore.filters = {
      eventTypes: [],
      showGlobal: true,
      showPersonal: true,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return calendar state from store', () => {
      const { result } = renderHook(() => useCalendar());

      expect(result.current.viewMode).toBe('month');
      expect(result.current.selectedDate).toEqual(new Date('2024-01-15'));
      expect(result.current.events).toEqual([]);
      expect(result.current.lunarPhases).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({
        eventTypes: [],
        showGlobal: true,
        showPersonal: true,
      });
    });
  });

  describe('auto-load on mount', () => {
    it('should load events and lunar phases when selectedDate changes', async () => {
      mockCalendarStore.loadEvents.mockResolvedValueOnce(undefined);
      mockCalendarStore.loadLunarPhases.mockResolvedValueOnce(undefined);

      renderHook(() => useCalendar());

      await waitFor(() => {
        // API expects months 1-12, so January (0) becomes 1
        expect(mockCalendarStore.loadEvents).toHaveBeenCalledWith(2024, 1);
        expect(mockCalendarStore.loadLunarPhases).toHaveBeenCalledWith(2024, 1);
      });
    });
  });

  describe('navigation', () => {
    it('should provide goToPreviousMonth function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.goToPreviousMonth).toBe('function');
    });

    it('should navigate to previous month', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.goToPreviousMonth();
      });

      expect(mockCalendarStore.setSelectedDate).toHaveBeenCalled();
      const newDate = mockCalendarStore.setSelectedDate.mock.calls[0][0];
      expect(newDate.getMonth()).toBe(11); // December
      expect(newDate.getFullYear()).toBe(2023);
    });

    it('should provide goToNextMonth function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.goToNextMonth).toBe('function');
    });

    it('should navigate to next month', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.goToNextMonth();
      });

      expect(mockCalendarStore.setSelectedDate).toHaveBeenCalled();
      const newDate = mockCalendarStore.setSelectedDate.mock.calls[0][0];
      expect(newDate.getMonth()).toBe(1); // February
      expect(newDate.getFullYear()).toBe(2024);
    });

    it('should provide goToToday function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.goToToday).toBe('function');
    });

    it('should navigate to today', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.goToToday();
      });

      expect(mockCalendarStore.setSelectedDate).toHaveBeenCalled();
      const newDate = mockCalendarStore.setSelectedDate.mock.calls[0][0];
      const today = new Date();
      expect(newDate.toDateString()).toBe(today.toDateString());
    });

    it('should provide goTo_date function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.goTo_date).toBe('function');
    });

    it('should navigate to specific date', () => {
      const { result } = renderHook(() => useCalendar());
      const targetDate = new Date('2025-06-15');

      act(() => {
        result.current.goTo_date(targetDate);
      });

      expect(mockCalendarStore.setSelectedDate).toHaveBeenCalledWith(targetDate);
    });
  });

  describe('createEvent', () => {
    it('should provide createEvent function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.createEvent).toBe('function');
    });

    it('should call store createEvent and return true on success', async () => {
      mockCalendarStore.createEvent.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCalendar());

      let createResult: boolean | undefined;
      await act(async () => {
        createResult = await result.current.createEvent({
          title: 'New Event',
          type: 'custom',
        });
      });

      expect(mockCalendarStore.createEvent).toHaveBeenCalled();
      expect(createResult).toBe(true);
    });

    it('should return false on createEvent failure', async () => {
      mockCalendarStore.createEvent.mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCalendar());

      let createResult: boolean | undefined;
      await act(async () => {
        createResult = await result.current.createEvent({
          title: 'New Event',
        });
      });

      expect(createResult).toBe(false);
    });
  });

  describe('updateEvent', () => {
    it('should provide updateEvent function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.updateEvent).toBe('function');
    });

    it('should call store updateEvent and return true on success', async () => {
      mockCalendarStore.updateEvent.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCalendar());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateEvent('event-1', {
          title: 'Updated Event',
        });
      });

      expect(mockCalendarStore.updateEvent).toHaveBeenCalledWith('event-1', {
        title: 'Updated Event',
      });
      expect(updateResult).toBe(true);
    });

    it('should return false on updateEvent failure', async () => {
      mockCalendarStore.updateEvent.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useCalendar());

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateEvent('event-1', {
          title: 'Updated',
        });
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('deleteEvent', () => {
    it('should provide deleteEvent function', () => {
      const { result } = renderHook(() => useCalendar());

      expect(typeof result.current.deleteEvent).toBe('function');
    });

    it('should call store deleteEvent and return true on success', async () => {
      mockCalendarStore.deleteEvent.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCalendar());

      let deleteResult: boolean | undefined;
      await act(async () => {
        deleteResult = await result.current.deleteEvent('event-1');
      });

      expect(mockCalendarStore.deleteEvent).toHaveBeenCalledWith('event-1');
      expect(deleteResult).toBe(true);
    });

    it('should return false on deleteEvent failure', async () => {
      mockCalendarStore.deleteEvent.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useCalendar());

      let deleteResult: boolean | undefined;
      await act(async () => {
        deleteResult = await result.current.deleteEvent('event-1');
      });

      expect(deleteResult).toBe(false);
    });
  });

  describe('getEventsForDate', () => {
    it('should return events for specific date', () => {
      mockCalendarStore.events = [mockEvent];

      const { result } = renderHook(() => useCalendar());

      const targetDate = new Date('2024-01-15');
      const events = result.current.getEventsForDate(targetDate);

      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(mockEvent);
    });

    it('should return empty array when no events match date', () => {
      mockCalendarStore.events = [mockEvent];

      const { result } = renderHook(() => useCalendar());

      const differentDate = new Date('2024-02-15');
      const events = result.current.getEventsForDate(differentDate);

      expect(events).toHaveLength(0);
    });

    it('should return multi-day events when date falls within range', () => {
      const multiDayEvent: CalendarEvent = {
        ...mockEvent,
        start_date: '2024-01-10T00:00:00Z',
        end_date: '2024-01-20T00:00:00Z',
      };
      mockCalendarStore.events = [multiDayEvent];

      const { result } = renderHook(() => useCalendar());

      const middleDate = new Date('2024-01-15');
      const events = result.current.getEventsForDate(middleDate);

      expect(events).toHaveLength(1);
    });
  });

  describe('getLunarPhaseForDate', () => {
    it('should return lunar phase for specific date', () => {
      mockCalendarStore.lunarPhases = [mockLunarPhase];

      const { result } = renderHook(() => useCalendar());

      const targetDate = new Date('2024-01-15');
      const phase = result.current.getLunarPhaseForDate(targetDate);

      expect(phase).toEqual(mockLunarPhase);
    });

    it('should return undefined when no phase matches date', () => {
      mockCalendarStore.lunarPhases = [mockLunarPhase];

      const { result } = renderHook(() => useCalendar());

      const differentDate = new Date('2024-02-15');
      const phase = result.current.getLunarPhaseForDate(differentDate);

      expect(phase).toBeUndefined();
    });
  });

  describe('toggleEventTypeFilter', () => {
    it('should add event type to filters when not present', () => {
      mockCalendarStore.filters.eventTypes = [];

      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.toggleEventTypeFilter('lunar-phase');
      });

      expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
        eventTypes: ['lunar-phase'],
      });
    });

    it('should remove event type from filters when present', () => {
      mockCalendarStore.filters.eventTypes = ['lunar-phase', 'transit'];

      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.toggleEventTypeFilter('lunar-phase');
      });

      expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({
        eventTypes: ['transit'],
      });
    });
  });

  describe('utility methods', () => {
    it('should expose setViewMode from store', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.setViewMode('week');
      });

      expect(mockCalendarStore.setViewMode).toHaveBeenCalledWith('week');
    });

    it('should expose setSelectedDate from store', () => {
      const { result } = renderHook(() => useCalendar());
      const newDate = new Date('2024-06-15');

      act(() => {
        result.current.setSelectedDate(newDate);
      });

      expect(mockCalendarStore.setSelectedDate).toHaveBeenCalledWith(newDate);
    });

    it('should expose setFilters from store', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.setFilters({ showGlobal: false });
      });

      expect(mockCalendarStore.setFilters).toHaveBeenCalledWith({ showGlobal: false });
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useCalendar());

      act(() => {
        result.current.clearError();
      });

      expect(mockCalendarStore.clearError).toHaveBeenCalled();
    });

    it('should expose loadEvents from store', () => {
      const { result } = renderHook(() => useCalendar());

      expect(result.current.loadEvents).toBe(mockCalendarStore.loadEvents);
    });

    it('should expose loadLunarPhases from store', () => {
      const { result } = renderHook(() => useCalendar());

      expect(result.current.loadLunarPhases).toBe(mockCalendarStore.loadLunarPhases);
    });
  });
});
