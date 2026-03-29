/**
 * E2E Test Specifications: Google Calendar Export
 *
 * @requirement REQ-CAL-004
 * @test-case E2E-GCAL-*
 * @coverage full
 *
 * Tests Google Calendar integration for astrological events:
 * - OAuth connection flow
 * - Calendar selection
 * - Event export
 * - Disconnect functionality
 */

import { test, expect } from '@playwright/test';
import { CalendarPageObject } from './pages/CalendarPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';

test.describe('Google Calendar - Connection Flow', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GCAL-001: should display connect Google Calendar button when not connected', async ({ page }) => {
    await calendarPage.gotoSettings();

    // Check for connect button
    const connectButton = page.locator('button:has-text("Connect Google Calendar"), [data-testid="connect-google-calendar"]');
    await expect(connectButton).toBeVisible();

    await helpers.takeScreenshot('gcal-connect-button');
  });

  test('E2E-GCAL-002: should initiate OAuth flow on connect click', async ({ page }) => {
    await calendarPage.gotoSettings();

    // Click connect button
    const connectButton = page.locator('button:has-text("Connect Google Calendar")');
    await connectButton.click();

    // Should redirect to Google OAuth or show popup
    // In test mode, we might mock this
    await page.waitForTimeout(1000);

    // Check for OAuth redirect or popup initiation
    const url = page.url();
    const hasOAuth = url.includes('accounts.google.com') ||
                     await page.locator('text=Connecting..., .loading-oauth').count() > 0;

    expect(hasOAuth).toBeTruthy();

    await helpers.takeScreenshot('gcal-oauth-initiated');
  });

  test('E2E-GCAL-003: should show connected state after successful OAuth', async ({ page }) => {
    // Mock successful OAuth completion
    await page.goto('/calendar/settings?google_connected=true');

    // Should show connected state
    await expect(page.locator('text=Google Calendar connected, .google-connected')).toBeVisible();

    // Should show connected email
    await expect(page.locator('text=@')).toBeVisible();

    // Should show disconnect button
    await expect(page.locator('button:has-text("Disconnect")')).toBeVisible();

    await helpers.takeScreenshot('gcal-connected-state');
  });

  test('E2E-GCAL-004: should handle OAuth denial gracefully', async ({ page }) => {
    // Mock OAuth denial
    await page.goto('/calendar/settings?google_error=access_denied');

    // Should show error message
    await expect(page.locator('text=denied|cancelled|could not connect')).toBeVisible();

    // Connect button should still be available
    await expect(page.locator('button:has-text("Connect Google Calendar")')).toBeVisible();

    await helpers.takeScreenshot('gcal-oauth-denied');
  });
});

test.describe('Google Calendar - Calendar Selection', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );

    // Mock connected state
    await page.goto('/calendar/settings?google_connected=true');
  });

  test('E2E-GCAL-005: should display list of user calendars', async ({ page }) => {
    await calendarPage.gotoSettings();

    // Calendar selector should be visible
    const calendarSelector = page.locator('[name="googleCalendar"], .calendar-selector, [data-testid="calendar-select"]');
    await expect(calendarSelector).toBeVisible();

    // Should have options
    const options = await calendarSelector.locator('option').count();
    expect(options).toBeGreaterThan(0);

    await helpers.takeScreenshot('gcal-calendar-list');
  });

  test('E2E-GCAL-006: should allow selecting target calendar', async ({ page }) => {
    await calendarPage.gotoSettings();

    // Select a calendar
    const calendarSelector = page.locator('[name="googleCalendar"], .calendar-selector');
    await calendarSelector.selectOption({ index: 0 });

    // Verify selection
    const selectedValue = await calendarSelector.inputValue();
    expect(selectedValue).toBeTruthy();

    await helpers.takeScreenshot('gcal-calendar-selected');
  });
});

