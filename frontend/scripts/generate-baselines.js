/**
 * Visual Test Baseline Generation Script
 *
 * @description Generates baseline snapshots for visual regression testing
 * Run with: node scripts/generate-baselines.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VISUAL_CONFIG = path.join(PROJECT_ROOT, 'tests/visual/playwright.visual.config.ts');
const SNAPSHOTS_DIR = path.join(PROJECT_ROOT, 'tests/visual/snapshots');

console.log('🖼️  Visual Regression Test - Baseline Generation');
console.log('================================================\n');

// Check if Playwright is installed
try {
  execSync('npx playwright --version', { stdio: 'ignore' });
  console.log('✅ Playwright is installed');
} catch (error) {
  console.error('❌ Playwright is not installed. Run: npm install -D @playwright/test');
  process.exit(1);
}

// Create snapshots directory if it doesn't exist
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  console.log('📁 Created snapshots directory');
}

// Run visual tests with update snapshots flag
console.log('\n📸 Generating baseline snapshots...\n');

const command = `npx playwright test --config="${VISUAL_CONFIG}" --update-snapshots`;

try {
  execSync(command, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      CI: 'true', // Ensures consistent behavior
    },
  });

  console.log('\n✅ Baseline snapshots generated successfully!');
  console.log(`📁 Snapshots saved to: ${SNAPSHOTS_DIR}`);
  console.log('\nNext steps:');
  console.log('  1. Review the generated snapshots');
  console.log('  2. Commit them to the repository');
  console.log('  3. Run visual tests: npm run test:visual');

} catch (error) {
  console.error('\n❌ Failed to generate baseline snapshots');
  console.error('Error:', error.message);
  process.exit(1);
}
