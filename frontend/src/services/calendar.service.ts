/**
 * Calendar API Service
 * API client for astrological calendar endpoints
 */

import axios from 'axios';
import {
  CalendarMonth,
  DailyWeather,
  UserReminder,
  ReminderFormData,
  CalendarExportParams,
} from '../types/calendar.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/calendar`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        error.config.headers.Authorization = `Bearer ${token}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Get calendar events for a month
 */
export async function getCalendarMonth(
  month: number,
  year: number
): Promise<CalendarMonth> {
  const response = await api.get('/month', {
    params: { month, year },
  });
  return response.data;
}

/**
 * Get detailed astrological weather for a specific day
 */
export async function getCalendarDay(date: string): Promise<DailyWeather> {
  const response = await api.get(`/day/${date}`);
  return response.data;
}

/**
 * Set up event reminders
 */
export async function setReminder(data: {
  eventType: string;
  reminderType: 'email' | 'push';
  reminderAdvanceHours: number[];
  isActive: boolean;
}): Promise<{ message: string; reminder: UserReminder }> {
  const response = await api.post('/reminders', data);
  return response.data;
}

/**
 * Export calendar as iCal file
 */
export async function exportCalendar(params: {
  startDate: string;
  endDate: string;
  includePersonal?: boolean;
}): Promise<Blob> {
  const response = await api.get('/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
}

export default {
  getCalendarMonth,
  getCalendarDay,
  setReminder,
  exportCalendar,
};
