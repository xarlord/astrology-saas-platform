/**
 * Calendar Component Tests
 * Testing CalendarView, DailyWeatherModal, ReminderSettings, and CalendarExport components
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { CalendarView } from '../../components/CalendarView';
import { DailyWeatherModal } from '../../components/DailyWeatherModal';
import { ReminderSettings } from '../../components/ReminderSettings';
import { CalendarExport } from '../../components/CalendarExport';

// Mock the calendar service
const mockGetCalendarMonth = vi.fn();
const mockSetReminder = vi.fn();
const mockExportCalendar = vi.fn();

vi.mock('../../services/calendar.service', () => ({
  getCalendarMonth: (...args: any[]) => mockGetCalendarMonth(...args),
  getCalendarDay: vi.fn(),
  setReminder: (...args: any[]) => mockSetReminder(...args),
  exportCalendar: (...args: any[]) => mockExportCalendar(...args),
}));

// Note: The actual imports are replaced by mocks above
// declare const mockGetCalendarMonth: any;
// declare const mockSetReminder: any;
// declare const mockExportCalendar: any;

describe('CalendarView Component', () => {
  const mockCalendarData = {
    meta: {
      month: 2,
      year: 2026,
      total: 1,
    },
    data: [
      {
        id: 'evt_1',
        user_id: null,
        event_type: 'retrograde',
        event_date: new Date('2026-02-15T00:00:00Z'),
        end_date: new Date('2026-02-25T00:00:00Z'),
        event_data: {
          intensity: 7,
          affectedPlanets: ['mercury'],
          description: 'Communication challenges',
          advice: ['Back up data'],
        },
        interpretation: null,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render calendar header with current month and year', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });
  });

  test('should navigate to previous month', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={3} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('March 2026')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous month/i });
    fireEvent.click(prevButton);

    // Component calls getCalendarMonth(year, month)
    await waitFor(() => {
      expect(mockGetCalendarMonth).toHaveBeenCalledWith(2026, 2);
    });
  });

  test('should navigate to next month', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next month/i });
    fireEvent.click(nextButton);

    // Component calls getCalendarMonth(year, month)
    await waitFor(() => {
      expect(mockGetCalendarMonth).toHaveBeenCalledWith(2026, 3);
    });
  });

  test('should show today button when not on current month', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    const today = new Date();
    render(
      <CalendarView
        initialMonth={today.getMonth() + 2}
        initialYear={today.getFullYear()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });
  });

  test('should display loading state', () => {
    mockGetCalendarMonth.mockImplementation(() => new Promise(() => void 0));

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();
  });

  test('should display error state', async () => {
    mockGetCalendarMonth.mockRejectedValue(new Error('API Error'));

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load calendar/i)).toBeInTheDocument();
    });
  });

  test('should render calendar grid with days', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('should show event badges for days with events', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      const day15 = screen.getAllByText('15');
      expect(day15.length).toBeGreaterThan(0);
    });
  });

  test('should display calendar legend', async () => {
    mockGetCalendarMonth.mockResolvedValue(mockCalendarData);

    render(<CalendarView initialMonth={2} initialYear={2026} />);

    await waitFor(() => {
      expect(screen.getByText(/favorable/i)).toBeInTheDocument();
      expect(screen.getByText(/moderate/i)).toBeInTheDocument();
      expect(screen.getByText(/challenging/i)).toBeInTheDocument();
    });
  });
});

describe('DailyWeatherModal Component', () => {
  const mockWeather = {
    date: '2026-02-15',
    summary: 'Favorable for creative work',
    rating: 7,
    color: '#10B981',
    moonPhase: {
      phase: 'waxing-gibbous' as const,
      illumination: 78,
      sign: 'taurus',
      degree: 15.5,
    },
    globalEvents: [],
    personalTransits: [],
    luckyActivities: ['creative work', 'meditation'],
    challengingActivities: [],
  };

  test('should render modal with date and weather info', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    expect(screen.getByText(/february 15, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/favorable for creative work/i)).toBeInTheDocument();
  });

  test('should display rating', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  test('should display moon phase information', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    expect(screen.getByText(/moon phase/i)).toBeInTheDocument();
    expect(screen.getByText(/waxing gibbous/i)).toBeInTheDocument();
    expect(screen.getByText(/taurus/i)).toBeInTheDocument();
    expect(screen.getByText(/78% illuminated/i)).toBeInTheDocument();
  });

  test('should display lucky activities', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    expect(screen.getByText(/favorable for:/i)).toBeInTheDocument();
    expect(screen.getByText('creative work')).toBeInTheDocument();
    expect(screen.getByText('meditation')).toBeInTheDocument();
  });

  test('should close modal when clicking close button', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('should close modal when clicking overlay', () => {
    const onClose = vi.fn();
    const { container } = render(
      <DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />
    );

    const overlay = container.querySelector('.modal-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  test('should not close modal when clicking modal content', () => {
    const onClose = vi.fn();
    render(<DailyWeatherModal date="2026-02-15" weather={mockWeather} onClose={onClose} />);

    const modalContent = screen.getByText(/february 15, 2026/i).closest('.modal-content');
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(onClose).not.toHaveBeenCalled();
    }
  });
});

describe('ReminderSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render reminder settings form', () => {
    render(<ReminderSettings />);

    expect(screen.getByText(/event reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/which events\?/i)).toBeInTheDocument();
    expect(screen.getByText(/how would you like to be notified\?/i)).toBeInTheDocument();
  });

  test('should allow selecting event type', async () => {
    render(<ReminderSettings />);

    const retrogradeOption = screen.getByLabelText(/retrogrades/i);
    fireEvent.click(retrogradeOption);

    expect(retrogradeOption).toBeChecked();
  });

  test('should allow selecting reminder type', () => {
    render(<ReminderSettings />);

    const emailOption = screen.getByLabelText(/email/i);
    const pushOption = screen.getByLabelText(/push notification/i);

    expect(emailOption).toBeInTheDocument();
    expect(pushOption).toBeInTheDocument();
  });

  test('should allow selecting advance hours', async () => {
    const user = userEvent.setup();
    render(<ReminderSettings />);

    const oneDayCheckbox = screen.getByLabelText(/1 day before/i);
    await user.click(oneDayCheckbox);

    expect(oneDayCheckbox).toBeChecked();
  });

  test('should allow toggling active state', () => {
    render(<ReminderSettings />);

    const toggleInput = screen.getByRole('checkbox', { name: /enable reminders/i });
    expect(toggleInput).toBeChecked();

    fireEvent.click(toggleInput);
    expect(toggleInput).not.toBeChecked();
  });

  test('should submit form and show success message', async () => {
    mockSetReminder.mockResolvedValue({
      message: 'Reminder saved successfully',
      reminder: {
        id: 'rem_1',
        userId: 'user_1',
        eventType: 'all',
        reminderType: 'email',
        reminderAdvanceHours: [24],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    render(<ReminderSettings />);

    const submitButton = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/reminder settings saved successfully/i)).toBeInTheDocument();
    });
  });

  test('should show error message on submission failure', async () => {
    mockSetReminder.mockRejectedValue({
      response: { data: { message: 'Failed to save' } },
    });

    render(<ReminderSettings />);

    const submitButton = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save/i)).toBeInTheDocument();
    });
  });
});

describe('CalendarExport Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and related functions
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    // Clean up any DOM elements added to body
    const body = document.body;
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });

  test('should render export form', () => {
    render(<CalendarExport />);

    expect(screen.getByText(/export calendar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
  });

  test('should pre-fill current month dates by default', () => {
    render(<CalendarExport />);

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const startDateInput = screen.getByLabelText(/from/i);
    expect(startDateInput).toHaveValue(firstDay);
  });

  test('should handle quick select buttons', () => {
    render(<CalendarExport />);

    const thisMonthButton = screen.getByRole('button', { name: /this month/i });
    fireEvent.click(thisMonthButton);

    const startDateInput = screen.getByLabelText(/from/i);
    const endDateInput = screen.getByLabelText(/to/i);

    // After clicking "This Month", dates should be set to first and last day of current month
    const today = new Date();
    const expectedFirstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const expectedLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    expect((startDateInput as HTMLInputElement).value).toBe(expectedFirstDay);
    expect((endDateInput as HTMLInputElement).value).toBe(expectedLastDay);
  });

  test('should export calendar when button clicked', async () => {
    const mockBlob = new Blob(['test iCal content'], { type: 'text/calendar' });
    mockExportCalendar.mockResolvedValue(mockBlob);

    render(<CalendarExport />);

    const exportButton = screen.getByRole('button', { name: /export as ical/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExportCalendar).toHaveBeenCalled();
    });
  });

  test('should show success message after export', async () => {
    const mockBlob = new Blob(['test iCal content'], { type: 'text/calendar' });
    mockExportCalendar.mockResolvedValue(mockBlob);

    render(<CalendarExport />);

    const exportButton = screen.getByRole('button', { name: /export as ical/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/calendar exported successfully/i)).toBeInTheDocument();
    });
  });

  test('should show error message when export fails', async () => {
    mockExportCalendar.mockRejectedValue(new Error('Export failed'));

    render(<CalendarExport />);

    const exportButton = screen.getByRole('button', { name: /export as ical/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to export calendar/i)).toBeInTheDocument();
    });
  });

  test('should validate date range', () => {
    render(<CalendarExport />);

    const startDateInput = screen.getByLabelText(/from/i);
    const endDateInput = screen.getByLabelText(/to/i);

    fireEvent.change(startDateInput, { target: { value: '2026-03-01' } });
    fireEvent.change(endDateInput, { target: { value: '2026-02-01' } });

    const exportButton = screen.getByRole('button', { name: /export as ical/i });
    fireEvent.click(exportButton);

    expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
  });

  test('should allow including/excluding personal transits', () => {
    render(<CalendarExport />);

    // Get checkbox by its ID since the accessible name may not match
    const checkbox = document.getElementById('includePersonal') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
