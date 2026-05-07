/**
 * Seed: Calendar Events for Current Year
 *
 * Generates global astrological events (moon phases, retrogrades,
 * eclipses, solstices, equinoxes) for the current year.
 * These are NOT user-specific — they appear for all users.
 */

import type { Knex } from 'knex';

function getYearDates(year: number) {
  const events: Array<{
    event_type: string;
    event_date: string;
    end_date: string | null;
    event_data: string;
    interpretation: string;
  }> = [];

  // Full moons 2026 (approximate dates)
  const fullMoons = [
    '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-01', '2026-05-01',
    '2026-05-30', '2026-06-29', '2026-07-29', '2026-08-27', '2026-09-26',
    '2026-10-26', '2026-11-24', '2026-12-24',
  ];

  fullMoons.forEach((date, i) => {
    events.push({
      event_type: 'full_moon',
      event_date: `${date}T18:00:00Z`,
      end_date: null,
      event_data: JSON.stringify({ moonPhase: 'Full Moon', month: i + 1 }),
      interpretation: 'Full Moon — a time of culmination, revelation, and completion. Energy peaks, illuminating what was hidden.',
    });
  });

  // New moons 2026 (approximate dates)
  const newMoons = [
    '2026-01-18', '2026-02-17', '2026-03-19', '2026-04-17', '2026-05-16',
    '2026-06-15', '2026-07-14', '2026-08-12', '2026-09-11', '2026-10-10',
    '2026-11-09', '2026-12-09',
  ];

  newMoons.forEach((date, i) => {
    events.push({
      event_type: 'new_moon',
      event_date: `${date}T12:00:00Z`,
      end_date: null,
      event_data: JSON.stringify({ moonPhase: 'New Moon', month: i + 1 }),
      interpretation: 'New Moon — a time of new beginnings and setting intentions. Plant the seeds for what you want to grow.',
    });
  });

  // Mercury retrogrades 2026
  events.push(
    {
      event_type: 'mercury_retrograde',
      event_date: '2026-03-15T00:00:00Z',
      end_date: '2026-04-07T00:00:00Z',
      event_data: JSON.stringify({ planet: 'Mercury', retrogradeIn: 'Aries/Pisces' }),
      interpretation: 'Mercury Retrograde in Aries/Pisces — review communications, avoid signing contracts, double-check details.',
    },
    {
      event_type: 'mercury_retrograde',
      event_date: '2026-07-18T00:00:00Z',
      end_date: '2026-08-11T00:00:00Z',
      event_data: JSON.stringify({ planet: 'Mercury', retrogradeIn: 'Leo' }),
      interpretation: 'Mercury Retrograde in Leo — revisit creative projects, reconnect with past collaborators.',
    },
    {
      event_type: 'mercury_retrograde',
      event_date: '2026-11-10T00:00:00Z',
      end_date: '2026-11-29T00:00:00Z',
      event_data: JSON.stringify({ planet: 'Mercury', retrogradeIn: 'Sagittarius' }),
      interpretation: 'Mercury Retrograde in Sagittarius — reassess travel plans, review beliefs and philosophical outlook.',
    },
  );

  // Solstices and equinoxes
  events.push(
    {
      event_type: 'equinox',
      event_date: '2026-03-20T14:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Vernal Equinox', season: 'Spring' }),
      interpretation: 'Vernal Equinox — day and night are equal. A powerful time of balance and fresh starts.',
    },
    {
      event_type: 'solstice',
      event_date: '2026-06-21T10:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Summer Solstice', season: 'Summer' }),
      interpretation: 'Summer Solstice — the longest day. Peak solar energy, celebration of light and vitality.',
    },
    {
      event_type: 'equinox',
      event_date: '2026-09-22T20:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Autumnal Equinox', season: 'Autumn' }),
      interpretation: 'Autumnal Equinox — balance of light and dark. Time for gratitude and harvest reflection.',
    },
    {
      event_type: 'solstice',
      event_date: '2026-12-21T16:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Winter Solstice', season: 'Winter' }),
      interpretation: 'Winter Solstice — the longest night. A time for introspection and planting seeds for the coming year.',
    },
  );

  // Eclipses 2026
  events.push(
    {
      event_type: 'solar_eclipse',
      event_date: '2026-02-17T12:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Annular', visibleFrom: 'South America/Africa' }),
      interpretation: 'Solar Eclipse — a powerful new beginning. Major life shifts and fresh starts in the houses affected.',
    },
    {
      event_type: 'lunar_eclipse',
      event_date: '2026-03-03T18:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Total', visibleFrom: 'Americas/Europe' }),
      interpretation: 'Lunar Eclipse — culminations and revelations. Emotional shifts and turning points.',
    },
    {
      event_type: 'solar_eclipse',
      event_date: '2026-08-12T12:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Total', visibleFrom: 'Arctic/N. Europe' }),
      interpretation: 'Solar Eclipse — transformative new chapter. Significant changes in identity and direction.',
    },
    {
      event_type: 'lunar_eclipse',
      event_date: '2026-08-27T18:00:00Z',
      end_date: null,
      event_data: JSON.stringify({ type: 'Partial', visibleFrom: 'S. America/Europe/Africa' }),
      interpretation: 'Lunar Eclipse — emotional completions and realizations. Release what no longer serves you.',
    },
  );

  return events;
}

export async function seed(knex: Knex): Promise<void> {
  // Only seed calendar events for the current year
  // Check if events already exist
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const existing = await knex('calendar_events')
    .whereNull('user_id')
    .where('event_date', '>=', yearStart)
    .first();

  if (existing) return;

  const events = getYearDates(currentYear);

  // Global events have no user_id
  const rows = events.map((e) => ({
    ...e,
    user_id: null,
  }));

  // Insert in batches of 10 to avoid query size issues
  for (let i = 0; i < rows.length; i += 10) {
    await knex('calendar_events').insert(rows.slice(i, i + 10));
  }
}
