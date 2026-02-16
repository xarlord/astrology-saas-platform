/**
 * CalendarExport Component
 * Allows users to export astrological calendar as iCal file
 */

import React, { useState } from 'react';
import { Download, Calendar, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { exportCalendar } from '../services/calendar.service';
import { CalendarExportParams } from '../types/calendar.types';
import '../styles/CalendarExport.css';

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
      const blob = await exportCalendar(params);

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export calendar');
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
    <div className="calendar-export">
      <div className="export-header">
        <div className="header-icon">
          <FileDown size={24} />
        </div>
        <div>
          <h2>Export Calendar</h2>
          <p>Download your astrological calendar as an iCal file</p>
        </div>
      </div>

      <div className="export-content">
        {/* Quick Select */}
        <div className="export-section">
          <label className="section-label">Quick Select</label>
          <div className="quick-select-buttons">
            <button
              type="button"
              onClick={() => handleQuickSelect('this-month')}
              className="btn-quick-select"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('this-quarter')}
              className="btn-quick-select"
            >
              This Quarter
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('this-year')}
              className="btn-quick-select"
            >
              This Year
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="export-section">
          <label className="section-label">Custom Date Range</label>
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label htmlFor="startDate">From</label>
              <input
                id="startDate"
                type="date"
                value={params.startDate}
                onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                className="date-input"
              />
            </div>

            <div className="date-input-group">
              <label htmlFor="endDate">To</label>
              <input
                id="endDate"
                type="date"
                value={params.endDate}
                min={params.startDate}
                onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                className="date-input"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="export-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={params.includePersonal}
              onChange={(e) => setParams({ ...params, includePersonal: e.target.checked })}
              id="includePersonal"
            />
            <span className="checkbox-text">Include my personal transits</span>
          </label>
          <div className="form-hint">
            <AlertCircle size={14} />
            <span>Uncheck to export only global astrological events (retrogrades, eclipses, moon phases)</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircle size={20} />
            <span>Calendar exported successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Export Button */}
        <div className="export-actions">
          <button onClick={handleExport} className="btn-export" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export as iCal
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="export-info">
          <div className="info-item">
            <Calendar size={16} />
            <span>Compatible with Google Calendar, Outlook, Apple Calendar, and more</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarExport;
