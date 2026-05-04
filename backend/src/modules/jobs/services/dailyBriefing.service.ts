/**
 * Daily Cosmic Briefing Service
 *
 * Generates personalized daily briefings containing:
 * - Current moon phase
 * - Top 3 active transits for the user
 * - Daily theme/affirmation
 * - Planetary highlight
 *
 * CHI-68: Implement Daily Cosmic Briefing (morning digest)
 */

import logger from '../../../utils/logger';
import { calculateMoonPhase } from '../../calendar/services/calendar.service';
import AstronomyEngineService from '../../shared/services/astronomyEngine.service';

const astronomyEngine = new AstronomyEngineService();
import knex from '../../../config/database';
import pushNotificationService from '../../notifications/services/pushNotification.service';

// ---- Types ----

export interface DailyBriefing {
  userId: string;
  date: string;
  moonPhase: {
    phase: string;
    sign: string;
    illumination: number;
  };
  topTransits: Array<{
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    interpretation: string;
  }>;
  dailyTheme: string;
  affirmation: string;
  planetaryHighlight: {
    planet: string;
    sign: string;
    message: string;
  };
}

export interface BriefingContent {
  title: string;
  summary: string;
  pushBody: string;
  emailHtml: string;
}

// ---- Planet & Theme Mappings ----

const PLANET_THEMES: Record<string, string> = {
  sun: 'identity and vitality',
  moon: 'emotions and intuition',
  mercury: 'communication and thought',
  venus: 'love and beauty',
  mars: 'energy and action',
  jupiter: 'growth and opportunity',
  saturn: 'discipline and structure',
  uranus: 'innovation and change',
  neptune: 'imagination and spirituality',
  pluto: 'transformation and power',
};

const DAILY_AFFIRMATIONS: Record<string, string[]> = {
  new: [
    'Today is a fresh start. Set your intentions clearly.',
    'New beginnings are favored. Plant the seeds of what you want to grow.',
  ],
  'waxing-crescent': [
    'Your intentions are taking root. Nurture them with patience.',
    'Building momentum. Focus on one step at a time.',
  ],
  'first-quarter': [
    'Challenges test your resolve. Stay the course.',
    'Adjust and refine. The first draft is never the final one.',
  ],
  'waxing-gibbous': [
    'Almost there. Refine your approach before the full moon.',
    'Your efforts are ripening. Stay focused on what matters.',
  ],
  full: [
    "Peak illumination. Celebrate how far you've come.",
    'What has been illuminated? Acknowledge your growth.',
  ],
  'waning-gibbous': [
    "Begin integrating what you've learned. Share your wisdom.",
    'Gratitude opens doors. Count your blessings today.',
  ],
  'last-quarter': [
    'Let go of what no longer serves you. Release with grace.',
    'A turning point. Adjust your course with new clarity.',
  ],
  'waning-crescent': [
    'Rest and restore. Surrender what you cannot control.',
    'Stillness speaks. Listen to the quiet wisdom within.',
  ],
};

const TRANSIT_INTERPRETATIONS: Record<string, string> = {
  conjunction: 'This transit amplifies and focuses energy directly.',
  opposition: 'This transit creates tension that demands balance and awareness.',
  trine: 'This transit flows naturally — a gift of ease and harmony.',
  square: 'This transit challenges you to grow through friction and effort.',
  sextile: 'This transit offers opportunities if you take initiative.',
  quincunx: 'This transit asks for adjustment — a subtle but important shift.',
};

// ---- Core Functions ----

/**
 * Generate a daily cosmic briefing for a user
 */
