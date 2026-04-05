/**
 * Card Image Generation Service
 * Renders shareable card PNG images using Puppeteer (headless Chrome)
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../../../utils/logger';

export interface CardImageOptions {
  template: string;
  planetPlacements: string[];
  insightText?: string;
  showInsight: boolean;
  cardId: string;
  userId: string;
}

interface TemplateDimensions {
  width: number;
  height: number;
}

const TEMPLATE_DIMENSIONS: Record<string, TemplateDimensions> = {
  instagram_story: { width: 1080, height: 1920 },
  twitter_x: { width: 1200, height: 675 },
  pinterest: { width: 1000, height: 1500 },
  square: { width: 1080, height: 1080 },
  linkedin: { width: 1200, height: 627 },
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  ascendant: '↑',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  north_node: '☊',
  chiron: '⚷',
};

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'cards');

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const userDir = path.join(UPLOADS_DIR);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
}

function buildHtml(opts: CardImageOptions): string {
  const dims = TEMPLATE_DIMENSIONS[opts.template] || TEMPLATE_DIMENSIONS.square;
  const isPortrait = dims.height > dims.width;
  const isWide = dims.width > dims.height;
  const isSquare = dims.width === dims.height;

  const placements = opts.planetPlacements.map(p => ({
    key: p,
    name: p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    symbol: PLANET_SYMBOLS[p] || '★',
  }));

  const insightBlock = opts.showInsight && opts.insightText
    ? `<div class="insight">"${escapeHtml(opts.insightText)}"</div>`
    : '';

  const gridSize = isWide ? 'repeat(5, 1fr)' : isSquare ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${dims.width}px;
    height: ${dims.height}px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #24243e 60%, #0f0c29 100%);
    color: #e8e0f0;
    overflow: hidden;
  }
  .card {
    width: ${dims.width}px;
    height: ${dims.height}px;
    padding: ${isPortrait ? '60' : isWide ? '40' : '50'}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(120, 80, 220, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(80, 160, 255, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(200, 100, 180, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
  .brand {
    font-size: ${isPortrait ? '28' : isWide ? '20' : '24'}px;
    font-weight: 300;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(200, 180, 255, 0.7);
    text-align: center;
  }
  .title {
    font-size: ${isPortrait ? '42' : isWide ? '28' : '36'}px;
    font-weight: 600;
    text-align: center;
    background: linear-gradient(90deg, #c8b6ff, #e8d5f5, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: ${isPortrait ? '30' : '15'}px 0;
  }
  .subtitle {
    text-align: center;
    font-size: ${isPortrait ? '20' : isWide ? '14' : '18'}px;
    color: rgba(200, 180, 255, 0.5);
    margin-bottom: ${isPortrait ? '30' : '15'}px;
  }
  .placements {
    display: grid;
    grid-template-columns: ${gridSize};
    gap: ${isPortrait ? '24' : '16'}px;
    flex: 1;
    align-content: center;
    justify-items: center;
  }
  .placement {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .placement .symbol {
    font-size: ${isPortrait ? '52' : isWide ? '36' : '44'}px;
    color: #c8b6ff;
    text-shadow: 0 0 20px rgba(168, 130, 255, 0.4);
  }
  .placement .name {
    font-size: ${isPortrait ? '16' : isWide ? '13' : '15'}px;
    color: rgba(200, 180, 255, 0.7);
    text-transform: capitalize;
  }
  .insight {
    text-align: center;
    font-size: ${isPortrait ? '22' : isWide ? '16' : '20'}px;
    font-style: italic;
    color: rgba(200, 180, 255, 0.6);
    padding: ${isPortrait ? '30' : '15'}px 0;
    line-height: 1.5;
    max-width: 80%;
    margin: 0 auto;
  }
  .footer {
    text-align: center;
    font-size: ${isPortrait ? '14' : '12'}px;
    color: rgba(200, 180, 255, 0.3);
    padding-top: 10px;
  }
</style>
</head>
<body>
<div class="card">
  <div>
    <div class="brand">AstroVerse</div>
    <div class="title">My Cosmic Blueprint</div>
    <div class="subtitle">Natal Chart Card</div>
  </div>
  <div class="placements">
    ${placements.map(p => `
    <div class="placement">
      <div class="symbol">${p.symbol}</div>
      <div class="name">${p.name}</div>
    </div>`).join('')}
  </div>
  ${insightBlock}
  <div class="footer">Generated by AstroVerse ✦ Discover your cosmic blueprint</div>
</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class CardImageService {
  /**
   * Generate a PNG image for a shareable card.
   * Returns the relative URL path and image dimensions.
   */
  async generateImage(opts: CardImageOptions): Promise<{
    imageUrl: string;
    width: number;
    height: number;
  } | null> {
    let page: Page | null = null;

    try {
      ensureUploadsDir();

      const dims = TEMPLATE_DIMENSIONS[opts.template] || TEMPLATE_DIMENSIONS.square;
      const html = buildHtml(opts);

      const browser = await getBrowser();
      page = await browser.newPage();

      await page.setViewport({ width: dims.width, height: dims.height, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: dims.width, height: dims.height },
      });

      // Store to uploads/cards/{userId}/{cardId}.png
      const userDir = path.join(UPLOADS_DIR, opts.userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const filePath = path.join(userDir, `${opts.cardId}.png`);
      fs.writeFileSync(filePath, screenshot);

      const imageUrl = `/uploads/cards/${opts.userId}/${opts.cardId}.png`;

      logger.info('Card image generated', {
        cardId: opts.cardId,
        template: opts.template,
        size: screenshot.length,
      });

      return {
        imageUrl,
        width: dims.width,
        height: dims.height,
      };
    } catch (error) {
      logger.error('Failed to generate card image', {
        cardId: opts.cardId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }
}

export const cardImageService = new CardImageService();
export default CardImageService;
