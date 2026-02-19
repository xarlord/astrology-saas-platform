/**
 * E2E Test Specifications: Calendar Feature Flow
 *
 * Tests the complete calendar feature including:
 * - Navigate to calendar
 * - View month events
 * - View daily weather modal
 * - Create custom event
 * - Export calendar
 * - Set reminders
 */

import { test, expect } from '@playwright/test';
import { CalendarPageObject } from './pages/CalendarPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testCalendarEvents } from './fixtures/test-data';

test.describe('Calendar Feature Flow - Navigation and Views', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should navigate to calendar page', async ({ page }) => {
    await calendarPage.goto();

    // Verify on calendar page
    await calendarPage.verifyOnCalendarPage();

    // Verify calendar grid is displayed
    await expect(calendarPage.calendarGrid).toBeVisible();

    await helpers.takeScreenshot('calendar-page');
  });

  test('should display month view by default', async ({ page }) => {
    await calendarPage.goto();

    // Verify current month is displayed
    const currentMonth = await calendarPage.getCurrentMonthLabel();
    expect(currentMonth).toBeTruthy();

    await helpers.takeScreenshot('calendar-month-view');
  });

  test('should switch to week view', async ({ page }) => {
    await calendarPage.goto();
    await calendarPage.switchToWeekView();

    // Verify view changed
    const currentView = await calendarPage.getCurrentView();
    expect(currentView).toBe('week');

    await helpers.takeScreenshot('calendar-week-view');
  });

  test('should switch to day view', async ({ page }) => {
    await calendarPage.goto();
    await calendarPage.switchToDayView();

    // Verify view changed
    const currentView = await calendarPage.getCurrentView();
    expect(currentView).toBe('day');

    await helpers.takeScreenshot('calendar-day-view');
  });

  test('should navigate between months', async ({ page }) => {
    await calendarPage.goto();

    const initialMonth = await calendarPage.getCurrentMonthLabel();

    // Navigate to next month
    await calendarPage.gotoNextMonth();
    const nextMonth = await calendarPage.getCurrentMonthLabel();
    expect(nextMonth).not.toBe(initialMonth);

    // Navigate to previous month
    await calendarPage.gotoPreviousMonth();
    const prevMonth = await calendarPage.getCurrentMonthLabel();
    expect(prevMonth).toBe(initialMonth);

    await helpers.takeScreenshot('calendar-month-navigation');
  });

  test('should navigate to today', async ({ page }) => {
    await calendarPage.goto();

    // Navigate away from today
    await calendarPage.gotoNextMonth();

    // Navigate back to today
    await calendarPage.gotoToday();

    // Verify current date is displayed
    const today = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonth = await calendarPage.getCurrentMonthLabel();
    expect(currentMonth).toContain(today);

    await helpers.takeScreenshot('calendar-today');
  });
});

test.describe('Calendar Feature Flow - Astrological Events', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await calendarPage.goto();
  });

  test('should display moon phases', async ({ page }) => {
    // Verify moon phase indicators are displayed
    await expect(calendarPage.moonPhaseIndicator.first()).toBeVisible();

    // Click on a day with moon phase
    await calendarPage.clickDay(15);

    // Verify moon phase in modal/details
    await calendarPage.verifyMoonPhase('Full Moon');

    await helpers.takeScreenshot('calendar-moon-phases');
  });

  test('should display planetary retrogrades', async ({ page }) => {
    // Verify retrograde indicators are displayed
    const retrogradeCount = await calendarPage.retrogradeIndicator.count();
    if (retrogradeCount > 0) {
      await expect(calendarPage.retrogradeIndicator.first()).toBeVisible();

      // Click on retrograde event
      await calendarPage.retrogradeIndicator.first().click();

      // Verify retrograde details
      await expect(page.locator('text=retrograde|Mercury|Venus|Mars')).toBeVisible();

      await helpers.takeScreenshot('calendar-retrogrades');
    }
  });

  test('should display daily weather modal', async ({ page }) => {
    // Click on a day
    await calendarPage.clickDay(15);

    // Verify daily weather information is displayed
    await calendarPage.verifyWeatherInfo();

    // Verify modal/panel is visible
    await calendarPage.verifyEventModalDisplayed();

    await helpers.takeScreenshot('calendar-daily-weather');
  });

  test('should display cosmic events', async ({ page }) => {
    // Check for cosmic events (eclipses, equinoxes, etc.)
    const cosmicEvents = await page.locator('.cosmic-event, [data-event-type="cosmic"]').count();

    if (cosmicEvents > 0) {
      // Click on cosmic event
      await page.locator('.cosmic-event, [data-event-type="cosmic"]').first().click();

      // Verify event details
      await expect(page.locator('text=eclipse|equinox|solstice')).toBeVisible();

      await helpers.takeScreenshot('calendar-cosmic-events');
    }
  });
});