export async function generateBriefing(userId: string, dateStr?: string): Promise<DailyBriefing> {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const dateISO = targetDate.toISOString().split('T')[0];

  // 1. Fetch user's natal chart
  const chart = await knex('charts')
    .where({ user_id: userId, type: 'natal' })
    .orderBy('created_at', 'desc')
    .first();

  if (!chart) {
    throw new Error(`No natal chart found for user ${userId}`);
  }

  // 2. Moon phase
  const moonPhase = calculateMoonPhase(targetDate);

  // 3. Calculate current transits
  const natalPlanets = (chart.calculated_data as Record<string, unknown>)?.planets as
    | Record<string, { longitude: number }>
    | undefined;
  const topTransits = await calculateTopTransits(
    natalPlanets,
    chart.birth_latitude,
    chart.birth_longitude,
    targetDate,
  );

  // 4. Daily theme & affirmation
  const moonPhaseKey = moonPhase.phase;
  const affirmationOptions = DAILY_AFFIRMATIONS[moonPhaseKey] || DAILY_AFFIRMATIONS['new'];
  const affirmationIndex =
    dateISO.split('-').reduce((acc, d) => acc + parseInt(d, 10), 0) % affirmationOptions.length;
  const dailyTheme = deriveDailyTheme(topTransits, moonPhase.phase);
  const affirmation = affirmationOptions[affirmationIndex];

  // 5. Planetary highlight — planet making the tightest aspect
  const planetaryHighlight = derivePlanetaryHighlight(topTransits, targetDate);

  const briefing: DailyBriefing = {
    userId,
    date: dateISO,
    moonPhase: {
      phase: moonPhase.phase,
      sign: moonPhase.sign,
      illumination: moonPhase.illumination,
    },
    topTransits,
    dailyTheme,
    affirmation,
    planetaryHighlight,
  };

  return briefing;
}

/**
 * Format briefing for different delivery channels
 */
export function formatBriefingContent(briefing: DailyBriefing): BriefingContent {
  const dateFormatted = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const transitLines = briefing.topTransits
    .map(
      (t, i) =>
        `${i + 1}. ${capitalize(t.transitPlanet)} ${t.aspect} ${capitalize(t.natalPlanet)} (${t.orb}° orb) — ${t.interpretation}`,
    )
    .join('\n');

  const title = `Your Cosmic Briefing — ${dateFormatted}`;

  const summary = [
    `🌙 Moon: ${capitalize(briefing.moonPhase.phase)} in ${capitalize(briefing.moonPhase.sign)} (${briefing.moonPhase.illumination}% illuminated)`,
    `⭐ Highlight: ${capitalize(briefing.planetaryHighlight.planet)} in ${capitalize(briefing.planetaryHighlight.sign)} — ${briefing.planetaryHighlight.message}`,
    '',
    `Theme: ${briefing.dailyTheme}`,
    '',
    `"${briefing.affirmation}"`,
    '',
    'Active Transits:',
    transitLines,
  ].join('\n');

  const pushBody = `${capitalize(briefing.moonPhase.phase)} Moon in ${capitalize(briefing.moonPhase.sign)} • ${briefing.dailyTheme}`;

  const emailHtml = buildEmailHtml(briefing, title, dateFormatted, transitLines);

  return { title, summary, pushBody, emailHtml };
}

/**
 * Send briefing via push notification
 */
export async function sendBriefingPush(userId: string, content: BriefingContent): Promise<void> {
  try {
    await pushNotificationService.sendNotification(userId, {
      title: content.title,
      body: content.pushBody,
      data: { type: 'daily-briefing', date: new Date().toISOString().split('T')[0] },
    });
    logger.info(`[Briefing] Push notification sent to user ${userId}`);
  } catch (err) {
    logger.error(
      `[Briefing] Push notification failed for user ${userId}: ${(err as Error).message}`,
    );
  }
}

/**
 * Persist briefing to database for in-app retrieval
 */
export async function saveBriefing(briefing: DailyBriefing): Promise<void> {
  await knex('daily_briefings')
    .insert({
      user_id: briefing.userId,
      date: briefing.date,
      moon_phase: JSON.stringify(briefing.moonPhase),
      top_transits: JSON.stringify(briefing.topTransits),
      daily_theme: briefing.dailyTheme,
      affirmation: briefing.affirmation,
      planetary_highlight: JSON.stringify(briefing.planetaryHighlight),
      created_at: new Date().toISOString(),
    })
    .onConflict(['user_id', 'date'])
    .merge();

  logger.info(`[Briefing] Saved briefing for user ${briefing.userId} on ${briefing.date}`);
}

