/**
 * Seed: Sample Charts for Demo User
 *
 * Creates sample natal charts for the demo user to showcase
 * the chart viewing and analysis features.
 */

import type { Knex } from 'knex';

const DEMO_CHARTS = [
  {
    name: 'Sarah Mitchell',
    type: 'natal',
    birth_date: '1992-01-14',
    birth_time: '14:42',
    birth_place_name: 'New York, NY, USA',
    birth_latitude: 40.7128,
    birth_longitude: -74.006,
    birth_timezone: 'America/New_York',
    house_system: 'placidus',
    calculated_data: JSON.stringify({
      planets: [
        { name: 'Sun', sign: 'Capricorn', degree: 24, house: 10, retrograde: false },
        { name: 'Moon', sign: 'Pisces', degree: 15, house: 4, retrograde: false },
        { name: 'Mercury', sign: 'Capricorn', degree: 18, house: 10, retrograde: false },
        { name: 'Venus', sign: 'Sagittarius', degree: 22, house: 5, retrograde: false },
        { name: 'Mars', sign: 'Scorpio', degree: 12, house: 4, retrograde: false },
        { name: 'Jupiter', sign: 'Libra', degree: 5, house: 3, retrograde: false },
        { name: 'Saturn', sign: 'Aquarius', degree: 8, house: 11, retrograde: true },
        { name: 'Uranus', sign: 'Capricorn', degree: 16, house: 10, retrograde: false },
        { name: 'Neptune', sign: 'Capricorn', degree: 18, house: 10, retrograde: false },
        { name: 'Pluto', sign: 'Scorpio', degree: 22, house: 4, retrograde: false },
      ],
      ascendant: { sign: 'Aries', degree: 15 },
      midheaven: { sign: 'Capricorn', degree: 10 },
      houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })),
      aspects: [
        { planet1: 'Sun', planet2: 'Moon', type: 'trine', orb: 3.2 },
        { planet1: 'Sun', planet2: 'Mercury', type: 'conjunction', orb: 6.1 },
        { planet1: 'Venus', planet2: 'Jupiter', type: 'sextile', orb: 2.8 },
        { planet1: 'Mars', planet2: 'Pluto', type: 'conjunction', orb: 4.5 },
      ],
    }),
  },
  {
    name: 'James Parker',
    type: 'natal',
    birth_date: '1988-06-21',
    birth_time: '06:30',
    birth_place_name: 'London, UK',
    birth_latitude: 51.5074,
    birth_longitude: -0.1278,
    birth_timezone: 'Europe/London',
    house_system: 'placidus',
    calculated_data: JSON.stringify({
      planets: [
        { name: 'Sun', sign: 'Gemini', degree: 29, house: 1, retrograde: false },
        { name: 'Moon', sign: 'Taurus', degree: 10, house: 12, retrograde: false },
        { name: 'Mercury', sign: 'Cancer', degree: 12, house: 2, retrograde: false },
        { name: 'Venus', sign: 'Leo', degree: 5, house: 3, retrograde: false },
        { name: 'Mars', sign: 'Aquarius', degree: 20, house: 9, retrograde: false },
        { name: 'Jupiter', sign: 'Gemini', degree: 15, house: 1, retrograde: true },
        { name: 'Saturn', sign: 'Sagittarius', degree: 10, house: 7, retrograde: true },
      ],
      ascendant: { sign: 'Gemini', degree: 5 },
      midheaven: { sign: 'Aquarius', degree: 18 },
      houses: Array.from({ length: 12 }, (_, i) => ({ number: i + 1 })),
      aspects: [
        { planet1: 'Sun', planet2: 'Jupiter', type: 'conjunction', orb: 8.1 },
        { planet1: 'Mars', planet2: 'Saturn', type: 'opposition', orb: 5.3 },
        { planet1: 'Moon', planet2: 'Venus', type: 'sextile', orb: 4.7 },
      ],
    }),
  },
];

export async function seed(knex: Knex): Promise<void> {
  const demoUser = await knex('users').where({ email: 'demo@astroverse.app' }).first();
  if (!demoUser) {
    // Demo user seed must run first
    return;
  }

  // Check if charts already exist for demo user
  const existingCharts = await knex('charts').where({ user_id: demoUser.id });
  if (existingCharts.length > 0) return;

  const chartRows = DEMO_CHARTS.map((chart) => ({
    ...chart,
    user_id: demoUser.id,
  }));

  await knex('charts').insert(chartRows);
}
