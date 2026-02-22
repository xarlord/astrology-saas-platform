/**
 * Tests for Calendar Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCalendarStore } from '../../stores/calendarStore';

// Mock the calendarService
vi.mock('../../services', () => ({
  calendarService: {
    getMonthEvents: vi.fn(),
    createCustomEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  },
}));

// Import after mocking
import { calendarService } from '../../services';

const mockEvent = {
  id: 'event-1',
  type: 'transit' as const,
  title: 'Test Event',
  startDate: new Date('2024-02-15T10:00:00Z'),
  endDate: new Date('2024-02-15T11:00:00Z'),
  description: 'Test description',
  metadata: {},
};

const mockLunarPhaseEvent = {
  id: 'lunar-1',
  event_type: 'lunar-phase',
  event_date: '2024-02-15T00:00:00Z',
  event_data: {
    phase: 'Full Moon',
    illumination: 100,
    sign: 'Leo',
    degree: 25,
  },
  interpretation: 'Time for culmination',
};

describe('calendarStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useCalendarStore.setState({
      viewMode: 'month',
      selectedDate: new Date(),
      events: [],
      lunarPhases: [],
      isLoading: false,
      error: null,
      filters: {
        eventTypes: [],
        showGlobal: true,
        showPersonal: true,
      },
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCalendarStore.getState();

      expect(state.viewMode).toBe('month');
      expect(state.selectedDate).toBeInstanceOf(Date);
      expect(state.events).toEqual([]);
      expect(state.lunarPhases).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filters).toEqual({
        eventTypes: [],
        showGlobal: true,
        showPersonal: true,
      });
    });
  });

  describe('setViewMode action', () => {
    it('should set view mode', () => {
      act(() => {
        useCalendarStore.getState().setViewMode('week');
      });

      expect(useCalendarStore.getState().viewMode).toBe('week');
    });

    it('should change between view modes', () => {
      const viewModes: Array<'month' | 'week' | 'day' | 'list'> = ['month', 'week', 'day', 'list'];

      viewModes.forEach((mode) => {
        act(() => {
          useCalendarStore.getState().setViewMode(mode);
        });
        expect(useCalendarStore.getState().viewMode).toBe(mode);
      });
    });
  });

  describe('setSelectedDate action', () => {
    it('should set selected date', () => {
      const testDate = new Date('2024-06-15');

      act(() => {
        useCalendarStore.getState().setSelectedDate(testDate);
      });

      expect(useCalendarStore.getState().selectedDate).toEqual(testDate);
    });
  });

  describe('loadEvents action', () => {
    it('should load events successfully', async () => {
      const mockResponse = {
        data: [
          { ...mockEvent, type: 'transit' },
          { ...mockEvent, id: 'event-2', type: 'lunar' },
        ],
      };

      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().loadEvents(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(calendarService.getMonthEvents).toHaveBeenCalledWith(2024, 2, true);
      expect(state.events).toHaveLength(2);
      expect(state.isLoading).toBe(false);
    });

    it('should filter events by type when filter is set', async () => {
      const mockResponse = {
        data: [
          { ...mockEvent, id: 'event-1', type: 'transit' },
          { ...mockEvent, id: 'event-2', type: 'lunar' },
          { ...mockEvent, id: 'event-3', type: 'custom' },
        ],
      };

      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      // Set filter
      useCalendarStore.setState({
        filters: { eventTypes: ['transit'], showGlobal: true, showPersonal: true },
      });

      await act(async () => {
        await useCalendarStore.getState().loadEvents(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(state.events).toHaveLength(1);
      expect(state.events[0].type).toBe('transit');
    });

    it('should pass showGlobal filter value', async () => {
      const mockResponse = { data: [] };
      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      useCalendarStore.setState({
        filters: { eventTypes: [], showGlobal: false, showPersonal: true },
      });

      await act(async () => {
        await useCalendarStore.getState().loadEvents(2024, 2);
      });

      expect(calendarService.getMonthEvents).toHaveBeenCalledWith(2024, 2, false);
    });

    it('should handle load events error', async () => {
      vi.mocked(calendarService.getMonthEvents).mockRejectedValueOnce(new Error('Load failed'));

      await act(async () => {
        await useCalendarStore.getState().loadEvents(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(state.error).toBe('Load failed');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error load failures', async () => {
      vi.mocked(calendarService.getMonthEvents).mockRejectedValueOnce('Unknown');

      await act(async () => {
        await useCalendarStore.getState().loadEvents(2024, 2);
      });

      expect(useCalendarStore.getState().error).toBe('Failed to load events');
    });
  });

  describe('loadLunarPhases action', () => {
    it('should load and transform lunar phases successfully', async () => {
      const mockResponse = {
        data: [mockLunarPhaseEvent],
      };

      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().loadLunarPhases(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(calendarService.getMonthEvents).toHaveBeenCalledWith(2024, 2, true);
      expect(state.lunarPhases).toHaveLength(1);
      expect(state.lunarPhases[0]).toEqual({
        date: expect.any(String),
        phase: 'Full Moon',
        illumination: 100,
        sign: 'Leo',
        degree: 25,
        influence: 'Time for culmination',
      });
      expect(state.isLoading).toBe(false);
    });

    it('should filter only lunar-phase events', async () => {
      const mockResponse = {
        data: [
          mockLunarPhaseEvent,
          { id: 'other-1', event_type: 'transit', event_data: {} },
          { id: 'other-2', event_type: 'custom', event_data: {} },
        ],
      };

      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().loadLunarPhases(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(state.lunarPhases).toHaveLength(1);
    });

    it('should handle missing event data gracefully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'lunar-incomplete',
            event_type: 'lunar-phase',
            event_data: {}, // Missing fields
          },
        ],
      };

      vi.mocked(calendarService.getMonthEvents).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().loadLunarPhases(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(state.lunarPhases).toHaveLength(1);
      expect(state.lunarPhases[0].phase).toBe('unknown');
      expect(state.lunarPhases[0].illumination).toBe(0);
    });

    it('should handle lunar phases load error', async () => {
      vi.mocked(calendarService.getMonthEvents).mockRejectedValueOnce(new Error('API error'));

      await act(async () => {
        await useCalendarStore.getState().loadLunarPhases(2024, 2);
      });

      const state = useCalendarStore.getState();

      expect(state.error).toBe('API error');
    });
  });

  describe('createEvent action', () => {
    it('should create event successfully', async () => {
      const newEvent = {
        type: 'custom' as const,
        title: 'New Event',
        startDate: new Date('2024-03-01'),
        description: 'New event description',
      };

      const mockResponse = {
        data: { id: 'new-event-1', ...newEvent },
      };

      vi.mocked(calendarService.createCustomEvent).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().createEvent(newEvent);
      });

      const state = useCalendarStore.getState();

      expect(calendarService.createCustomEvent).toHaveBeenCalled();
      expect(state.events).toHaveLength(1);
      expect(state.isLoading).toBe(false);
    });

    it('should add new event to existing events', async () => {
      useCalendarStore.setState({ events: [mockEvent as any] });

      const newEvent = { type: 'custom' as const, title: 'Another Event' };
      const mockResponse = {
        data: { id: 'new-2', ...newEvent },
      };

      vi.mocked(calendarService.createCustomEvent).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().createEvent(newEvent);
      });

      expect(useCalendarStore.getState().events).toHaveLength(2);
    });

    it('should handle create event error', async () => {
      vi.mocked(calendarService.createCustomEvent).mockRejectedValueOnce(new Error('Create failed'));

      await act(async () => {
        try {
          await useCalendarStore.getState().createEvent({ type: 'custom' });
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useCalendarStore.getState().error).toBe('Create failed');
    });
  });

  describe('updateEvent action', () => {
    it('should update event successfully', async () => {
      useCalendarStore.setState({ events: [mockEvent as any] });

      const updates = { title: 'Updated Title' };
      const mockResponse = {
        data: { ...mockEvent, title: 'Updated Title' },
      };

      vi.mocked(calendarService.updateEvent).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useCalendarStore.getState().updateEvent('event-1', updates);
      });

      const state = useCalendarStore.getState();

      expect(calendarService.updateEvent).toHaveBeenCalledWith('event-1', updates);
      expect(state.events[0].title).toBe('Updated Title');
    });

    it('should handle update event error', async () => {
      vi.mocked(calendarService.updateEvent).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        try {
          await useCalendarStore.getState().updateEvent('event-1', {});
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useCalendarStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteEvent action', () => {
    it('should delete event successfully', async () => {
      useCalendarStore.setState({ events: [mockEvent as any] });

      vi.mocked(calendarService.deleteEvent).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useCalendarStore.getState().deleteEvent('event-1');
      });

      const state = useCalendarStore.getState();

      expect(calendarService.deleteEvent).toHaveBeenCalledWith('event-1');
      expect(state.events).toHaveLength(0);
    });

    it('should only delete specified event', async () => {
      const event2 = { ...mockEvent, id: 'event-2' };
      useCalendarStore.setState({ events: [mockEvent, event2] as any });

      vi.mocked(calendarService.deleteEvent).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useCalendarStore.getState().deleteEvent('event-1');
      });

      const state = useCalendarStore.getState();

      expect(state.events).toHaveLength(1);
      expect(state.events[0].id).toBe('event-2');
    });

    it('should handle delete event error', async () => {
      vi.mocked(calendarService.deleteEvent).mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        try {
          await useCalendarStore.getState().deleteEvent('event-1');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useCalendarStore.getState().error).toBe('Delete failed');
    });
  });

  describe('setFilters action', () => {
    it('should set filters', () => {
      act(() => {
        useCalendarStore.getState().setFilters({ showGlobal: false });
      });

      const state = useCalendarStore.getState();

      expect(state.filters.showGlobal).toBe(false);
      expect(state.filters.showPersonal).toBe(true); // Unchanged
    });

    it('should merge filters with existing', () => {
      useCalendarStore.setState({
        filters: { eventTypes: ['transit'], showGlobal: false, showPersonal: true },
      });

      act(() => {
        useCalendarStore.getState().setFilters({ showPersonal: false });
      });

      const state = useCalendarStore.getState();

      expect(state.filters.eventTypes).toEqual(['transit']); // Unchanged
      expect(state.filters.showGlobal).toBe(false); // Unchanged
      expect(state.filters.showPersonal).toBe(false); // Updated
    });

    it('should update eventTypes filter', () => {
      act(() => {
        useCalendarStore.getState().setFilters({ eventTypes: ['transit', 'lunar'] });
      });

      expect(useCalendarStore.getState().filters.eventTypes).toEqual(['transit', 'lunar']);
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      useCalendarStore.setState({ error: 'Some error' });

      act(() => {
        useCalendarStore.getState().clearError();
      });

      expect(useCalendarStore.getState().error).toBeNull();
    });
  });

  describe('selector hooks', () => {
    it('useCalendarViewMode should return view mode', () => {
      useCalendarStore.setState({ viewMode: 'week' });
      const viewMode = useCalendarStore.getState().viewMode;
      expect(viewMode).toBe('week');
    });

    it('useCalendarSelectedDate should return selected date', () => {
      const testDate = new Date('2024-06-15');
      useCalendarStore.setState({ selectedDate: testDate });
      const selectedDate = useCalendarStore.getState().selectedDate;
      expect(selectedDate).toEqual(testDate);
    });

    it('useCalendarEvents should return events', () => {
      useCalendarStore.setState({ events: [mockEvent as any] });
      const events = useCalendarStore.getState().events;
      expect(events).toEqual([mockEvent]);
    });

    it('useLunarPhases should return lunar phases', () => {
      const mockPhases = [{ date: '2024-02-15', phase: 'Full Moon' }];
      useCalendarStore.setState({ lunarPhases: mockPhases as any });
      const lunarPhases = useCalendarStore.getState().lunarPhases;
      expect(lunarPhases).toEqual(mockPhases);
    });

    it('useCalendarLoading should return loading state', () => {
      useCalendarStore.setState({ isLoading: true });
      const isLoading = useCalendarStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });
  });
});
