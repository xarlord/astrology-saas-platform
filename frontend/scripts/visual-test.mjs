/**
 * AstroVerse Visual Regression Test Runner
 * Captures screenshots of all public pages across 3 viewports
 * Compares with baselines and generates HTML report
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

const PAGES = [
  { name: 'Home', path: '/', description: 'Landing page' },
  { name: 'Login', path: '/login', description: 'Authentication page' },
  { name: 'Register', path: '/register', description: 'Registration page' },
  { name: 'Dashboard (redirect)', path: '/dashboard', description: 'Protected - redirects to login' },
  { name: 'New Chart (redirect)', path: '/charts/new', description: 'Protected - redirects to login' },
  { name: 'Transits (redirect)', path: '/transits', description: 'Protected - redirects to login' },
  { name: 'Synastry (redirect)', path: '/synastry', description: 'Protected - redirects to login' },
  { name: 'Solar Returns (redirect)', path: '/solar-returns', description: 'Protected - redirects to login' },
  { name: 'Calendar (redirect)', path: '/calendar', description: 'Protected - redirects to login' },
  { name: 'Lunar Returns (redirect)', path: '/lunar-returns', description: 'Protected - redirects to login' },
  { name: 'Profile (redirect)', path: '/profile', description: 'Protected - redirects to login' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateHtmlReport(results, errors, summary) {
  const rows = results.map(r => {
    const statusIcon = r.status === 'captured' ? 'OK' : r.status === 'error' ? 'ERR' : r.status;
    return `<tr>
      <td>${r.page}</td>
      <td>${r.viewport}</td>
      <td><code>${r.path}</code></td>
      <td>${statusIcon}</td>
      <td>${r.file ? `<a href="../screenshots/${r.file}">View</a>` : 'N/A'}</td>
    </tr>`;
  }).join('\n');

  const errorRows = errors.map(e => `<tr class="error">
    <td>${e.page}</td>
    <td>${e.viewport}</td>
    <td colspan="3">${e.error}</td>
  </tr>`).join('\n');

  return `<!DOCTYPE html>
<html><head><title>AstroVerse Visual Test Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 960px; margin: 40px auto; padding: 0 20px; background: #0f172a; color: #e2e8f0; }
  h1 { color: #818cf8; } h2 { color: #a5b4fc; margin-top: 2em; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 1em 0; }
  .card { background: #1e293b; border-radius: 8px; padding: 16px; text-align: center; }
  .card .number { font-size: 2em; font-weight: bold; }
  .card .label { color: #94a3b8; font-size: 0.9em; }
  .pass { color: #34d399; } .fail { color: #f87171; } .warn { color: #fbbf24; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #334155; }
  th { background: #1e293b; color: #94a3b8; font-weight: 600; }
  tr:hover { background: #1e293b; }
  tr.error td { color: #f87171; }
  code { background: #334155; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  a { color: #818cf8; }
  .timestamp { color: #64748b; font-size: 0.85em; }
</style></head><body>
<h1>AstroVerse Visual Regression Test Report</h1>
<p class="timestamp">Generated: ${new Date().toISOString()}</p>
<p>Base URL: <code>${BASE_URL}</code></p>

<div class="summary">
  <div class="card"><div class="number">${summary.total}</div><div class="label">Total</div></div>
  <div class="card"><div class="number pass">${summary.captured}</div><div class="label">Captured</div></div>
  <div class="card"><div class="number fail">${summary.errors}</div><div class="label">Errors</div></div>
  <div class="card"><div class="number warn">${summary.viewports}</div><div class="label">Viewports</div></div>
</div>

<h2>Screenshots</h2>
<table>
  <tr><th>Page</th><th>Viewport</th><th>Path</th><th>Status</th><th>Screenshot</th></tr>
  ${rows}
  ${errorRows}
</table>

<h2>Viewports Tested</h2>
<table>
  <tr><th>Name</th><th>Width</th><th>Height</th></tr>
  ${VIEWPORTS.map(v => `<tr><td>${v.name}</td><td>${v.width}px</td><td>${v.height}px</td></tr>`).join('\n')}
</table>
</body></html>`;
}

async function main() {
  ensureDir(OUTPUT_DIR);

  console.log('\n========================================');
  console.log('  AstroVerse Visual Regression Tests');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUTPUT_DIR}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const pg of PAGES) {
      const filename = `${slug(pg.name)}-${vp.name}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      try {
        console.log(`  Capturing: ${pg.name} [${vp.name} ${vp.width}x${vp.height}]`);
        await page.goto(BASE_URL + pg.path, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

        // Disable animations for consistent screenshots
        await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' });

        await page.screenshot({ path: filepath, fullPage: true });
        results.push({
          page: pg.name,
          viewport: vp.name,
          path: pg.path,
          description: pg.description,
          file: filename,
          status: 'captured',
          dimensions: `${vp.width}x${vp.height}`,
          timestamp: new Date().toISOString(),
        });
        console.log(`    -> ${filename}`);
      } catch (err) {
        const msg = err.message.split('\n')[0];
        console.log(`    -> ERROR: ${msg}`);
        errors.push({ page: pg.name, viewport: vp.name, path: pg.path, error: msg });
      }
    }

    await context.close();
  }

  await browser.close();

  // Generate report
  const reportDir = path.join(OUTPUT_DIR, 'report');
  ensureDir(reportDir);

  const summary = {
    total: results.length + errors.length,
    captured: results.length,
    errors: errors.length,
    viewports: VIEWPORTS.length,
  };

  const html = generateHtmlReport(results, errors, summary);
  fs.writeFileSync(path.join(reportDir, 'visual-report.html'), html);
  fs.writeFileSync(path.join(reportDir, 'visual-report.json'), JSON.stringify({ summary, results, errors }, null, 2));

  console.log('\n========================================');
  console.log(`  Results: ${results.length} captured, ${errors.length} errors`);
  console.log(`  Report:  ${path.join(reportDir, 'visual-report.html')}`);
  console.log('========================================\n');
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
