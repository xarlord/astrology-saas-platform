/**
 * Synastry Step Definitions
 *
 * @description Step definitions for compatibility and synastry analysis
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../hooks/world';
import { testDatabase } from '../support/database';
import { faker } from '@faker-js/faker';

// Synastry Background Setup
Given('I have two charts for comparison:', async function (this: ICustomWorld, dataTable: DataTable) {
  if (!this.testUser?.id) {
    const user = await testDatabase.createTestUser();
    this.testUser = user;
  }

  const charts = dataTable.hashes();
  const createdCharts = [];

  for (const chartData of charts) {
    const chart = await testDatabase.createTestChart({
      userId: this.testUser.id,
      name: chartData.name || faker.person.firstName(),
      birthDate: new Date(chartData['birth date'] || '1990-01-01'),
      birthTime: chartData['birth time'] || '12:00',
      birthLocation: chartData.location || 'New York, NY',
    });
    createdCharts.push(chart);
  }

  this.testData.charts = createdCharts;
});

Given('I have a synastry report between {string} and {string}', async function (this: ICustomWorld, chart1Name: string, chart2Name: string) {
  if (!this.testUser?.id) {
    const user = await testDatabase.createTestUser();
    this.testUser = user;
  }

  const chart1 = await testDatabase.createTestChart({
    userId: this.testUser.id,
    name: chart1Name,
  });

  const chart2 = await testDatabase.createTestChart({
    userId: this.testUser.id,
    name: chart2Name,
  });

  this.testData.charts = [chart1, chart2];
});

// Synastry Comparison Steps
When('I navigate to synastry comparison', async function (this: ICustomWorld) {
  await this.page?.goto('/synastry');
  await this.page?.waitForLoadState('networkidle');
});

When('I select {string} as the first chart', async function (this: ICustomWorld, chartName: string) {
  await this.page?.getByLabel(/first chart|person 1|chart 1/i).click();
  await this.page?.getByRole('option', { name: chartName }).click();
});

When('I select {string} as the second chart', async function (this: ICustomWorld, chartName: string) {
  await this.page?.getByLabel(/second chart|person 2|chart 2/i).click();
  await this.page?.getByRole('option', { name: chartName }).click();
});

When('I generate the synastry report', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /compare|generate|analyze/i }).click();
});

Then('I should see the synastry chart', async function (this: ICustomWorld) {
  const synastryChart = this.page?.locator('[data-testid="synastry-chart"], .synastry-chart, svg.synastry');
  await expect(synastryChart).toBeVisible();
});

Then('I should see the overall compatibility score', async function (this: ICustomWorld) {
  const score = this.page?.locator('[data-testid="compatibility-score"], .compatibility-score, .overall-score');
  await expect(score).toBeVisible();
});

Then('I should see compatibility scores for:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const category = row.category || row.Category;
    await expect(this.page!.getByText(new RegExp(category, 'i'))).toBeVisible();
  }
});

Then('I should see aspects between the charts', async function (this: ICustomWorld) {
  const aspectsSection = this.page?.locator('[data-testid="aspects"], .aspects-list');
  await expect(aspectsSection).toBeVisible();
});

Then('the aspects should include:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const planet1 = row['planet 1'] || row.Planet1;
    const planet2 = row['planet 2'] || row.Planet2;
    const aspect = row.aspect || row.Aspect;

    await expect(this.page!.getByText(new RegExp(`${planet1}.*${aspect}.*${planet2}`, 'i'))).toBeVisible();
  }
});

// Compatibility Interpretation Steps
Then('I should see interpretation for {string}', async function (this: ICustomWorld, element: string) {
  const interpretation = this.page?.locator(`[data-testid="interpretation-${element.toLowerCase()}"], .interpretation`)
    .filter({ hasText: element });
  await expect(interpretation).toBeVisible();
});

When('I view detailed aspect interpretations', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /detailed|full analysis|interpretations/i }).click();
});

Then('I should see strengths in the relationship', async function (this: ICustomWorld) {
  await expect(this.page!.getByRole('heading', { name: /strengths|positive aspects/i })).toBeVisible();
});

Then('I should see challenges in the relationship', async function (this: ICustomWorld) {
  await expect(this.page!.getByRole('heading', { name: /challenges|growth areas|difficult aspects/i })).toBeVisible();
});

// Synastry Export Steps
When('I export the synastry report', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /export|download|pdf/i }).click();
});

Then('the synastry report should be downloaded', async function (this: ICustomWorld) {
  const download = await this.page?.waitForEvent('download');
  expect(download?.suggestedFilename()).toMatch(/synastry|compatibility/i);
});

// Composite Chart Steps
When('I generate a composite chart', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /composite|combined chart/i }).click();
});

Then('I should see the composite chart', async function (this: ICustomWorld) {
  const compositeChart = this.page?.locator('[data-testid="composite-chart"], .composite-chart');
  await expect(compositeChart).toBeVisible();
});

// Davison Chart Steps
When('I generate a Davison relationship chart', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /davison|relationship chart/i }).click();
});

Then('I should see the Davison chart', async function (this: ICustomWorld) {
  const davisonChart = this.page?.locator('[data-testid="davison-chart"], .davison-chart');
  await expect(davisonChart).toBeVisible();
});