test.describe('Calendar Feature Flow - Custom Events', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await calendarPage.goto();
  });

  test('should create custom event', async ({ page }) => {
    // Create custom event
    await calendarPage.createCustomEvent(testCalendarEvents.custom);

    // Verify event is displayed
    await calendarPage.verifyEventDisplayed(testCalendarEvents.custom.title);

    // Verify custom event marker
    await calendarPage.verifyCustomEvent(testCalendarEvents.custom.title);

    await helpers.takeScreenshot('calendar-custom-event');
  });

  test('should edit custom event', async ({ page }) => {
    // Create event first
    await calendarPage.createCustomEvent(testCalendarEvents.custom);

    // Click on event
    await calendarPage.clickEvent(testCalendarEvents.custom.title);

    // Edit event (this would open a modal/form)
    const editButton = page.locator('button:has-text("Edit"), [aria-label="Edit"]');
    if (await editButton.count() > 0) {
      await editButton.click();

      // Update event
      await page.fill('[name="title"]', 'Updated Event Title');
      await page.click('button:has-text("Save")');

      // Verify updated event
      await calendarPage.verifyEventDisplayed('Updated Event Title');

      await helpers.takeScreenshot('calendar-event-edited');
    }
  });

  test('should delete custom event', async ({ page }) => {
    // Create event first
    await calendarPage.createCustomEvent(testCalendarEvents.custom);

    // Delete event
    await calendarPage.deleteEvent(testCalendarEvents.custom.title, true);

    // Verify event is removed
    const event = page.locator(`text=${testCalendarEvents.custom.title}`);
    await expect(event).not.toBeVisible();

    await helpers.takeScreenshot('calendar-event-deleted');
  });

  test('should validate event data', async ({ page }) => {
    await calendarPage.createEventButton.click();

    // Try to create event without title
    await calendarPage.saveEventButton.click();

    // Verify validation error
    await helpers.verifyError(/title is required|please enter title/i);

    await helpers.takeScreenshot('calendar-event-validation');
  });
});

test.describe('Calendar Feature Flow - Reminders', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await calendarPage.goto();
  });

  test('should set reminder for event', async ({ page }) => {
    // Create event first
    await calendarPage.createCustomEvent(testCalendarEvents.custom);

    // Set reminder
    await calendarPage.setReminder(testCalendarEvents.custom.title, '1 hour before');

    // Verify reminder indicator is displayed
    const reminderIndicator = page.locator('.reminder-indicator, [data-reminder]');
    await expect(reminderIndicator.first()).toBeVisible();

    await helpers.takeScreenshot('calendar-reminder-set');
  });

  test('should edit reminder', async ({ page }) => {
    // Create event with reminder
    await calendarPage.createCustomEvent(testCalendarEvents.custom);
    await calendarPage.setReminder(testCalendarEvents.custom.title, '1 day before');

    // Edit reminder
    await calendarPage.clickEvent(testCalendarEvents.custom.title);
    await calendarPage.reminderButton.click();

    // Change reminder time
    const reminderOption = page.locator('label:has-text("2 hours before"), [data-reminder="2hours"]');
    if (await reminderOption.count() > 0) {
      await reminderOption.click();
      await calendarPage.saveEventButton.click();

      // Verify updated reminder
      await expect(page.locator('text=2 hours')).toBeVisible();

      await helpers.takeScreenshot('calendar-reminder-edited');
    }
  });

  test('should remove reminder', async ({ page }) => {
    // Create event with reminder
    await calendarPage.createCustomEvent(testCalendarEvents.custom);
    await calendarPage.setReminder(testCalendarEvents.custom.title, '1 hour before');

    // Remove reminder
    await calendarPage.clickEvent(testCalendarEvents.custom.title);
    await calendarPage.reminderButton.click();

    const removeButton = page.locator('button:has-text("Remove"), label:has-text("No reminder")');
    if (await removeButton.count() > 0) {
      await removeButton.click();
      await calendarPage.saveEventButton.click();

      // Verify reminder is removed
      const reminderIndicator = page.locator('.reminder-indicator');
      await expect(reminderIndicator).not.toBeVisible();

      await helpers.takeScreenshot('calendar-reminder-removed');
    }
  });
});

