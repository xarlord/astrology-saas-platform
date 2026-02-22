/**
 * Debug Page Load
 */

import { test, expect } from '@playwright/test';

test('should load registration page', async ({ page }) => {
  console.log('Navigating to /register...');
  await page.goto('/register');

  console.log('Waiting 2 seconds for page load...');
  await page.waitForTimeout(2000);

  console.log('Page URL:', page.url());
  console.log('Page title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'debug-page-load.png', fullPage: true });

  // List all inputs
  const inputs = await page.locator('input').all();
  console.log('Number of input elements:', inputs.length);

  for (let i = 0; i < Math.min(inputs.length, 10); i++) {
    const input = inputs[i];
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`Input ${i + 1}:`, { id, name, type, placeholder });
  }

  // List all buttons
  const buttons = await page.locator('button').all();
  console.log('Number of buttons:', buttons.length);

  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    console.log(`Button ${i + 1}:`, { text, type });
  }

  // Check for data-testid attributes
  const withTestId = await page.locator('[data-testid]').all();
  console.log('Elements with data-testid:', withTestId.length);

  for (let i = 0; i < Math.min(withTestId.length, 10); i++) {
    const element = withTestId[i];
    const testId = await element.getAttribute('data-testid');
    console.log(`Test ID ${i + 1}:`, testId);
  }
});
