/**
 * E2E Test: Chart Creation and Management
 * Tests complete chart creation workflow, viewing, and management
 */

import { test, expect } from '@playwright/test';

// Test data
const testChart = {
  name: 'E2E Test Chart',
  birth_date: '1990-01-15',
  birth_time: '14:30',
  birth_place: 'New York, NY',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  house_system: 'placidus',
  zodiac_type: 'tropical',
};

test.describe('Chart Creation Flow', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    // For now, we'll assume login is handled
    // In real implementation, you'd login first
    await page.goto('/login');

    // Use test credentials from environment or test setup
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'test123');

    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/.*dashboard/);
  });

  test('should create new natal chart successfully', async ({ page }) => {
    // Navigate to chart creation page
    await page.click('button:has-text("Create Chart"), a:has-text("Create"), text=+ New Chart');
    await expect(page).toHaveURL(/.*chart.*create/);

    // Fill birth data form
    await page.fill('[name="name"]', testChart.name);

    // Select date
    await page.fill('[name="birth_date"]', testChart.birth_date);

    // Select time
    await page.fill('[name="birth_time"]', testChart.birth_time);

    // Enter birth place
    await page.fill('[name="birth_place"]', testChart.birth_place);

    // Wait for geocoding autocomplete
    await page.waitForTimeout(500);

    // Select first autocomplete suggestion
    const autocomplete = page.locator('.autocomplete-suggestion, [role="option"]').first();
    if (await autocomplete.isVisible()) {
      await autocomplete.click();
    }

    // Select house system
    await page.selectOption('[name="house_system"]', testChart.house_system);

    // Select zodiac type
    await page.selectOption('[name="zodiac_type"]', testChart.zodiac_type);

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Calculate")');

    // Wait for calculation
    await page.waitForSelector('text=calculating|loading', { state: 'hidden', timeout: 10000 });

    // Should redirect to chart view or dashboard
    await expect(page).toHaveURL(/.*chart.*view|.*dashboard/);

    // Should show success message
    await expect(page.locator('text=created successfully|chart created')).toBeVisible();
  });

  test('should validate birth data form', async ({ page }) => {
    await page.goto('/charts/create');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=required|please enter|is required')).toHaveCount(4);

    // Test date validation
    await page.fill('[name="name"]', testChart.name);
    await page.fill('[name="birth_date"]', 'invalid-date');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid date|invalid date')).toBeVisible();

    // Test place validation
    await page.fill('[name="birth_date"]', testChart.birth_date);
    await page.fill('[name="birth_place"]', 'InvalidPlaceThatDoesNotExist12345');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=not found|please select|location')).toBeVisible();
  });

  test('should handle time unknown option', async ({ page }) => {
    await page.goto('/charts/create');

    // Check "time unknown" checkbox
    const timeUnknownCheckbox = page.locator('[name="time_unknown"], #timeUnknown');
    if (await timeUnknownCheckbox.count() > 0) {
      await timeUnknownCheckbox.click();

      // Time field should be disabled or hidden
      const timeInput = page.locator('[name="birth_time"]');
      if (await timeInput.count() > 0) {
        await expect(timeInput).toBeDisabled();
      }

      // Should still be able to submit
      await page.fill('[name="name"]', testChart.name);
      await page.fill('[name="birth_date"]', testChart.birth_date);
      await page.fill('[name="birth_place"]', testChart.birth_place);
      await page.selectOption('[name="house_system"]', testChart.house_system);

      await page.click('button[type="submit"]');

      // Should create chart successfully
      await expect(page.locator('text=created successfully')).toBeVisible();
    }
  });

  test('should display chart wheel correctly', async ({ page }) => {
    // Create or navigate to existing chart
    await page.goto('/charts');

    // Click on first chart in list
    await page.click('.chart-card, [data-testid="chart-item"]').first();

    // Wait for chart wheel to load
    await page.waitForSelector('svg, .chart-wheel', { timeout: 5000 });

    // Verify chart wheel elements
    const chartWheel = page.locator('svg, .chart-wheel');
    await expect(chartWheel).toBeVisible();

    // Check for zodiac signs
    await expect(page.locator('text=Aries|Taurus|Gemini').toBeVisible();

    // Check for planet symbols
    await expect(page.locator('.planet-symbol, [data-planet]').first()).toBeVisible();

    // Check for house divisions
    await expect(page.locator('.house-cusp, [data-house]').first()).toBeVisible();
  });

  test('should show personality analysis', async ({ page }) => {
    // Navigate to chart analysis page
    await page.goto('/charts');

    // Click on first chart
    await page.click('.chart-card, [data-testid="chart-item"]').first();

    // Click "Analysis" tab
    await page.click('button:has-text("Analysis"), a:has-text("Analysis"), [role="tab"]:has-text("Analysis")');

    // Wait for analysis to load
    await page.waitForSelector('.personality-analysis, .analysis-content', { timeout: 5000 });

    // Verify overview section
    await expect(page.locator('text=Sun|Moon|Ascendant')).toBeVisible();

    // Check for tabbed interface
    const tabs = ['Overview', 'Planets', 'Houses', 'Aspects'];
    for (const tab of tabs) {
      const tabElement = page.locator(`[role="tab"]:has-text("${tab}"), button:has-text("${tab}")`);
      if (await tabElement.count() > 0) {
        await expect(tabElement.first()).toBeVisible();
      }
    }

    // Test tab switching
    const planetsTab = page.locator('[role="tab"]:has-text("Planets"), button:has-text("Planets")');
    if (await planetsTab.count() > 0) {
      await planetsTab.first().click();

      // Should show planets in signs
      await expect(page.locator('.planet-sign, [data-planet-sign]')).toHaveCount(10);
    }
  });

  test('should allow chart editing', async ({ page }) => {
    await page.goto('/charts');

    // Click on first chart
    await page.click('.chart-card, [data-testid="chart-item"]').first();

    // Click edit button
    await page.click('button:has-text("Edit"), [aria-label="Edit"]');

    // Should be on edit page
    await expect(page).toHaveURL(/.*edit/);

    // Update chart name
    await page.fill('[name="name"]', 'Updated Chart Name');

    // Submit
    await page.click('button[type="submit"]:has-text("Save"), button:has-text("Update")');

    // Should show success message
    await expect(page.locator('text=updated|saved')).toBeVisible();

    // Verify updated name
    await expect(page.locator('text=Updated Chart Name')).toBeVisible();
  });

  test('should allow chart deletion with confirmation', async ({ page }) => {
    await page.goto('/charts');

    // Get initial chart count
    const chartCount = await page.locator('.chart-card, [data-testid="chart-item"]').count();

    // Click delete button on first chart
    await page.hover('.chart-card, [data-testid="chart-item"]').first();
    await page.click('button:has-text("Delete"), [aria-label="Delete"]');

    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure|confirm|delete this chart')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');

    // Should show success message
    await expect(page.locator('text=deleted|removed')).toBeVisible();

    // Chart count should decrease
    await page.reload();
    const newChartCount = await page.locator('.chart-card, [data-testid="chart-item"]').count();
    expect(newChartCount).toBeLessThan(chartCount);
  });

  test('should recalculate chart with different options', async ({ page }) => {
    await page.goto('/charts');

    // Click on first chart
    await page.click('.chart-card, [data-testid="chart-item"]').first();

    // Click recalculate button
    await page.click('button:has-text("Recalculate"), [aria-label="Recalculate"]');

    // Change house system
    await page.selectOption('[name="house_system"]', 'whole_sign');

    // Change zodiac type
    await page.selectOption('[name="zodiac_type"]', 'sidereal');

    // Submit
    await page.click('button[type="submit"]:has-text("Calculate"), button:has-text("Recalculate")');

    // Wait for calculation
    await page.waitForSelector('text=calculating', { state: 'hidden' });

    // Should show updated chart
    await expect(page.locator('text=Whole Sign|Sidereal')).toBeVisible();
  });

  test('should display chart list with pagination', async ({ page }) => {
    await page.goto('/charts');

    // Check if pagination exists
    const pagination = page.locator('.pagination, [data-testid="pagination"]');
    const chartCards = page.locator('.chart-card, [data-testid="chart-item"]');

    if (await pagination.count() > 0) {
      // Should show page information
      await expect(pagination.locator('text=Page|of|Showing')).toBeVisible();

      // Test next page button
      const nextButton = pagination.locator('button:has-text("Next"), a:has-text("Next")');
      if (await nextButton.isEnabled()) {
        const firstChartName = await chartCards.first().textContent();

        await nextButton.click();

        // Should show different charts
        const newFirstChartName = await chartCards.first().textContent();
        expect(firstChartName).not.toBe(newFirstChartName);
      }
    }
  });

  test('should support chart search/filter', async ({ page }) => {
    await page.goto('/charts');

    // Check for search input
    const searchInput = page.locator('[name="search"], [placeholder*="search" i], [aria-label*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Test');

      // Should filter charts
      await page.waitForTimeout(500);

      const chartCards = page.locator('.chart-card, [data-testid="chart-item"]');
      for (let i = 0; i < await chartCards.count(); i++) {
        const cardText = await chartCards.nth(i).textContent();
        expect(cardText.toLowerCase()).toContain('test');
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/charts');

    // Check if cards stack vertically
    const chartCards = page.locator('.chart-card, [data-testid="chart-item"]');
    if (await chartCards.count() > 1) {
      const firstCard = await chartCards.first().boundingBox();
      const secondCard = await chartCards.nth(1).boundingBox();

      expect(secondCard!.y).toBeGreaterThan(firstCard!.y);
    }

    // Check for mobile menu or different layout
    const mobileMenu = page.locator('.mobile-menu, [aria-label="Menu"], button:has-text("Menu")');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
  });
});

test.describe('Chart Sharing', () => {
  test('should support chart sharing (if feature exists)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);

    await page.goto('/charts');
    await page.click('.chart-card, [data-testid="chart-item"]').first();

    // Look for share button
    const shareButton = page.locator('button:has-text("Share"), [aria-label="Share"]');
    if (await shareButton.count() > 0) {
      await shareButton.first().click();

      // Should show share options
      await expect(page.locator('text=Copy link|Share|Email')).toBeVisible();

      // Test copy link
      const copyButton = page.locator('button:has-text("Copy")');
      if (await copyButton.count() > 0) {
        await copyButton.first().click();

        // Should show confirmation
        await expect(page.locator('text=copied|link copied')).toBeVisible();
      }
    }
  });
});
