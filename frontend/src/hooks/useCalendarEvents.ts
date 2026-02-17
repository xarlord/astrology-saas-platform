/**
 * Calendar Events Hook
 * Custom React Query hook for fetching calendar events
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import calendarService from '../services/calendar.service';

export function useCalendarEvents(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: ['calendar', 'month', year, month],
    queryFn: () => calendarService.getMonthEvents(year, month),
    enabled,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  const mutation = async (event: {
    event_type: string;
    event_date: Date;
    end_date?: Date;
    event_data?: any;
    interpretation?: string;
  }) => {
    return await calendarService.createCustomEvent(event);
  };

  return {
    mutateAsync: mutation,
    // Invalidate and refetch calendar events after creating a new one
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  };
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  const mutation = async (id: string) => {
    await calendarService.deleteEvent(id);
  };

  return {
    mutateAsync: mutation,
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  };
}