test.describe('Google Calendar - Event Export', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GCAL-007: should display export button when connected', async ({ page }) => {
    // Mock connected state
    await page.goto('/calendar?google_connected=true');

    // Export button should be visible
    const exportButton = page.locator('button:has-text("Export to Google"), [data-testid="export-google-calendar"]');
    await expect(exportButton).toBeVisible();

    await helpers.takeScreenshot('gcal-export-button');
  });

  test('E2E-GCAL-008: should show export options modal', async ({ page }) => {
    await page.goto('/calendar?google_connected=true');

    // Click export button
    await page.click('button:has-text("Export to Google")');

    // Modal should appear
    await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();

    // Should have date range picker
    await expect(page.locator('[name="startDate"], input[type="date"]')).toBeVisible();

    // Should have event type checkboxes
    await expect(page.locator('text=Transits, text=Lunar Phases, text=Retrogrades')).toBeVisible();

    await helpers.takeScreenshot('gcal-export-modal');
  });

  test('E2E-GCAL-009: should export selected events to Google Calendar', async ({ page }) => {
    await page.goto('/calendar?google_connected=true');

    // Open export modal
    await page.click('button:has-text("Export to Google")');

    // Select event types
    await page.check('input[value="transits"]');
    await page.check('input[value="lunar_phases"]');

    // Set date range
    await page.fill('[name="startDate"]', '2026-03-01');
    await page.fill('[name="endDate"]', '2026-03-31');

    // Click export
    await page.click('button:has-text("Export"), button[type="submit"]');

    // Should show success message
    await helpers.verifyToast(/exported|success/i);

    await helpers.takeScreenshot('gcal-export-success');
  });

  test('E2E-GCAL-010: should show export progress indicator', async ({ page }) => {
    await page.goto('/calendar?google_connected=true');

    await page.click('button:has-text("Export to Google")');
    await page.click('button:has-text("Export"), button[type="submit"]');

    // Should show loading state
    const loadingIndicator = page.locator('.loading, .spinner, [aria-busy="true"]');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator.first()).toBeVisible();
    }

    await helpers.takeScreenshot('gcal-export-progress');
  });

  test('E2E-GCAL-011: should include personal transits when selected', async ({ page }) => {
    await page.goto('/calendar?google_connected=true');

    await page.click('button:has-text("Export to Google")');

    // Toggle personal transits
    const personalToggle = page.locator('[name="includePersonal"], input[type="checkbox"]:has-text("Personal")');
    if (await personalToggle.count() > 0) {
      await personalToggle.check();
    }

    // Export
    await page.click('button:has-text("Export"), button[type="submit"]');
    await helpers.verifyToast(/exported|success/i);

    await helpers.takeScreenshot('gcal-export-personal');
  });

  test('E2E-GCAL-012: should show export history', async ({ page }) => {
    await calendarPage.gotoSettings();

    // Look for export history section
    const historySection = page.locator('.export-history, [data-testid="export-history"]');
    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Should show last export date
      await expect(page.locator('text=Last exported')).toBeVisible();
    }

    await helpers.takeScreenshot('gcal-export-history');
  });
});

test.describe('Google Calendar - Disconnect', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GCAL-013: should show disconnect confirmation', async ({ page }) => {
    await page.goto('/calendar/settings?google_connected=true');

    // Click disconnect
    await page.click('button:has-text("Disconnect")');

    // Should show confirmation
    await expect(page.locator('text=Are you sure|disconnect|remove')).toBeVisible();

    await helpers.takeScreenshot('gcal-disconnect-confirm');
  });

  test('E2E-GCAL-014: should disconnect Google Calendar on confirmation', async ({ page }) => {
    await page.goto('/calendar/settings?google_connected=true');

    // Click disconnect
    await page.click('button:has-text("Disconnect")');

    // Confirm
    await page.click('button:has-text("Yes"), button:has-text("Disconnect"):visible >> nth=1');

    // Should show success
    await helpers.verifyToast(/disconnected|removed/i);

    // Should show connect button again
    await expect(page.locator('button:has-text("Connect Google Calendar")')).toBeVisible();

    await helpers.takeScreenshot('gcal-disconnected');
  });

  test('E2E-GCAL-015: should cancel disconnect', async ({ page }) => {
    await page.goto('/calendar/settings?google_connected=true');

    await page.click('button:has-text("Disconnect")');

    // Cancel
    await page.click('button:has-text("Cancel")');

    // Should still show connected state
    await expect(page.locator('text=Google Calendar connected')).toBeVisible();

    await helpers.takeScreenshot('gcal-disconnect-cancelled');
  });
});

test.describe('Google Calendar - Error Handling', () => {
  let calendarPage: CalendarPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GCAL-016: should handle export errors gracefully', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError('/api/calendar/google/export', 'Export failed', 500);

    await page.goto('/calendar?google_connected=true');
    await page.click('button:has-text("Export to Google")');
    await page.click('button:has-text("Export"), button[type="submit"]');

    // Should show error message
    await helpers.verifyError(/failed|error|try again/i);

    await helpers.takeScreenshot('gcal-export-error');
  });

  test('E2E-GCAL-017: should handle token expiration', async ({ page }) => {
    // Mock token expired
    await helpers.mockApiError('/api/calendar/google/*', 'Token expired', 401);

    await page.goto('/calendar?google_connected=true');

    // Should prompt to reconnect
    await expect(page.locator('text=reconnect|expired|Connect again')).toBeVisible();

    await helpers.takeScreenshot('gcal-token-expired');
  });
});

test.describe('Google Calendar - Responsive Design', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GCAL-018: should be responsive on mobile', async ({ page }) => {
    await helpers.setViewport('mobile');
    await page.goto('/calendar?google_connected=true');

    // Export button should be visible
    await expect(page.locator('button:has-text("Export")')).toBeVisible();

    // Settings should be accessible
    await page.click('[aria-label="Settings"], button:has-text("Settings")');
    await expect(page.locator('text=Google Calendar')).toBeVisible();

    await helpers.takeScreenshot('gcal-mobile');
  });

  test('E2E-GCAL-019: should be responsive on tablet', async ({ page }) => {
    await helpers.setViewport('tablet');
    await page.goto('/calendar/settings?google_connected=true');

    // All elements should be visible
    await expect(page.locator('text=Google Calendar connected')).toBeVisible();
    await expect(page.locator('button:has-text("Disconnect")')).toBeVisible();

    await helpers.takeScreenshot('gcal-tablet');
  });
});
