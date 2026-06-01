/**
 * Playwright script to capture screenshots and record videos of Phase 2 components.
 * Run: npx tsx scripts/capture-visuals.ts
 */
import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUT_DIR = '/tmp/astroverse_screenshots';
const BASE_URL = 'http://localhost:5173';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2, // Retina quality
  });
  const page = await context.newPage();

  // ─── 1. Chart Wheel (Phase 1) ─────────────────────────────────
  console.log('📸 Capturing Chart Wheel...');
  // Login first
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', 'sefa@test.com');
  await page.fill('input[type="password"], input[name="password"]', 'Test1234!@qwe');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Navigate to chart
  await page.goto(`${BASE_URL}/charts/2d0a61b6-0cd4-4107-ae61-e7597ea75599`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Wait for chart animation
  
  // Screenshot just the chart wheel SVG
  const chartWheel = page.locator('svg[role="img"], img[alt*="chart"], img[alt*="wheel"]').first();
  if (await chartWheel.count() > 0) {
    await chartWheel.screenshot({ path: path.join(OUT_DIR, 'chart_wheel.png') });
    console.log('  ✅ chart_wheel.png');
  } else {
    // Screenshot the whole page section
    await page.screenshot({ path: path.join(OUT_DIR, 'chart_page.png'), fullPage: false });
    console.log('  ✅ chart_page.png (full page)');
  }

  // ─── 2. Dashboard ─────────────────────────────────────────────
  console.log('📸 Capturing Dashboard...');
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard.png'), fullPage: true });
  console.log('  ✅ dashboard.png');

  // ─── 3. Visual Demo — Phase 2 Components ──────────────────────
  console.log('📸 Capturing Phase 2 Visual Demo...');
  await page.goto(`${BASE_URL}/visual-demo`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Full page screenshot
  await page.screenshot({ path: path.join(OUT_DIR, 'phase2_all_components.png'), fullPage: true });
  console.log('  ✅ phase2_all_components.png');

  // Individual component screenshots
  const components = [
    { name: 'time_travel_slider', heading: 'Time Travel' },
    { name: 'transit_overlay', heading: 'Transit Overlay' },
    { name: 'cosmic_identity_card', heading: 'COSMIC IDENTITY' },
    { name: 'onboarding_reveal', heading: 'cosmic blueprint' },
  ];

  for (const comp of components) {
    try {
      // Find the section containing this component
      const section = page.locator(`section:has-text("${comp.heading}")`).first();
      if (await section.count() > 0) {
        await section.screenshot({ path: path.join(OUT_DIR, `${comp.name}.png`) });
        console.log(`  ✅ ${comp.name}.png`);
      } else {
        // Try parent div
        const el = page.locator(`div:has(> h3:has-text("${comp.heading}"))`).first();
        if (await el.count() > 0) {
          await el.screenshot({ path: path.join(OUT_DIR, `${comp.name}.png`) });
          console.log(`  ✅ ${comp.name}.png`);
        }
      }
    } catch (e: any) {
      console.log(`  ⚠️  ${comp.name}: ${e.message}`);
    }
  }

  // ─── 4. Record Animation Video ────────────────────────────────
  console.log('🎬 Recording animation video...');
  
  // Start recording on the visual demo page
  const videoContext = await browser.newContext({
    viewport: { width: 800, height: 600 },
    recordVideo: { dir: OUT_DIR, size: { width: 800, height: 600 } },
  });
  const videoPage = await videoContext.newPage();
  
  // TimeTravel Slider interaction
  await videoPage.goto(`${BASE_URL}/visual-demo`);
  await videoPage.waitForLoadState('networkidle');
  await videoPage.waitForTimeout(1000);
  
  // Animate the slider
  const slider = videoPage.locator('input[type="range"]').first();
  for (let i = 0; i <= 365; i += 5) {
    await slider.fill(String(i));
    await videoPage.waitForTimeout(50);
  }
  await videoPage.waitForTimeout(500);

  // Scroll to transit overlay
  await videoPage.locator('h3:has-text("Transit Overlay")').scrollIntoViewIfNeeded();
  await videoPage.waitForTimeout(2000); // Let conjunction animations play

  // Scroll to cosmic identity card
  await videoPage.locator('h3:has-text("COSMIC IDENTITY")').scrollIntoViewIfNeeded();
  await videoPage.waitForTimeout(2000);

  // Close video context to save the file
  const videoPath = await videoPage.video()?.path();
  await videoContext.close();
  
  if (videoPath) {
    const finalVideoPath = path.join(OUT_DIR, 'phase2_animations.webm');
    fs.renameSync(videoPath, finalVideoPath);
    console.log(`  ✅ phase2_animations.webm`);
  }

  // ─── 5. Chart Wheel Animation Video ───────────────────────────
  console.log('🎬 Recording chart wheel animation...');
  const chartVideoContext = await browser.newContext({
    viewport: { width: 800, height: 800 },
    recordVideo: { dir: OUT_DIR, size: { width: 800, height: 800 } },
  });
  const chartPage = await chartVideoContext.newPage();
  
  // Login
  await chartPage.goto(`${BASE_URL}/login`);
  await chartPage.waitForLoadState('networkidle');
  await chartPage.fill('input[type="email"], input[name="email"]', 'sefa@test.com');
  await chartPage.fill('input[type="password"], input[name="password"]', 'Test1234!@qwe');
  await chartPage.click('button:has-text("Sign In")');
  await chartPage.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
  await chartPage.waitForTimeout(2000);
  
  // Navigate to chart and record the birth animation
  await chartPage.goto(`${BASE_URL}/charts/2d0a61b6-0cd4-4107-ae61-e7597ea75599`);
  await chartPage.waitForLoadState('networkidle');
  await chartPage.waitForTimeout(5000); // Record the chart loading animation
  
  const chartVideoPath = await chartPage.video()?.path();
  await chartVideoContext.close();
  
  if (chartVideoPath) {
    const finalPath = path.join(OUT_DIR, 'chart_wheel_animation.webm');
    fs.renameSync(chartVideoPath, finalPath);
    console.log(`  ✅ chart_wheel_animation.webm`);
  }

  await browser.close();
  console.log('\n✅ All visuals captured! Check:', OUT_DIR);
  
  // List all files
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png') || f.endsWith('.webm'));
  for (const f of files) {
    const stat = fs.statSync(path.join(OUT_DIR, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

main().catch(console.error);
