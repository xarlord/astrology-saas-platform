/**
 * Common Step Definitions
 *
 * @description Shared step definitions for navigation, assertions, etc.
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../hooks/world';

// Navigation Steps
Given('I am on the {string} page', async function (this: ICustomWorld, pageName: string) {
  const routes: Record<string, string> = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    profile: '/profile',
    charts: '/charts',
    'chart creation': '/charts/create',
    calendar: '/calendar',
    synastry: '/synastry',
    transits: '/transits',
    'solar returns': '/solar-returns',
    'lunar returns': '/lunar-returns',
    settings: '/settings',
  };

  const route = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
  await this.page?.goto(route);
  await this.page?.waitForLoadState('networkidle');
});

Given('I navigate to {string}', async function (this: ICustomWorld, url: string) {
  await this.page?.goto(url);
  await this.page?.waitForLoadState('networkidle');
});

When('I click on {string}', async function (this: ICustomWorld, selector: string) {
  await this.page?.click(selector);
});

When('I click the {string} button', async function (this: ICustomWorld, buttonName: string) {
  await this.page?.getByRole('button', { name: new RegExp(buttonName, 'i') }).click();
});

When('I click the {string} link', async function (this: ICustomWorld, linkName: string) {
  await this.page?.getByRole('link', { name: new RegExp(linkName, 'i') }).click();
});

When('I press {string}', async function (this: ICustomWorld, key: string) {
  await this.page?.keyboard.press(key);
});

When('I scroll to {string}', async function (this: ICustomWorld, selector: string) {
  await this.page?.locator(selector).scrollIntoViewIfNeeded();
});

When('I wait for {int} seconds', async function (this: ICustomWorld, seconds: number) {
  await this.page?.waitForTimeout(seconds * 1000);
});

When('I wait for the page to load', async function (this: ICustomWorld) {
  await this.page?.waitForLoadState('networkidle');
});

When('I wait for {string} to appear', async function (this: ICustomWorld, selector: string) {
  await this.page?.waitForSelector(selector, { timeout: 10000 });
});

When('I wait for {string} to disappear', async function (this: ICustomWorld, selector: string) {
  await this.page?.waitForSelector(selector, { state: 'hidden', timeout: 10000 });
});

// Form Input Steps
When('I fill in {string} with {string}', async function (this: ICustomWorld, fieldName: string, value: string) {
  const field = this.page?.getByLabel(new RegExp(fieldName, 'i')).first() ||
    this.page?.locator(`input[name="${fieldName}"], input[placeholder*="${fieldName}" i]`).first();
  await field?.fill(value);
});

When('I fill in the following fields:', async function (this: ICustomWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const field = row.field || row.Field;
    const value = row.value || row.Value;

    const input = this.page?.getByLabel(new RegExp(field, 'i')).first() ||
      this.page?.locator(`input[name="${field.toLowerCase()}"], input[placeholder*="${field}" i]`).first();

    await input?.fill(value);
  }
});

When('I select {string} from {string}', async function (this: ICustomWorld, option: string, dropdown: string) {
  await this.page?.getByLabel(new RegExp(dropdown, 'i')).selectOption({ label: option });
});

When('I check {string}', async function (this: ICustomWorld, checkbox: string) {
  await this.page?.getByLabel(new RegExp(checkbox, 'i')).check();
});

When('I uncheck {string}', async function (this: ICustomWorld, checkbox: string) {
  await this.page?.getByLabel(new RegExp(checkbox, 'i')).uncheck();
});

When('I upload {string} to {string}', async function (this: ICustomWorld, filePath: string, fieldName: string) {
  await this.page?.getByLabel(new RegExp(fieldName, 'i')).setInputFiles(filePath);
});

When('I clear {string}', async function (this: ICustomWorld, fieldName: string) {
  await this.page?.getByLabel(new RegExp(fieldName, 'i')).clear();
});

// Assertion Steps
Then('I should be on the {string} page', async function (this: ICustomWorld, pageName: string) {
  const routes: Record<string, string> = {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    profile: '/profile',
    charts: '/charts',
    calendar: '/calendar',
    synastry: '/synastry',
  };

  const expectedPath = routes[pageName.toLowerCase()] || `/${pageName.toLowerCase()}`;
  await expect(this.page!).toHaveURL(new RegExp(expectedPath));
});

Then('I should see {string}', async function (this: ICustomWorld, text: string) {
  await expect(this.page!.getByText(new RegExp(text, 'i'))).toBeVisible();
});

Then('I should not see {string}', async function (this: ICustomWorld, text: string) {
  await expect(this.page!.getByText(new RegExp(text, 'i'))).not.toBeVisible();
});

Then('I should see the {string} button', async function (this: ICustomWorld, buttonName: string) {
  await expect(this.page!.getByRole('button', { name: new RegExp(buttonName, 'i') })).toBeVisible();
});

Then('I should see the {string} link', async function (this: ICustomWorld, linkName: string) {
  await expect(this.page!.getByRole('link', { name: new RegExp(linkName, 'i') })).toBeVisible();
});

Then('I should see an error message {string}', async function (this: ICustomWorld, message: string) {
  const errorLocator = this.page!.locator('.error, .alert-error, [role="alert"], .toast-error');
  await expect(errorLocator.getByText(new RegExp(message, 'i'))).toBeVisible();
});

Then('I should see a success message {string}', async function (this: ICustomWorld, message: string) {
  const successLocator = this.page!.locator('.success, .alert-success, [role="status"], .toast-success');
  await expect(successLocator.getByText(new RegExp(message, 'i'))).toBeVisible();
});

Then('the {string} field should contain {string}', async function (this: ICustomWorld, fieldName: string, value: string) {
  const field = this.page!.getByLabel(new RegExp(fieldName, 'i')).first();
  await expect(field).toHaveValue(value);
});

Then('the {string} field should be empty', async function (this: ICustomWorld, fieldName: string) {
  const field = this.page!.getByLabel(new RegExp(fieldName, 'i')).first();
  await expect(field).toHaveValue('');
});

Then('the {string} checkbox should be checked', async function (this: ICustomWorld, checkbox: string) {
  await expect(this.page!.getByLabel(new RegExp(checkbox, 'i'))).toBeChecked();
});

Then('the {string} checkbox should not be checked', async function (this: ICustomWorld, checkbox: string) {
  await expect(this.page!.getByLabel(new RegExp(checkbox, 'i'))).not.toBeChecked();
});

Then('the page title should contain {string}', async function (this: ICustomWorld, text: string) {
  await expect(this.page!).toHaveTitle(new RegExp(text, 'i'));
});

Then('{string} should be disabled', async function (this: ICustomWorld, elementName: string) {
  const element = this.page!.getByRole('button', { name: new RegExp(elementName, 'i') })
    .or(this.page!.getByLabel(new RegExp(elementName, 'i')));
  await expect(element).toBeDisabled();
});

Then('{string} should be enabled', async function (this: ICustomWorld, elementName: string) {
  const element = this.page!.getByRole('button', { name: new RegExp(elementName, 'i') })
    .or(this.page!.getByLabel(new RegExp(elementName, 'i')));
  await expect(element).toBeEnabled();
});

// URL Assertions
Then('the URL should contain {string}', async function (this: ICustomWorld, text: string) {
  await expect(this.page!).toHaveURL(new RegExp(text));
});

Then('the URL should not contain {string}', async function (this: ICustomWorld, text: string) {
  await expect(this.page!).not.toHaveURL(new RegExp(text));
});

// Count Assertions
Then('I should see {int} {string}', async function (this: ICustomWorld, count: number, elementName: string) {
  const elements = this.page!.getByRole('listitem').filter({ hasText: elementName })
    .or(this.page!.locator(`[data-testid="${elementName.toLowerCase().replace(/\s+/g, '-')}"]`));
  await expect(elements).toHaveCount(count);
});

// Screenshot Step
Then('I take a screenshot named {string}', async function (this: ICustomWorld, name: string) {
  const screenshot = await this.page?.screenshot({ fullPage: true });
  if (screenshot) {
    this.attach(screenshot, 'image/png');
  }
});
