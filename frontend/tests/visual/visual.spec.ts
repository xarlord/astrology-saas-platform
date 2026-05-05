import { test, expect } from '@playwright/test';
import path from 'path';
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

const publicPages: PageConfig[] = [
  { name: 'Home', path: '/', description: 'AstroVerse - Home', maskedSelectors: [] },
  { name: 'Login', path: '/login', description: 'AstroVerse - Login', maskedSelectors: [] },
  { name: 'Register', path: '/register', description: 'AstroVerse - Register', maskedSelectors: [] },
];

const protectedPages: PageConfig[] = [
  { name: 'Dashboard', path: '/dashboard', description: 'Dashboard', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'New Chart', path: '/charts/new', description: 'New Chart', maskedSelectors: [] },
  { name: 'Chart View', path: '/charts/test-id', description: 'Chart View', maskedSelectors: [] },
  { name: 'Transits', path: '/transits', description: 'Transits', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'Synastry', path: '/synastry', description: 'Synastry', maskedSelectors: [] },
  { name: 'Solar Returns', path: '/solar-returns', description: 'Solar Returns', maskedSelectors: [] },
  { name: 'Calendar', path: '/calendar', description: 'Calendar', maskedSelectors: ['[data-testid="live-data"]'] },
  { name: 'Profile', path: '/profile', description: 'Profile', maskedSelectors: [] },
  { name: 'Analysis', path: '/analysis/test-chart-id', description: 'Analysis', maskedSelectors: [] },
];

const viewportConfigs: ViewportConfig[] = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const allPages = [...publicPages, ...protectedPages];

for (const viewport of viewportConfigs) {
  test.describe(`Visual tests - ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const pageConfig of allPages) {
      test(`${pageConfig.name} - ${viewport.name}`, async ({ page }) => {
        await page.goto(pageConfig.path, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {
          // Continue even if navigation fails (e.g., protected pages redirect)
        });

        await page.waitForTimeout(1000);

        const maskedSelectors = pageConfig.maskedSelectors ?? [];
        const maskLocators = maskedSelectors.map((s) => page.locator(s));

        await expect(page).toHaveScreenshot(`${pageConfig.name}-${viewport.name}.png`, {
          maxDiffPixels: 100,
          maxDiffPixelRatio: 0.01,
          mask: maskLocators.length > 0 ? maskLocators : undefined,
          animations: 'disabled',
        });
      });
    }
  });
}

test.afterAll(async ({}, testInfo) => {
  const reportDir = path.join(__dirname, 'visual-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(reportDir, 'visual-report.json'),
    JSON.stringify({ results: testInfo }, null, 2),
  );
});
