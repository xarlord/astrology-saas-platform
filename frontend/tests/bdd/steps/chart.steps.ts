/**
 * Chart Step Definitions
 *
 * @description Step definitions for natal chart operations
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../hooks/world';
import { testDatabase } from '../support/database';
import { faker } from '@faker-js/faker';

// Chart Background Setup
Given('I have {int} saved charts', async function (this: ICustomWorld, count: number) {
  if (!this.testUser?.id) {
    const user = await testDatabase.createTestUser();
    this.testUser = user;
  }

  for (let i = 0; i < count; i++) {
    await testDatabase.createTestChart({
      userId: this.testUser.id,
      name: `Test Chart ${i + 1}`,
    });
  }
});

Given('I have a chart named {string}', async function (this: ICustomWorld, chartName: string) {
  if (!this.testUser?.id) {
    const user = await testDatabase.createTestUser();
    this.testUser = user;
  }

  const chart = await testDatabase.createTestChart({
    userId: this.testUser.id,
    name: chartName,
  });

  this.testData.chart = chart;
});

Given('I have no saved charts', async function (this: ICustomWorld) {
  // This is the default state - no action needed
});

// Chart Creation Steps
When('I create a chart with the following details:', async function (this: ICustomWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();

  await this.page?.goto('/charts/create');
  await this.page?.waitForLoadState('networkidle');

  // Fill in chart details
  if (data.name) {
    await this.page?.getByLabel(/name/i).first().fill(data.name);
  }
  if (data['birth date']) {
    await this.page?.getByLabel(/birth date|date of birth/i).first().fill(data['birth date']);
  }
  if (data['birth time']) {
    await this.page?.getByLabel(/birth time|time of birth/i).first().fill(data['birth time']);
  }
  if (data['birth location'] || data.location) {
    const location = data['birth location'] || data.location;
    await this.page?.getByLabel(/location|place of birth|city/i).first().fill(location);
    // Wait for location suggestions
    await this.page?.waitForTimeout(500);
    // Select first suggestion if available
    const suggestion = this.page?.locator('[role="listbox"] [role="option"]').first();
    if (await suggestion?.isVisible()) {
      await suggestion?.click();
    }
  }
  if (data.latitude) {
    await this.page?.getByLabel(/latitude/i).first().fill(data.latitude);
  }
  if (data.longitude) {
    await this.page?.getByLabel(/longitude/i).first().fill(data.longitude);
  }
});

When('I submit the chart creation form', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /create|save|generate|calculate/i }).click();
});

Then('the chart should be created', async function (this: ICustomWorld) {
  await expect(this.page!).toHaveURL(/.*\/charts\/.*/);
});

Then('the chart should be saved to my collection', async function (this: ICustomWorld) {
  await this.page?.goto('/charts');
  const chartName = (this.testData.chart as { name?: string })?.name || 'Test Chart';
  await expect(this.page!.getByText(chartName)).toBeVisible();
});

Then('I should see the chart visualization', async function (this: ICustomWorld) {
  const chartSvg = this.page?.locator('svg.chart, canvas.chart, [data-testid="chart-visualization"]');
  await expect(chartSvg).toBeVisible();
});

// Chart Viewing Steps
When('I view the chart {string}', async function (this: ICustomWorld, chartName: string) {
  await this.page?.goto('/charts');
  await this.page?.getByText(chartName).click();
  await this.page?.waitForLoadState('networkidle');
});

When('I view my charts list', async function (this: ICustomWorld) {
  await this.page?.goto('/charts');
  await this.page?.waitForLoadState('networkidle');
});

Then('I should see {int} charts', async function (this: ICustomWorld, count: number) {
  const charts = this.page?.locator('[data-testid="chart-card"], .chart-card');
  await expect(charts).toHaveCount(count);
});

Then('I should see the chart details for {string}', async function (this: ICustomWorld, chartName: string) {
  await expect(this.page!.getByText(chartName)).toBeVisible();
});

Then('I should see the following planetary positions:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const planet = row.planet || row.Planet;
    const sign = row.sign || row.Sign;

    await expect(this.page!.getByText(new RegExp(`${planet}.*${sign}`, 'i'))).toBeVisible();
  }
});

// Chart Editing Steps
When('I edit the chart {string}', async function (this: ICustomWorld, chartName: string) {
  await this.page?.goto('/charts');
  await this.page?.getByText(chartName).click();
  await this.page?.getByRole('button', { name: /edit/i }).click();
});

When('I update the chart name to {string}', async function (this: ICustomWorld, newName: string) {
  await this.page?.getByLabel(/name/i).first().clear();
  await this.page?.getByLabel(/name/i).first().fill(newName);
  await this.page?.getByRole('button', { name: /save|update/i }).click();
});

Then('the chart should be updated', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/updated|saved|changes saved/i)).toBeVisible();
});

// Chart Deletion Steps
When('I delete the chart {string}', async function (this: ICustomWorld, chartName: string) {
  await this.page?.goto('/charts');
  const chartCard = this.page?.locator('[data-testid="chart-card"], .chart-card').filter({ hasText: chartName });
  await chartCard?.getByRole('button', { name: /delete|remove/i }).click();

  // Confirm deletion
  await this.page?.getByRole('button', { name: /confirm|yes|delete/i }).click();
});

Then('the chart should be deleted', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/deleted|removed/i)).toBeVisible();
});

Then('I should not see {string} in my charts', async function (this: ICustomWorld, chartName: string) {
  await this.page?.goto('/charts');
  await expect(this.page!.getByText(chartName)).not.toBeVisible();
});

// Chart Search/Filter Steps
When('I search for charts with name {string}', async function (this: ICustomWorld, searchTerm: string) {
  await this.page?.getByPlaceholder(/search/i).fill(searchTerm);
  await this.page?.waitForTimeout(500);
});

Then('I should see charts matching {string}', async function (this: ICustomWorld, searchTerm: string) {
  await expect(this.page!.getByText(new RegExp(searchTerm, 'i'))).toBeVisible();
});

// Chart Export Steps
When('I export the chart as {string}', async function (this: ICustomWorld, format: string) {
  await this.page?.getByRole('button', { name: /export|download/i }).click();
  await this.page?.getByRole('menuitem', { name: new RegExp(format, 'i') }).click();
});

Then('the chart should be downloaded as {string}', async function (this: ICustomWorld, format: string) {
  const download = await this.page?.waitForEvent('download');
  expect(download?.suggestedFilename()).toContain(format.toLowerCase());
});

// Chart Sharing Steps
When('I share the chart with email {string}', async function (this: ICustomWorld, email: string) {
  await this.page?.getByRole('button', { name: /share/i }).click();
  await this.page?.getByLabel(/email/i).fill(email);
  await this.page?.getByRole('button', { name: /send|share/i }).click();
});

Then('the chart should be shared', async function (this: ICustomWorld) {
  await expect(this.page!.getByText(/shared|sent|invitation sent/i)).toBeVisible();
});

// Chart Interpretation Steps
Then('I should see interpretations for:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const element = row.element || row.Element;
    await expect(this.page!.getByRole('heading', { name: new RegExp(element, 'i') })).toBeVisible();
  }
});

When('I request a detailed interpretation', async function (this: ICustomWorld) {
  await this.page?.getByRole('button', { name: /detailed|full interpretation|analyze/i }).click();
});

Then('I should see detailed analysis of:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const section = row.section || row.Section;
    await expect(this.page!.getByRole('heading', { name: new RegExp(section, 'i') })).toBeVisible();
  }
});
