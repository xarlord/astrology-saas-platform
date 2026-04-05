/**
 * Calendar Events Seed
 * Seeds global moon phase events and retrograde periods for 2026.
 * user_id is NULL for global astrological events.
 */

import type { Knex } from 'knex';

// 2026 Moon Phases (approximate astronomical dates)
const moonPhases2026 = [
  // New Moons
  { date: '2026-01-19', phase: 'new_moon', sign: 'Capricorn', theme: 'Setting ambitious goals and career intentions' },
  { date: '2026-02-17', phase: 'new_moon', sign: 'Aquarius', theme: 'Innovation, community, and humanitarian visions' },
  { date: '2026-03-19', phase: 'new_moon', sign: 'Pisces', theme: 'Spiritual renewal and creative dreaming' },
  { date: '2026-04-17', phase: 'new_moon', sign: 'Aries', theme: 'Bold new beginnings and self-assertion' },
  { date: '2026-05-17', phase: 'new_moon', sign: 'Taurus', theme: 'Grounding intentions and material stability' },
  { date: '2026-06-15', phase: 'new_moon', sign: 'Gemini', theme: 'Fresh ideas, communication, and learning' },
  { date: '2026-07-15', phase: 'new_moon', sign: 'Cancer', theme: 'Home, family, and emotional security' },
  { date: '2026-08-13', phase: 'new_moon', sign: 'Leo', theme: 'Creative expression and personal joy' },
  { date: '2026-09-12', phase: 'new_moon', sign: 'Virgo', theme: 'Health, organization, and self-improvement' },
  { date: '2026-10-12', phase: 'new_moon', sign: 'Libra', theme: 'Harmony, partnerships, and balance' },
  { date: '2026-11-10', phase: 'new_moon', sign: 'Scorpio', theme: 'Deep transformation and inner power' },
  { date: '2026-12-10', phase: 'new_moon', sign: 'Sagittarius', theme: 'Adventure, philosophy, and expansion' },
  // Full Moons
  { date: '2026-01-03', phase: 'full_moon', sign: 'Cancer', theme: 'Emotional culmination and home matters' },
  { date: '2026-02-04', phase: 'full_moon', sign: 'Leo', theme: 'Creative fulfillment and self-expression' },
  { date: '2026-03-05', phase: 'full_moon', sign: 'Virgo', theme: 'Service, health awareness, and practical insights' },
  { date: '2026-04-04', phase: 'full_moon', sign: 'Libra', theme: 'Relationship clarity and balance' },
  { date: '2026-05-03', phase: 'full_moon', sign: 'Scorpio', theme: 'Deep emotional release and transformation' },
  { date: '2026-06-02', phase: 'full_moon', sign: 'Sagittarius', theme: 'Truth-seeking and expanded awareness' },
  { date: '2026-07-02', phase: 'full_moon', sign: 'Capricorn', theme: 'Career achievements and structural shifts' },
  { date: '2026-08-01', phase: 'full_moon', sign: 'Aquarius', theme: 'Community and collective vision' },
  { date: '2026-08-30', phase: 'full_moon', sign: 'Pisces', theme: 'Spiritual insights and compassion' },
  { date: '2026-09-29', phase: 'full_moon', sign: 'Aries', theme: 'Personal assertion and independence' },
  { date: '2026-10-29', phase: 'full_moon', sign: 'Taurus', theme: 'Material security and value clarity' },
  { date: '2026-11-27', phase: 'full_moon', sign: 'Gemini', theme: 'Communication breakthroughs and insight' },
  { date: '2026-12-27', phase: 'full_moon', sign: 'Cancer', theme: 'Emotional completion and year-end reflection' },
];

// 2026 Retrograde periods
const retrogrades2026 = [
  {
    planet: 'Mercury',
    event_type: 'mercury_retrograde',
    periods: [
      { start: '2026-02-25', end: '2026-03-18', sign: 'Pisces/Aquarius', advice: 'Review contracts, avoid major purchases, backup data' },
      { start: '2026-06-18', end: '2026-07-12', sign: 'Cancer/Gemini', advice: 'Revisit communication, double-check travel plans' },
      { start: '2026-10-15', end: '2026-11-06', sign: 'Scorpio/Libra', advice: 'Reassess partnerships, reflect before signing' },
    ],
  },
  {
    planet: 'Venus',
    event_type: 'venus_retrograde',
    periods: [
      { start: '2026-07-22', end: '2026-09-03', sign: 'Virgo/Leo', advice: 'Re-evaluate relationships, avoid major style changes' },
    ],
  },
  {
    planet: 'Mars',
    event_type: 'mars_retrograde',
    periods: [
      { start: '2026-01-10', end: '2026-03-02', sign: 'Leo/Cancer', advice: 'Conserve energy, avoid starting new conflicts' },
    ],
  },
  {
    planet: 'Jupiter',
    event_type: 'jupiter_retrograde',
    periods: [
      { start: '2026-11-12', end: '2027-03-12', sign: 'Leo', advice: 'Reassess growth plans, revisit philosophical beliefs' },
    ],
  },
  {
    planet: 'Saturn',
    event_type: 'saturn_retrograde',
    periods: [
      { start: '2026-06-08', end: '2026-10-22', sign: 'Aries/Pisces', advice: 'Review responsibilities and long-term commitments' },
    ],
  },
];

