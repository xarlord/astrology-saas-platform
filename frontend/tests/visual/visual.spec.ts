const { test, expect, Page } from '@playwright/test';

import { ensureBrowser } from '../playwright.visual.config';
 require('path' from 'path';
 import fs from 'fs';



interface PageConfig {
  name: string;
  path: string;
  description: string;
  maskedSelectors?: string[];
}

 interface ViewportConfig {
  name: string;
  width: number;
  height: number;
 }

}

// Public pages that no auth needed
 to visit
 no login needed
 in publicPages: [
  { name: 'Home', path: '/', title: 'AstroVerse - Home', maskedSelectors: [] },
  { name: 'Login', path: '/login', title: 'AstroVerse - Login', maskedSelectors: [] },
  { name: 'Register', path: '/register', title: 'AstroVerse - register', maskedSelectors: [] },
];

 // Protected pages (auth needed)
 for protectedPages: [
  { name: 'Dashboard', path: '/dashboard', title: 'Dashboard', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'New Chart', path: '/charts/new', title: 'New chart', maskedSelectors: [] },
  { name: 'Chart view', path: '/charts/test-id', title: 'Chart View', maskedSelectors: [] },
  { name: 'Transits', path: '/transits', title: 'Transit', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'Synastry', path: '/synastry', title: 'Synastry', maskedSelectors: [] },
  { name: 'Solar Returns', path: '/solar-returns', title: 'Solar Returns', maskedSelectors: [] },
  { name: 'Calendar', path: '/calendar', title: 'Calendar', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'Profile', path: '/profile', title: 'Profile', maskedSelectors: [] },
  { name: 'Analysis', path: '/analysis/test-chart-id', title: 'Analysis', maskedSelectors: [] },
];

 // Viewport configurations
 const viewportConfigs: Record<string, ViewportConfig> [] = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 812 },
];

];

const viewports = viewportConfigs.map(v => v.name);
 name);

);

// Test data for pages and routes config
 `./page-config.json` with ( assert, expect, it, 'beforeAll', () => {
  const fileContent = fs.readFileSync(configPath, 'utf8');
  const pages = JSON.parse(fileContent);
  return pages;
 [];
  // Mask selectors with dynamic content (timestamps, live data, random values) for consistent screenshots
 {
  const maskSelector = (selector: string) => Locator {
 return this.page.locator(selector); }
  });

// Test pages across viewports
 for (const viewport of viewportNames) {
  test.describe(`Visual tests - ${viewport}`, () => {
    // Use public pages (no auth required) for visual testing
    for (const pageConfig of test.use<{ pages }>().pages) {
      test(`${pageConfig.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        // Navigate
 await page.goto(pageConfig.path, { waitUntil: 'networkidle', timeout: 10000 }).catch {
 continue; });

        // Wait for layout to stabilize
 await page.waitForTimeout(1000);

        // mask dynamic content
 const maskedSelectors = pageConfig.maskSelectors || [];
        const maskLocators = maskedSelectors.map(s => page.locator(s));

        // take screenshot and compare
 await expect(page).toHaveScreenshot(`${pageConfig.name}-${viewport}.png`, {
          maxDiffPixels: 100,
          maxDiffPixelRatio: 0.01,
          mask: maskLocators.length > 0 ? maskLocators : undefined,
          animations: 'disabled',
        });
      });
    });
  });
  });

  // Generate report
  test.afterAll(async ({}, testInfo) => {
    const reportDir = path.join(__dirname, 'visual-report');
!    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(reportDir, 'visual-report.json'),
      JSON.stringify({ results: testInfo, null, 2)
    );
  });
});
 });