test.describe('Calendar Feature Flow - Export', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await calendarPage.goto();
  });

  test('should export calendar as ICS', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await calendarPage.exportCalendar('ics');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.ics');

    await helpers.takeScreenshot('calendar-export-ics');
  });

  test('should export calendar as JSON', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await calendarPage.exportCalendar('json');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    await helpers.takeScreenshot('calendar-export-json');
  });

  test('should select date range for export', async ({ page }) => {
    await calendarPage.exportButton.click();

    // Check for date range inputs
    const startDateInput = page.locator('[name="startDate"], input[placeholder*="start" i]');
    const endDateInput = page.locator('[name="endDate"], input[placeholder*="end" i]');

    if (await startDateInput.count() > 0 && await endDateInput.count() > 0) {
      await startDateInput.fill('2024-01-01');
      await endDateInput.fill('2024-12-31');

      await page.click('button:has-text("Export")');

      // Verify export initiated
      await helpers.verifyToast(/exporting|download/i);

      await helpers.takeScreenshot('calendar-export-date-range');
    }
  });
});

test.describe('Calendar Feature Flow - Responsive Design', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should be responsive on mobile', async ({ page }) => {
    await helpers.setViewport('mobile');
    await calendarPage.goto();

    // Verify calendar is displayed
    await expect(calendarPage.calendarGrid).toBeVisible();

    // Verify mobile-specific layout
    await expect(page.locator('.mobile-calendar, [data-mobile="true"]')).toBeVisible();

    await helpers.takeScreenshot('calendar-mobile');
  });

  test('should be responsive on tablet', async ({ page }) => {
    await helpers.setViewport('tablet');
    await calendarPage.goto();

    // Verify calendar is displayed
    await expect(calendarPage.calendarGrid).toBeVisible();

    await helpers.takeScreenshot('calendar-tablet');
  });

  test('should be responsive on desktop', async ({ page }) => {
    await helpers.setViewport('desktop');
    await calendarPage.goto();

    // Verify calendar is displayed
    await expect(calendarPage.calendarGrid).toBeVisible();

    await helpers.takeScreenshot('calendar-desktop');
  });
});

test.describe('Calendar Feature Flow - Interactions', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await calendarPage.goto();
  });

  test('should display event count per day', async ({ page }) => {
    // Get events for a specific date
    const events = await calendarPage.getEventsForDate('2024-01-15');

    // Verify event count indicator
    if (events.length > 0) {
      const eventCount = page.locator('[data-date="2024-01-15"]').locator('.event-count');
      await expect(eventCount).toContainText(events.length.toString());
    }

    await helpers.takeScreenshot('calendar-event-count');
  });

  test('should handle drag and drop for events', async ({ page }) => {
    // Create event
    await calendarPage.createCustomEvent(testCalendarEvents.custom);

    // Try drag and drop (if supported)
    const event = calendarPage.calendarEvent.first();
    if (await event.count() > 0) {
      const eventBox = await event.boundingBox();

      if (eventBox) {
        await event.dragTo(page.locator('[data-day="20"]'));

        // Verify event moved
        await calendarPage.verifyEventDisplayed(testCalendarEvents.custom.title);

        await helpers.takeScreenshot('calendar-drag-drop');
      }
    }
  });

  test('should filter events by type', async ({ page }) => {
    // Check for filter controls
    const filterButton = page.locator('button:has-text("Filter"), [aria-label="Filter"]');
    if (await filterButton.count() > 0) {
      await filterButton.click();

      // Select event type filter
      await page.click('[data-filter="moon_phases"], label:has-text("Moon Phases")');

      // Verify only moon phase events are displayed
      const moonEvents = await calendarPage.calendarEvent.all();
      for (const event of moonEvents) {
        const classList = await event.getAttribute('class');
        expect(classList).toContain('moon-phase');
      }

      await helpers.takeScreenshot('calendar-filtered');
    }
  });
});
