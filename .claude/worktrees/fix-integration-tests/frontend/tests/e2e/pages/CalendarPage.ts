/**
 * Calendar Page Object Model
 * Encapsulates calendar feature interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

export class CalendarPageObject {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly calendarGrid: Locator;
  readonly monthViewButton: Locator;
  readonly weekViewButton: Locator;
  readonly dayViewButton: Locator;
  readonly previousMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly currentMonthLabel: Locator;
  readonly calendarEvent: Locator;
  readonly eventModal: Locator;
  readonly createEventButton: Locator;
  readonly eventTitleInput: Locator;
  readonly eventDateInput: Locator;
  readonly eventTimeInput: Locator;
  readonly eventNotesInput: Locator;
  readonly saveEventButton: Locator;
  readonly deleteEventButton: Locator;
  readonly exportButton: Locator;
  readonly reminderButton: Locator;
  readonly weatherInfo: Locator;
  readonly moonPhaseIndicator: Locator;
  readonly retrogradeIndicator: Locator;
  readonly customEventMarker: Locator;
  readonly todayButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.calendarGrid = page.locator('.calendar-grid, [data-testid="calendar-grid"]');
    this.monthViewButton = page.locator('button:has-text("Month"), [aria-label="Month view"]');
    this.weekViewButton = page.locator('button:has-text("Week"), [aria-label="Week view"]');
    this.dayViewButton = page.locator('button:has-text("Day"), [aria-label="Day view"]');
    this.previousMonthButton = page.locator('button[aria-label="Previous"], button:has-text("←")');
    this.nextMonthButton = page.locator('button[aria-label="Next"], button:has-text("→")');
    this.currentMonthLabel = page.locator('.current-month, [data-testid="current-month"]');
    this.calendarEvent = page.locator('.calendar-event, [data-testid="calendar-event"]');
    this.eventModal = page.locator('.event-modal, .modal, [data-testid="event-modal"]');
    this.createEventButton = page.locator('button:has-text("Create Event"), button:has-text("Add Event")');
    this.eventTitleInput = page.locator('[name="title"], [name="eventTitle"]');
    this.eventDateInput = page.locator('[name="date"], [name="eventDate"], input[type="date"]');
    this.eventTimeInput = page.locator('[name="time"], [name="eventTime"], input[type="time"]');
    this.eventNotesInput = page.locator('[name="notes"], [name="eventNotes"], textarea');
    this.saveEventButton = page.locator('button:has-text("Save"), button:has-text("Create")');
    this.deleteEventButton = page.locator('button:has-text("Delete")');
    this.exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    this.reminderButton = page.locator('button:has-text("Reminder"), [aria-label="Set reminder"]');
    this.weatherInfo = page.locator('.weather-info, [data-testid="weather"]');
    this.moonPhaseIndicator = page.locator('.moon-phase, [data-testid="moon-phase"]');
    this.retrogradeIndicator = page.locator('.retrograde, [data-testid="retrograde"]');
    this.customEventMarker = page.locator('.custom-event, [data-testid="custom-event"]');
    this.todayButton = page.locator('button:has-text("Today"), button:has-text("Now")');
  }

  /**
   * Navigate to calendar page
   */
  async goto(): Promise<void> {
    await this.page.goto('/calendar');
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to month view
   */
  async switchToMonthView(): Promise<void> {
    if (await this.monthViewButton.count() > 0) {
      await this.monthViewButton.click();
    }
  }

  /**
   * Switch to week view
   */
  async switchToWeekView(): Promise<void> {
    if (await this.weekViewButton.count() > 0) {
      await this.weekViewButton.click();
    }
  }

  /**
   * Switch to day view
   */
  async switchToDayView(): Promise<void> {
    if (await this.dayViewButton.count() > 0) {
      await this.dayViewButton.click();
    }
  }

  /**
   * Navigate to previous month
   */
  async gotoPreviousMonth(): Promise<void> {
    await this.previousMonthButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to next month
   */
  async gotoNextMonth(): Promise<void> {
    await this.nextMonthButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to today
   */
  async gotoToday(): Promise<void> {
    if (await this.todayButton.count() > 0) {
      await this.todayButton.click();
      await this.helpers.waitForLoading();
    }
  }

  /**
   * Get current month label
   */
  async getCurrentMonthLabel(): Promise<string> {
    return await this.currentMonthLabel.textContent() || '';
  }

  /**
   * Click on calendar day
   */
  async clickDay(day: number): Promise<void> {
    const dayCell = this.page.locator(`[data-day="${day}"], .calendar-day:has-text("${day}")`);
    await dayCell.click();
  }

  /**
   * Click on event
   */
  async clickEvent(eventTitle: string): Promise<void> {
    const event = this.calendarEvent.filter({ hasText: eventTitle });
    await event.click();
  }

  /**
   * Create custom event
   */
  async createCustomEvent(eventData: {
    title: string;
    date: string;
    time?: string;
    notes?: string;
  }): Promise<void> {
    await this.createEventButton.click();
    await this.eventTitleInput.fill(eventData.title);
    await this.eventDateInput.fill(eventData.date);

    if (eventData.time && await this.eventTimeInput.count() > 0) {
      await this.eventTimeInput.fill(eventData.time);
    }

    if (eventData.notes && await this.eventNotesInput.count() > 0) {
      await this.eventNotesInput.fill(eventData.notes);
    }

    await this.saveEventButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Delete event
   */
  async deleteEvent(eventTitle: string, confirm: boolean = true): Promise<void> {
    await this.clickEvent(eventTitle);

    if (confirm) {
      await this.deleteEventButton.click();
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
    }

    await this.helpers.waitForLoading();
  }

  /**
   * Set reminder for event
   */
  async setReminder(eventTitle: string, reminderType: string): Promise<void> {
    await this.clickEvent(eventTitle);
    await this.reminderButton.click();

    const reminderOption = this.page.locator(`[data-reminder="${reminderType}"], label:has-text("${reminderType}")`);
    if (await reminderOption.count() > 0) {
      await reminderOption.click();
    }

    await this.saveEventButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Export calendar
   */
  async exportCalendar(format: 'ics' | 'json' = 'ics'): Promise<void> {
    await this.exportButton.click();

    const formatOption = this.page.locator(`[data-format="${format}"], label:has-text("${format.toUpperCase()}")`);
    if (await formatOption.count() > 0) {
      await formatOption.click();
    }

    await this.helpers.waitForLoading();
  }

  /**
   * Verify event is displayed
   */
  async verifyEventDisplayed(eventTitle: string): Promise<void> {
    const event = this.calendarEvent.filter({ hasText: eventTitle });
    await expect(event).toBeVisible();
  }

  /**
   * Verify moon phase indicator
   */
  async verifyMoonPhase(phase: string): Promise<void> {
    await expect(this.moonPhaseIndicator).toBeVisible();
    await expect(this.moonPhaseIndicator).toContainText(phase);
  }

  /**
   * Verify retrograde indicator
   */
  async verifyRetrograde(planet: string): Promise<void> {
    const retrograde = this.retrogradeIndicator.filter({ hasText: planet });
    await expect(retrograde).toBeVisible();
  }

  /**
   * Verify weather info is displayed
   */
  async verifyWeatherInfo(): Promise<void> {
    await expect(this.weatherInfo.first()).toBeVisible();
  }

  /**
   * Verify event modal is displayed
   */
  async verifyEventModalDisplayed(): Promise<void> {
    await expect(this.eventModal).toBeVisible();
  }

  /**
   * Get event count
   */
  async getEventCount(): Promise<number> {
    return await this.calendarEvent.count();
  }

  /**
   * Get events for specific date
   */
  async getEventsForDate(date: string): Promise<Locator[]> {
    const dateCell = this.page.locator(`[data-date="${date}"], .calendar-day:has-text("${date}")`);
    return await dateCell.locator('.calendar-event').all();
  }

  /**
   * Verify custom event marker
   */
  async verifyCustomEvent(eventTitle: string): Promise<void> {
    const event = this.customEventMarker.filter({ hasText: eventTitle });
    await expect(event).toBeVisible();
  }

  /**
   * Close event modal
   */
  async closeEventModal(): Promise<void> {
    const closeButton = this.eventModal.locator('button:has-text("Close"), button:has-text("×")');
    if (await closeButton.count() > 0) {
      await closeButton.click();
    }
  }

  /**
   * Verify on calendar page
   */
  async verifyOnCalendarPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*calendar/);
  }

  /**
   * Get current view type
   */
  async getCurrentView(): Promise<'month' | 'week' | 'day'> {
    if (await this.monthViewButton.hasClass('active')) {
      return 'month';
    } else if (await this.weekViewButton.hasClass('active')) {
      return 'week';
    } else {
      return 'day';
    }
  }
}
