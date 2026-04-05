/**
 * CalendarExport Component
 * Allows users to export astrological calendar as iCal file
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-case-declarations */

import { useState } from 'react';

import { exportCalendar } from '../services/calendar.service';
import { CalendarExportParams } from '../types/calendar.types';

interface CalendarExportProps {
  onExportComplete?: (filename: string) => void;
}

export function CalendarExport({ onExportComplete }: CalendarExportProps) {
  const [params, setParams] = useState<CalendarExportParams>({
    startDate: getStartOfMonth(),
    endDate: getEndOfMonth(),
    includePersonal: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getStartOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }

  function getEndOfMonth(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  const handleExport = async () => {
    if (!params.startDate || !params.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (startDate > endDate) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const startDate = new Date(params.startDate);
      const blob = await exportCalendar(startDate.getFullYear(), startDate.getMonth() + 1);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astrological-calendar-${params.startDate}-to-${params.endDate}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      onExportComplete?.(link.download);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message ?? 'Failed to export calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (range: 'this-month' | 'this-quarter' | 'this-year') => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'this-quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
    }

    setParams({
      ...params,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="max-w-[600px] mx-auto p-6 sm:p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="flex gap-4 mb-8 items-start sm:flex-col sm:items-center sm:text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-500 rounded-xl shrink-0">
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>file_download</span>
        </div>
        <div>
          <h2 className="m-0 mb-1 text-2xl font-semibold text-gray-900">Export Calendar</h2>
          <p className="m-0 text-sm text-gray-500">Download your astrological calendar as an iCal file</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Quick Select */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">Quick Select</label>
          <div className="flex gap-2 flex-wrap sm:flex-col">
            <button
              type="button"
              onClick={() => handleQuickSelect('this-month')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:bg-blue-50 hover:text-indigo-500 sm:w-full"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('this-quarter')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:bg-blue-50 hover:text-indigo-500 sm:w-full"
            >
              This Quarter
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('this-year')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-gray-700 cursor-pointer transition-all duration-200 hover:border-indigo-500 hover:bg-blue-50 hover:text-indigo-500 sm:w-full"
            >
              This Year
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">Custom Date Range</label>
          <div className="flex gap-4 sm:flex-col sm:gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="startDate" className="text-xs font-medium text-gray-500">From</label>
              <input
                id="startDate"
                type="date"
                value={params.startDate}
                onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                className="px-3 py-2.5 border border-gray-200 rounded-md text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor="endDate" className="text-xs font-medium text-gray-500">To</label>
              <input
                id="endDate"
                type="date"
                value={params.endDate}
                min={params.startDate}
                onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                className="px-3 py-2.5 border border-gray-200 rounded-md text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.includePersonal}
              onChange={(e) => setParams({ ...params, includePersonal: e.target.checked })}
              id="includePersonal"
              className="w-[18px] h-[18px] accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Include my personal transits</span>
          </label>
          <div className="flex items-start gap-1.5 px-3 py-2 bg-green-50 border-l-[3px] border-emerald-500 rounded bg-[#f0fdf4] text-[13px] text-green-800 leading-snug">
            <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '14px' }}>error</span>
            <span>Uncheck to export only global astrological events (retrogrades, eclipses, moon phases)</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg text-green-800 text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
            <span>Calendar exported successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Export Button */}
        <div className="pt-2 border-t border-gray-200">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-indigo-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Export as iCal
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-[13px] text-blue-800">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
            <span>Compatible with Google Calendar, Outlook, Apple Calendar, and more</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarExport;
