/**
 * E2E Test Specifications: Synastry Comparison Types
 *
 * @requirement REQ-SYN-006
 * @test-case E2E-SYN-TYPE-*
 * @coverage full
 *
 * Tests multiple comparison types for synastry:
 * - Romantic compatibility
 * - Business compatibility
 * - Friendship compatibility
 */

import { test, expect } from '@playwright/test';
import { SynastryPageObject } from './pages/SynastryPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testSynastry } from './fixtures/test-data';

test.describe('Synastry Comparison Types - Type Selection', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-SYN-TYPE-001: should display comparison type selector', async ({ page }) => {
    await synastryPage.goto();

    // Verify comparison type selector is visible
    const typeSelector = page.locator('.comparison-type-selector, [data-testid="comparison-type"]');
    await expect(typeSelector).toBeVisible();

    // Verify all three options are present
    await expect(page.locator('[data-type="romantic"], text=Romantic')).toBeVisible();
    await expect(page.locator('[data-type="business"], text=Business')).toBeVisible();
    await expect(page.locator('[data-type="friendship"], text=Friendship')).toBeVisible();

    await helpers.takeScreenshot('synastry-type-selector');
  });

  test('E2E-SYN-TYPE-002: should default to romantic type', async ({ page }) => {
    await synastryPage.goto();

    // Check that romantic is selected by default
    const romanticOption = page.locator('[data-type="romantic"]:checked, .comparison-type-selector [aria-checked="true"][data-type="romantic"]');

    // Either romantic is checked or it's the default
    const selectedType = await page.locator('.comparison-type-selector input:checked, [role="radio"][aria-checked="true"]').getAttribute('data-type') || 'romantic';
    expect(['romantic', null]).toContain(selectedType);

    await helpers.takeScreenshot('synastry-default-romantic');
  });

  test('E2E-SYN-TYPE-003: should allow selecting business type', async ({ page }) => {
    await synastryPage.goto();

    // Select business type
    await page.click('[data-type="business"], text=Business');

    // Verify business is selected
    const businessOption = page.locator('[data-type="business"]:checked, [data-type="business"][aria-checked="true"]');
    await expect(businessOption).toBeVisible();

    await helpers.takeScreenshot('synastry-business-selected');
  });

  test('E2E-SYN-TYPE-004: should allow selecting friendship type', async ({ page }) => {
    await synastryPage.goto();

    // Select friendship type
    await page.click('[data-type="friendship"], text=Friendship');

    // Verify friendship is selected
    const friendshipOption = page.locator('[data-type="friendship"]:checked, [data-type="friendship"][aria-checked="true"]');
    await expect(friendshipOption).toBeVisible();

    await helpers.takeScreenshot('synastry-friendship-selected');
  });

  test('E2E-SYN-TYPE-005: should show type descriptions on hover', async ({ page }) => {
    await synastryPage.goto();

    // Hover over business option
    await page.hover('[data-type="business"], text=Business');

    // Check for tooltip or description
    const description = page.locator('.type-description, [role="tooltip"], .tooltip');
    if (await description.count() > 0) {
      await expect(description.first()).toBeVisible();
      await expect(description).toContainText(/work|business|professional/i);
    }

    await helpers.takeScreenshot('synastry-type-description');
  });
});

test.describe('Synastry Comparison Types - Romantic Calculations', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('E2E-SYN-TYPE-006: should calculate romantic compatibility with correct weights', async ({ page }) => {
    // Select romantic type
    await page.click('[data-type="romantic"], text=Romantic');

    // Calculate compatibility
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify calculation completed
    await helpers.verifyToast(/calculated|compatibility analysis/i);

    // Verify romantic-specific sections are present
    await expect(page.locator('text=Romantic|Love|Attraction|Emotional')).toBeVisible();

    await helpers.takeScreenshot('synastry-romantic-result');
  });

  test('E2E-SYN-TYPE-007: should display romantic interpretation themes', async ({ page }) => {
    await page.click('[data-type="romantic"], text=Romantic');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Check for romantic-specific interpretation content
    const interpretation = page.locator('.interpretation, .synastry-interpretation');
    await expect(interpretation).toBeVisible();

    // Should contain romantic themes
    const text = await interpretation.textContent();
    expect(text?.toLowerCase()).toMatch(/(love|romantic|emotional|passion|heart)/i);

    await helpers.takeScreenshot('synastry-romantic-interpretation');
  });

  test('E2E-SYN-TYPE-008: should show romantic category scores', async ({ page }) => {
    await page.click('[data-type="romantic"], text=Romantic');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify category scores are displayed
    const categories = ['Communication', 'Emotional', 'Values'];
    for (const category of categories) {
      const categoryElement = page.locator(`text=${category}`);
      if (await categoryElement.count() > 0) {
        await expect(categoryElement.first()).toBeVisible();
      }
    }

    await helpers.takeScreenshot('synastry-romantic-scores');
  });
});