/**
 * Get the latest briefing for a user (for in-app display)
 */
export async function getLatestBriefing(userId: string): Promise<DailyBriefing | null> {
  const row = await knex('daily_briefings')
    .where({ user_id: userId })
    .orderBy('date', 'desc')
    .first();

  if (!row) return null;

  return {
    userId: row.user_id,
    date: row.date,
    moonPhase: JSON.parse(row.moon_phase),
    topTransits: JSON.parse(row.top_transits),
    dailyTheme: row.daily_theme,
    affirmation: row.affirmation,
    planetaryHighlight: JSON.parse(row.planetary_highlight),
  };
}

// ---- Internal Helpers ----

async function calculateTopTransits(
  natalPlanets: Record<string, { longitude: number }> | undefined,
  latitude: number,
  longitude: number,
  date: Date,
): Promise<DailyBriefing['topTransits']> {
  if (!natalPlanets || Object.keys(natalPlanets).length === 0) {
    return [];
  }

  // Get current planetary positions via astronomy engine
  const transitPositions = astronomyEngine.calculatePlanetaryPositions(date, latitude, longitude);

  const aspects: DailyBriefing['topTransits'] = [];

  const ASPECT_ANGLES: Record<string, { angle: number; orb: number }> = {
    conjunction: { angle: 0, orb: 10 },
    opposition: { angle: 180, orb: 8 },
    trine: { angle: 120, orb: 8 },
    square: { angle: 90, orb: 8 },
    sextile: { angle: 60, orb: 6 },
    quincunx: { angle: 150, orb: 3 },
  };

  for (const [natalName, natalPos] of Object.entries(natalPlanets)) {
    if (typeof natalPos?.longitude !== 'number') continue;

    for (const [transitName, transitPos] of transitPositions.entries()) {
      if (!transitPos?.longitude) continue;

      const diff = Math.abs(natalPos.longitude - transitPos.longitude);
      const dist = diff > 180 ? 360 - diff : diff;

      for (const [aspectType, config] of Object.entries(ASPECT_ANGLES)) {
        const deviation = Math.abs(dist - config.angle);
        if (deviation <= config.orb) {
          aspects.push({
            transitPlanet: transitName.toLowerCase(),
            natalPlanet: natalName.toLowerCase(),
            aspect: aspectType,
            orb: Math.round(deviation * 100) / 100,
            interpretation:
              TRANSIT_INTERPRETATIONS[aspectType] || `This ${aspectType} brings focused energy.`,
          });
          break;
        }
      }
    }
  }

  // Sort by tightest orb (most precise aspect first) and take top 3
  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 3);
}

function deriveDailyTheme(transits: DailyBriefing['topTransits'], moonPhase: string): string {
  if (transits.length === 0) {
    return `A day of ${moonPhase === 'full' ? 'illumination and clarity' : 'quiet reflection'}.`;
  }

  // Weight themes from the tightest transit
  const primary = transits[0];
  const theme = PLANET_THEMES[primary.transitPlanet] || 'personal growth';
  const aspectFlavor =
    primary.aspect === 'trine' || primary.aspect === 'sextile'
      ? 'harmonious flow'
      : primary.aspect === 'square' || primary.aspect === 'opposition'
        ? 'transformative challenge'
        : 'focused energy';

  return `A day of ${theme} — ${aspectFlavor} is highlighted by ${capitalize(primary.transitPlanet)} ${primary.aspect} ${capitalize(primary.natalPlanet)}.`;
}

