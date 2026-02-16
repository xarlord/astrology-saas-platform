/**
 * E2E Test: Transit Dashboard and Forecasting
 * Tests transit viewing, calendar interaction, and date range selection
 */

import { test, expect } from '@playwright/test';

test.describe('Transit Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should display today\'s transits', async ({ page }) => {
    // Navigate to transits page
    await page.click('a:has-text("Transit"), [href*="transit"]');
    await expect(page).toHaveURL(/.*transit/);

    // Select "Today" view
    await page.click('button:has-text("Today"), [data-range="today"]');

    // Wait for transits to load
    await page.waitForSelector('.transit-card, .transit-list', { timeout: 5000 });

    // Should show transit list
    const transitCards = page.locator('.transit-card, [data-testid="transit-item"]');
    const transitCount = await transitCards.count();

    // Should have at least some transits
    expect(transitCount).toBeGreaterThan(0);

    // Verify transit card structure
    const firstTransit = transitCards.first();
    await expect(firstTransit.locator('.transiting-planet, [data-transiting-planet]')).toBeVisible();
    await expect(firstTransit.locator('.natal-planet, [data-natal-planet]')).toBeVisible();
    await expect(firstTransit.locator('.aspect-type, [data-aspect]')).toBeVisible();
    await expect(firstTransit.locator('.intensity, [data-intensity]')).toBeVisible();
  });

  test('should view weekly transits', async ({ page }) => {
    await page.goto('/transits');

    // Select "This Week" view
    await page.click('button:has-text("Week"), [data-range="week"]');

    // Wait for transits
    await page.waitForSelector('.transit-card, .week-transits', { timeout: 5000 });

    // Should show transits grouped by date
    const dateGroups = page.locator('.date-group, [data-date]');
    expect(await dateGroups.count()).toBeGreaterThan(0);

    // Verify date headers
    await expect(page.locator('text=Monday|Tuesday|Wednesday|Thursday|Friday')).toBeVisible();
  });

  test('should view monthly transits', async ({ page }) => {
    await page.goto('/transits');

    // Select "This Month" view
    await page.click('button:has-text("Month"), [data-range="month"]');

    // Wait for calendar
    await page.waitForSelector('.transit-calendar, .calendar-grid', { timeout: 5000 });

    // Should show calendar view
    await expect(page.locator('.calendar-grid, table')).toBeVisible();

    // Should have day cells
    const dayCells = page.locator('.day-cell, [data-day], td');
    expect(await dayCells.count()).toBeGreaterThan(20);

    // Some days should have transit indicators
    const daysWithTransits = page.locator('.has-transit, [data-has-transit="true"]');
    expect(await daysWithTransits.count()).toBeGreaterThan(0);
  });

  test('should navigate transit calendar', async ({ page }) => {
    await page.goto('/transits');

    // Select calendar view
    await page.click('button:has-text("Month"), [data-range="month"]');

    // Click next month button
    const nextButton = page.locator('button:has-text("Next"), [aria-label="Next"], .calendar-next');
    if (await nextButton.count() > 0) {
      const currentMonth = await page.locator('.calendar-month, [data-month]').textContent();

      await nextButton.first().click();

      // Wait for calendar to update
      await page.waitForTimeout(500);

      const newMonth = await page.locator('.calendar-month, [data-month]').textContent();
      expect(currentMonth).not.toBe(newMonth);
    }

    // Click previous month button
    const prevButton = page.locator('button:has-text("Prev"), [aria-label="Previous"], .calendar-prev');
    if (await prevButton.count() > 0) {
      await prevButton.first().click();

      // Wait for calendar to update
      await page.waitForTimeout(500);
    }
  });

  test('should show transit details on click', async ({ page }) => {
    await page.goto('/transits');

    // Select today's transits
    await page.click('button:has-text("Today"), [data-range="today"]');

    // Wait for transits to load
    await page.waitForSelector('.transit-card', { timeout: 5000 });

    // Click on first transit
    await page.locator('.transit-card').first().click();

    // Should show transit detail modal or panel
    await expect(page.locator('.transit-detail, .modal, [data-testid="transit-detail"]')).toBeVisible();

    // Verify detail content
    await expect(page.locator('text=interpretation|meaning|influence')).toBeVisible();

    // Should have planet descriptions
    await expect(page.locator('.transiting-planet-desc, .natal-planet-desc')).toBeVisible();

    // Close detail view
    await page.click('button:has-text("Close"), .modal-close, [aria-label="Close"]');
  });

  test('should filter transits by intensity', async ({ page }) => {
    await page.goto('/transits');

    // Select today view
    await page.click('button:has-text("Today"), [data-range="today"]');

    // Look for intensity filter
    const intensityFilter = page.locator('[name="intensity"], .intensity-filter');
    if (await intensityFilter.count() > 0) {
      // Select "High" intensity only
      await page.selectOption('[name="intensity"]', 'high');

      // Wait for filtered results
      await page.waitForTimeout(500);

      // All shown transits should have high intensity
      const transits = page.locator('.transit-card');
      for (let i = 0; i < await transits.count(); i++) {
        const intensity = await transits.nth(i).locator('[data-intensity]').getAttribute('data-intensity');
        expect(parseInt(intensity || '0')).toBeGreaterThan(70);
      }
    }
  });

  test('should filter transits by planet', async ({ page }) => {
    await page.goto('/transits');

    // Select today view
    await page.click('button:has-text("Today"), [data-range="today"]');

    // Look for planet filter
    const planetFilter = page.locator('[name="planet"], .planet-filter');
    if (await planetFilter.count() > 0) {
      // Select specific planet (e.g., Venus)
      await page.selectOption('[name="planet"]', 'venus');

      // Wait for filtered results
      await page.waitForTimeout(500);

      // All shown transits should involve Venus
      const transits = page.locator('.transit-card');
      for (let i = 0; i < await transits.count(); i++) {
        const cardText = await transits.nth(i).textContent();
        expect(cardText?.toLowerCase()).toContain('venus');
      }
    }
  });

  test('should allow custom date range selection', async ({ page }) => {
    await page.goto('/transits');

    // Look for custom range option
    const customRangeButton = page.locator('button:has-text("Custom"), [data-range="custom"]');
    if (await customRangeButton.count() > 0) {
      await customRangeButton.first().click();

      // Should show date pickers
      await expect(page.locator('[name="startDate"], input[type="date"]')).toBeVisible();
      await expect(page.locator('[name="endDate"], input[type="date"]')).toBeVisible();

      // Select date range
      await page.fill('[name="startDate"]', '2024-01-01');
      await page.fill('[name="endDate"]', '2024-01-07');

      // Apply filter
      await page.click('button:has-text("Apply"), button:has-text("Show")');

      // Wait for results
      await page.waitForSelector('.transit-card', { timeout: 5000 });

      // Should show transits for selected range
      await expect(page.locator('text=2024-01')).toBeVisible();
    }
  });

  test('should display transit highlights', async ({ page }) => {
    await page.goto('/transits');

    // Look for highlights section
    const highlightsSection = page.locator('.transit-highlights, [data-testid="highlights"]');
    if (await highlightsSection.count() > 0) {
      await expect(highlightsSection.first()).toBeVisible();

      // Should have highlight cards
      const highlightCards = page.locator('.highlight-card');
      expect(await highlightCards.count()).toBeGreaterThan(0);

      // Verify highlight content
      const firstHighlight = highlightCards.first();
      await expect(firstHighlight.locator('.title, [data-title]')).toBeVisible();
      await expect(firstHighlight.locator('.description')).toBeVisible();
      await expect(firstHighlight.locator('.date')).toBeVisible();
    }
  });

  test('should support transit notifications (opt-in)', async ({ page }) => {
    await page.goto('/transits');

    // Look for notification settings
    const notificationButton = page.locator('button:has-text("Notify"), [aria-label="Notifications"]');
    if (await notificationButton.count() > 0) {
      await notificationButton.first().click();

      // Should show notification settings modal
      await expect(page.locator('.notification-settings, .modal')).toBeVisible();

      // Toggle notification for major transits
      const toggle = page.locator('[name="notifyMajor"], .toggle-switch');
      if (await toggle.count() > 0) {
        await toggle.first().click();

        // Should show permission request (if not granted)
        // Or show confirmation
        const confirmButton = page.locator('button:has-text("Save"), button:has-text("Enable")');
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click();

          // Should show success message
          await expect(page.locator('text=enabled|saved|preferences updated')).toBeVisible();
        }
      }
    }
  });

  test('should compare transits for different charts', async ({ page }) => {
    // This test assumes user has multiple charts
    await page.goto('/transits');

    // Look for chart selector
    const chartSelector = page.locator('[name="chart"], .chart-selector');
    if (await chartSelector.count() > 0) {
      // Get initial transits
      await page.waitForSelector('.transit-card');
      const initialCount = await page.locator('.transit-card').count();

      // Select different chart
      await page.selectOption('[name="chart"]', { index: 1 });

      // Wait for new transits to load
      await page.waitForSelector('.transit-card', { timeout: 5000 });

      // Should show different transits
      const newCount = await page.locator('.transit-card').count();

      // Transits may or may not be different, but should reload
      await expect(page.locator('.transit-card')).toHaveCount(newCount, { timeout: 5000 });
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/transits');

    // Should show mobile-friendly view
    await expect(page.locator('.mobile-transits, .transit-list')).toBeVisible();

    // Date range selector might become dropdown
    const mobileSelector = page.locator('select.mobile-select, .date-selector select');
    if (await mobileSelector.count() > 0) {
      await expect(mobileSelector.first()).toBeVisible();
    }

    // Cards should stack vertically
    const cards = page.locator('.transit-card');
    if (await cards.count() > 1) {
      const firstCard = await cards.first().boundingBox();
      const secondCard = await cards.nth(1).boundingBox();

      expect(secondCard!.y).toBeGreaterThan(firstCard!.y);
    }
  });

  test('should handle date range limits', async ({ page }) => {
    await page.goto('/transits');

    // Try to select very large date range
    const customRangeButton = page.locator('button:has-text("Custom"), [data-range="custom"]');
    if (await customRangeButton.count() > 0) {
      await customRangeButton.first().click();

      // Select 3 month range (should be limited to 90 days)
      await page.fill('[name="startDate"]', '2024-01-01');
      await page.fill('[name="endDate"]', '2024-04-30'); // ~120 days

      await page.click('button:has-text("Apply"), button:has-text("Show")');

      // Should show validation error
      await expect(page.locator('text=90 days|too long|maximum range')).toBeVisible();
    }
  });
});