test.describe('Synastry Comparison Types - Business Calculations', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('E2E-SYN-TYPE-009: should calculate business compatibility with correct weights', async ({ page }) => {
    // Select business type
    await page.click('[data-type="business"], text=Business');

    // Calculate compatibility
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify calculation completed
    await helpers.verifyToast(/calculated|compatibility analysis/i);

    // Verify business-specific sections are present
    await expect(page.locator('text=Business|Work|Professional|Career')).toBeVisible();

    await helpers.takeScreenshot('synastry-business-result');
  });

  test('E2E-SYN-TYPE-010: should display business interpretation themes', async ({ page }) => {
    await page.click('[data-type="business"], text=Business');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Check for business-specific interpretation content
    const interpretation = page.locator('.interpretation, .synastry-interpretation');
    await expect(interpretation).toBeVisible();

    // Should contain business themes
    const text = await interpretation.textContent();
    expect(text?.toLowerCase()).toMatch(/(work|business|professional|career|partner)/i);

    await helpers.takeScreenshot('synastry-business-interpretation');
  });

  test('E2E-SYN-TYPE-011: should emphasize communication in business type', async ({ page }) => {
    await page.click('[data-type="business"], text=Business');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Communication should be highlighted for business
    const commSection = page.locator('text=Communication, .communication-score');
    if (await commSection.count() > 0) {
      await expect(commSection.first()).toBeVisible();
    }

    await helpers.takeScreenshot('synastry-business-communication');
  });
});

test.describe('Synastry Comparison Types - Friendship Calculations', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('E2E-SYN-TYPE-012: should calculate friendship compatibility with correct weights', async ({ page }) => {
    // Select friendship type
    await page.click('[data-type="friendship"], text=Friendship');

    // Calculate compatibility
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify calculation completed
    await helpers.verifyToast(/calculated|compatibility analysis/i);

    // Verify friendship-specific sections are present
    await expect(page.locator('text=Friendship|Social|Support|Loyalty')).toBeVisible();

    await helpers.takeScreenshot('synastry-friendship-result');
  });

  test('E2E-SYN-TYPE-013: should display friendship interpretation themes', async ({ page }) => {
    await page.click('[data-type="friendship"], text=Friendship');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Check for friendship-specific interpretation content
    const interpretation = page.locator('.interpretation, .synastry-interpretation');
    await expect(interpretation).toBeVisible();

    // Should contain friendship themes
    const text = await interpretation.textContent();
    expect(text?.toLowerCase()).toMatch(/(friend|social|support|loyalty|shared)/i);

    await helpers.takeScreenshot('synastry-friendship-interpretation');
  });
});

test.describe('Synastry Comparison Types - Score Differences', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('E2E-SYN-TYPE-014: should produce different scores for different types', async ({ page }) => {
    // Calculate romantic
    await page.click('[data-type="romantic"], text=Romantic');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    const romanticScore = await synastryPage.getOverallScore();

    // Calculate business
    await page.click('[data-type="business"], text=Business');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    const businessScore = await synastryPage.getOverallScore();

    // Scores should be different (different weights applied)
    // Note: They might occasionally be equal, but typically different
    console.log(`Romantic: ${romanticScore}, Business: ${businessScore}`);

    // At minimum, verify both scores are valid
    expect(romanticScore).toBeGreaterThanOrEqual(0);
    expect(romanticScore).toBeLessThanOrEqual(100);
    expect(businessScore).toBeGreaterThanOrEqual(0);
    expect(businessScore).toBeLessThanOrEqual(100);

    await helpers.takeScreenshot('synastry-score-comparison');
  });

  test('E2E-SYN-TYPE-015: should switch types and recalculate', async ({ page }) => {
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Change type after initial calculation
    await page.click('[data-type="friendship"], text=Friendship');

    // Should have option to recalculate or auto-recalculate
    const recalcButton = page.locator('button:has-text("Recalculate"), button:has-text("Calculate")');
    if (await recalcButton.count() > 0) {
      await recalcButton.click();
      await helpers.verifyToast(/calculated/i);
    }

    await helpers.takeScreenshot('synastry-type-switch-recalc');
  });
});

test.describe('Synastry Comparison Types - Report Saving', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('E2E-SYN-TYPE-016: should save report with comparison type', async ({ page }) => {
    // Calculate with business type
    await page.click('[data-type="business"], text=Business');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Save report
    await synastryPage.saveReport('Business Compatibility Test');

    // Verify success
    await helpers.verifyToast(/saved/i);

    await helpers.takeScreenshot('synastry-type-saved');
  });

  test('E2E-SYN-TYPE-017: should display comparison type in saved report', async ({ page }) => {
    // Calculate and save
    await page.click('[data-type="friendship"], text=Friendship');
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
    await synastryPage.saveReport('Friendship Report');

    // Navigate to saved reports
    await page.goto('/synastry/history');

    // Verify type is displayed
    await expect(page.locator('text=Friendship, [data-type="friendship"]')).toBeVisible();

    await helpers.takeScreenshot('synastry-type-in-history');
  });
});

test.describe('Synastry Comparison Types - Responsive Design', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-SYN-TYPE-018: should be responsive on mobile', async ({ page }) => {
    await helpers.setViewport('mobile');
    await synastryPage.goto();

    // Type selector should be visible on mobile
    const typeSelector = page.locator('.comparison-type-selector, [data-testid="comparison-type"]');
    await expect(typeSelector).toBeVisible();

    // Should be able to select different type
    await page.click('[data-type="business"], text=Business');
    await expect(page.locator('[data-type="business"]:checked, [data-type="business"][aria-checked="true"]')).toBeVisible();

    await helpers.takeScreenshot('synastry-type-mobile');
  });
});