function derivePlanetaryHighlight(
  transits: DailyBriefing['topTransits'],
  _date: Date,
): DailyBriefing['planetaryHighlight'] {
  if (transits.length === 0) {
    return { planet: 'moon', sign: 'pisces', message: 'Trust your intuition today.' };
  }

  const primary = transits[0];
  // Get the transiting planet's sign from its natal chart position
  // For now use a simple default since we don't have transit sign data
  const signMessages: Record<string, string> = {
    sun: 'Your vitality and sense of self are activated.',
    moon: 'Pay attention to your emotional needs today.',
    mercury: 'Communication is highlighted — express yourself clearly.',
    venus: 'Love, beauty, and pleasure are emphasized.',
    mars: 'Channel your energy purposefully today.',
    jupiter: 'Expansion and optimism are favored.',
    saturn: 'Structure and responsibility call for attention.',
    uranus: 'Expect the unexpected — innovation is possible.',
    neptune: 'Creativity and spiritual awareness are heightened.',
    pluto: 'Deep transformation is underway — embrace the change.',
  };

  return {
    planet: primary.transitPlanet,
    sign: 'aries', // Simplified — would need transit chart data for actual sign
    message:
      signMessages[primary.transitPlanet] || 'This planet brings focused energy to your day.',
  };
}

function buildEmailHtml(
  briefing: DailyBriefing,
  title: string,
  dateFormatted: string,
  _transitLines: string,
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #2d1b69 0%, #1a1a2e 100%); border-radius: 16px; padding: 32px; }
    h1 { color: #9c6ade; font-size: 22px; margin-bottom: 4px; }
    .date { color: #888; font-size: 14px; margin-bottom: 24px; }
    .moon { background: rgba(156,106,222,0.1); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .moon-phase { font-size: 28px; }
    .section-title { color: #6b3de1; font-size: 16px; margin: 20px 0 10px; border-bottom: 1px solid #6b3de1; padding-bottom: 4px; }
    .transit { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .transit-planet { color: #9c6ade; font-weight: 600; }
    .highlight { background: linear-gradient(135deg, #6b3de1,0%, #9c6ade 100%); color: white; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    .affirmation { font-style: italic; color: #c0b0d0; text-align: center; padding: 16px; font-size: 15px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    <p class="date">${escapeHtml(dateFormatted)}</p>

    <div class="moon">
      <span class="moon-phase">${getMoonEmoji(briefing.moonPhase.phase)}</span>
      <strong>${escapeHtml(capitalize(briefing.moonPhase.phase))} Moon</strong> in ${escapeHtml(capitalize(briefing.moonPhase.sign))}
      <br><small>${briefing.moonPhase.illumination}% illuminated</small>
    </div>

    <div class="highlight">
      <strong>${getMoonEmoji(briefing.moonPhase.phase)} Planetary Highlight</strong><br>
      ${escapeHtml(capitalize(briefing.planetaryHighlight.planet))}: ${escapeHtml(briefing.planetaryHighlight.message)}
    </div>

    <h3 class="section-title">Today's Theme</h3>
    <p>${escapeHtml(briefing.dailyTheme)}</p>

    <h3 class="section-title">Active Transits</h3>
    ${briefing.topTransits
      .map(
        (t) => `
      <div class="transit">
        <span class="transit-planet">${escapeHtml(capitalize(t.transitPlanet))}</span> ${escapeHtml(t.aspect)} ${escapeHtml(capitalize(t.natalPlanet))}
        <br><small>${escapeHtml(t.interpretation)} (${t.orb}° orb)</small>
      </div>
    `,
      )
      .join('')}

    <p class="affirmation">"${escapeHtml(briefing.affirmation)}"</p>

    <div class="footer">
      <p>Generated by AstroVerse &bull; <a href="https://astroverse.app" style="color:#6b3de1;">astroverse.app</a></p>
      <p>This report is for entertainment purposes only.</p>
    </div>
  </div>
</body>
</html>`;
}

function getMoonEmoji(phase: string): string {
  const emojis: Record<string, string> = {
    new: '🌑',
    'waxing-crescent': '🌒',
    'first-quarter': '🌓',
    'waxing-gibbous': '🌔',
    full: '🌕',
    'waning-gibbous': '🌖',
    'last-quarter': '🌗',
    'waning-crescent': '🌘',
  };
  return emojis[phase] || '🌙';
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default {
  generateBriefing,
  formatBriefingContent,
  sendBriefingPush,
  saveBriefing,
  getLatestBriefing,
};