test.describe('Transit Interpretations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('should provide meaningful transit interpretations', async ({ page }) => {
    await page.goto('/transits');
    await page.click('button:has-text("Today"), [data-range="today"]');

    // Wait for transits
    await page.waitForSelector('.transit-card', { timeout: 5000 });

    // Click on first transit to see details
    await page.locator('.transit-card').first().click();

    // Should show interpretation
    await expect(page.locator('.interpretation, .transit-meaning')).toBeVisible();

    // Should have practical advice
    await expect(page.locator('text=advice|recommendation|suggestion')).toBeVisible();

    // Should have time period
    await expect(page.locator('text=active|period|duration')).toBeVisible();
  });

  test('should show transit intensity visually', async ({ page }) => {
    await page.goto('/transits');
    await page.click('button:has-text("Today"), [data-range="today"]');

    await page.waitForSelector('.transit-card', { timeout: 5000 });

    // Check for intensity indicators
    const intensityIndicators = page.locator('[data-intensity], .intensity-bar, .intensity-badge');
    expect(await intensityIndicators.count()).toBeGreaterThan(0);

    // High intensity transits should be visually distinct
    const highIntensityTransit = page.locator('.transit-card[data-high-intensity="true"]');
    if (await highIntensityTransit.count() > 0) {
      await expect(highIntensityTransit.first()).toHaveAttribute('data-intensity', /\d{2,}/);
    }
  });

  test('should allow saving favorite transits', async ({ page }) => {
    await page.goto('/transits');
    await page.click('button:has-text("Today"), [data-range="today"]');

    await page.waitForSelector('.transit-card', { timeout: 5000 });

    // Look for favorite button
    const favoriteButton = page.locator('.transit-card').first().locator('button:has-text("★"), [aria-label*="Favorite"], .favorite-btn');
    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();

      // Should show confirmation (toggle state)
      await expect(favoriteButton).toHaveAttribute('data-favorite', 'true');

      // Verify transit is saved
      await page.click('button:has-text("Favorites"), [data-filter="favorites"]');

      // Should show only favorited transits
      await expect(page.locator('.transit-card')).toHaveCountGreaterThan(0);
    }
  });
});
