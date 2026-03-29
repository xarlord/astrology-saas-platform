/**
 * Transit Step Definitions
 *
 * @description Step definitions for transit and progression analysis
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../hooks/world';
import { testDatabase } from '../support/database';

// Transit Background Setup
Given('I have a natal chart for transit analysis', async function (this: ICustomWorld) {
  if (!this.testUser?.id) {
    const user = await testDatabase.createTestUser();
    this.testUser = user;
  }

  const chart = await testDatabase.createTestChart({
    userId: this.testUser.id,
    name: 'Transit Analysis Chart',
    birthDate: new Date('1990-06-15'),
    birthTime: '14:30',
    birthLocation: 'New York, NY',
  });

  this.testData.chart = chart;
});

// Transit Viewing Steps
When('I view current transits', async function (this: ICustomWorld) {
  await this.page?.goto('/transits');
  await this.page?.waitForLoadState('networkidle');
});

When('I select my natal chart {string}', async function (this: ICustomWorld, chartName: string) {
  await this.page?.getByLabel(/natal chart|select chart/i).click();
  await this.page?.getByRole('option', { name: chartName }).click();
});

When('I view transits for date {string}', async function (this: ICustomWorld, date: string) {
  await this.page?.getByLabel(/date|transit date/i).fill(date);
  await this.page?.waitForTimeout(500);
});

Then('I should see current planetary positions', async function (this: ICustomWorld) {
  const planetaryPositions = this.page?.locator('[data-testid="current-transits"], .transit-positions');
  await expect(planetaryPositions).toBeVisible();
});

Then('I should see aspects to my natal planets', async function (this: ICustomWorld) {
  const aspects = this.page?.locator('[data-testid="transit-aspects"], .transit-aspects');
  await expect(aspects).toBeVisible();
});

Then('I should see transit effects categorized by:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const category = row.category || row.Category;
    await expect(this.page!.getByText(new RegExp(category, 'i'))).toBeVisible();
  }
});

// Transit Forecast Steps
When('I view the transit forecast for the next {int} months', async function (this: ICustomWorld, months: number) {
  await this.page?.getByRole('button', { name: /forecast|upcoming/i }).click();
  await this.page?.getByLabel(/period|months/i).fill(months.toString());
  await this.page?.getByRole('button', { name: /generate|show/i }).click();
});

Then('I should see major transits in the forecast', async function (this: ICustomWorld) {
  const forecast = this.page?.locator('[data-testid="transit-forecast"], .forecast-list');
  await expect(forecast).toBeVisible();
});

Then('I should see transit dates for each event', async function (this: ICustomWorld) {
  const dates = this.page?.locator('.transit-date, [data-testid="transit-date"]');
  await expect(dates.first()).toBeVisible();
});

// Progression Steps
When('I view secondary progressions', async function (this: ICustomWorld) {
  await this.page?.getByRole('tab', { name: /progressions/i }).click();
});

Then('I should see progressed chart positions', async function (this: ICustomWorld) {
  const progressions = this.page?.locator('[data-testid="progressions"], .progression-data');
  await expect(progressions).toBeVisible();
});

// Solar Return Steps
When('I view my solar return chart', async function (this: ICustomWorld) {
  await this.page?.goto('/solar-returns');
  await this.page?.waitForLoadState('networkidle');
});

When('I select year {int}', async function (this: ICustomWorld, year: number) {
  await this.page?.getByLabel(/year/i).fill(year.toString());
  await this.page?.getByRole('button', { name: /generate|calculate/i }).click();
});

Then('I should see the solar return chart', async function (this: ICustomWorld) {
  const solarReturnChart = this.page?.locator('[data-testid="solar-return-chart"], .solar-return-chart');
  await expect(solarReturnChart).toBeVisible();
});

Then('I should see key themes for the year', async function (this: ICustomWorld) {
  const themes = this.page?.locator('[data-testid="yearly-themes"], .yearly-themes');
  await expect(themes).toBeVisible();
});

// Lunar Return Steps
When('I view my lunar return chart', async function (this: ICustomWorld) {
  await this.page?.goto('/lunar-returns');
  await this.page?.waitForLoadState('networkidle');
});

Then('I should see the lunar return chart', async function (this: ICustomWorld) {
  const lunarReturnChart = this.page?.locator('[data-testid="lunar-return-chart"], .lunar-return-chart');
  await expect(lunarReturnChart).toBeVisible();
});

Then('I should see the lunar return date', async function (this: ICustomWorld) {
  const date = this.page?.locator('[data-testid="lunar-return-date"], .return-date');
  await expect(date).toBeVisible();
});

// Transit Interpretation Steps
When('I request detailed transit interpretation', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /interpretation|detailed analysis/i }).click();
});

Then('I should see interpretation for each transit', async function (this: ICustomWorld) {
  const interpretations = this.page?.locator('.transit-interpretation, [data-testid="interpretation"]');
  await expect(interpretations.first()).toBeVisible();
});

Then('I should see timing recommendations', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/timing|recommendations|best time/i)).toBeVisible();
});
