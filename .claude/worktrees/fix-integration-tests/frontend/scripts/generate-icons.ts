/**
 * PWA Icon Generator
 * Generates all required PWA icons from a single source
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_SVG = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

interface IconSize {
  name: string;
  size: number;
  type: 'png' | 'svg';
}

const ICONS: IconSize[] = [
  { name: 'pwa-192x192.png', size: 192, type: 'png' },
  { name: 'pwa-512x512.png', size: 512, type: 'png' },
  { name: 'favicon.ico', size: 48, type: 'png' }, // Will convert to ico
  { name: 'apple-touch-icon.png', size: 180, type: 'png' },
];

async function generateIcons(): Promise<void> {
  console.log('🎨 Generating PWA icons...');

  // Check if source SVG exists
  try {
    await fs.access(SOURCE_SVG);
  } catch {
    console.error('❌ Source logo.svg not found. Please create it first.');
    console.log('📍 Expected location:', SOURCE_SVG);
    process.exit(1);
  }

  // Generate each icon
  for (const icon of ICONS) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);

    await sharp(SOURCE_SVG)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Copy mask-icon.svg (just use logo.svg)
  const maskIconPath = path.join(OUTPUT_DIR, 'mask-icon.svg');
  await fs.copyFile(SOURCE_SVG, maskIconPath);
  console.log('✅ Generated mask-icon.svg');

  console.log('🎉 All PWA icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