// 2026 Eclipses and seasonal events
const specialEvents2026 = [
  {
    event_type: 'solar_eclipse',
    date: '2026-02-17',
    end_date: null,
    data: { sign: 'Aquarius', type: 'Annular', visibility: 'South America, Africa' },
    interpretation: 'Solar eclipse in Aquarius — a powerful reset for community connections and future visions. Set intentions around innovation and collective wellbeing.',
  },
  {
    event_type: 'lunar_eclipse',
    date: '2026-03-05',
    end_date: null,
    data: { sign: 'Virgo', type: 'Penumbral', visibility: 'Americas, Europe, Africa' },
    interpretation: 'Lunar eclipse in Virgo — emotional revelations around health, service, and daily routines. Let go of perfectionism.',
  },
  {
    event_type: 'solar_eclipse',
    date: '2026-08-13',
    end_date: null,
    data: { sign: 'Leo', type: 'Total', visibility: 'Arctic, Europe, Africa' },
    interpretation: 'Total solar eclipse in Leo — a dramatic new chapter in creative self-expression and leadership.',
  },
  {
    event_type: 'lunar_eclipse',
    date: '2026-08-30',
    end_date: null,
    data: { sign: 'Pisces', type: 'Penumbral', visibility: 'Americas, Europe, Africa' },
    interpretation: 'Lunar eclipse in Pisces — deep spiritual completions and emotional releases. Trust your intuition.',
  },
  {
    event_type: 'equinox',
    date: '2026-03-20',
    end_date: null,
    data: { type: 'Vernal (Spring)', hemisphere: 'Northern' },
    interpretation: 'Spring Equinox — day and night are balanced. A time of renewal, fresh starts, and Aries season begins.',
  },
  {
    event_type: 'solstice',
    date: '2026-06-21',
    end_date: null,
    data: { type: 'Summer', hemisphere: 'Northern' },
    interpretation: 'Summer Solstice — the longest day. Peak light energy, celebration, and Cancer season begins.',
  },
  {
    event_type: 'equinox',
    date: '2026-09-22',
    end_date: null,
    data: { type: 'Autumnal', hemisphere: 'Northern' },
    interpretation: 'Autumn Equinox — balance of light and dark. Harvest, gratitude, and Libra season begins.',
  },
  {
    event_type: 'solstice',
    date: '2026-12-21',
    end_date: null,
    data: { type: 'Winter', hemisphere: 'Northern' },
    interpretation: 'Winter Solstice — the longest night. Inner reflection, renewal, and Capricorn season begins.',
  },
];

export async function seed(knex: Knex): Promise<void> {
  // --- Moon Phases ---
  const moonPhaseRows = moonPhases2026.map((mp) => ({
    user_id: null,
    event_type: mp.phase === 'new_moon' ? 'new_moon' : 'full_moon',
    event_date: mp.date,
    end_date: null,
    event_data: JSON.stringify({ sign: mp.sign, phase: mp.phase }),
    interpretation: `${mp.phase === 'new_moon' ? 'New' : 'Full'} Moon in ${mp.sign} — ${mp.theme}.`,
  }));

  await knex('calendar_events').insert(moonPhaseRows).onConflict(['id']).ignore();

  // --- Retrograde Periods ---
  for (const retro of retrogrades2026) {
    for (const period of retro.periods) {
      await knex('calendar_events').insert({
        user_id: null,
        event_type: retro.event_type,
        event_date: period.start,
        end_date: period.end,
        event_data: JSON.stringify({ planet: retro.planet, sign: period.sign }),
        interpretation: `${retro.planet} Retrograde in ${period.sign} (${period.start} – ${period.end}). ${period.advice}.`,
      }).onConflict(['id']).ignore();
    }
  }

  // --- Eclipses & Seasonal Events ---
  for (const event of specialEvents2026) {
    await knex('calendar_events').insert({
      user_id: null,
      event_type: event.event_type,
      event_date: event.date,
      end_date: event.end_date,
      event_data: JSON.stringify(event.data),
      interpretation: event.interpretation,
    }).onConflict(['id']).ignore();
  }
}
