/**
 * Demo User & Sample Charts Seed
 * Creates demo accounts and sample natal chart data for onboarding demonstration.
 */

import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

// Demo user IDs (deterministic for foreign key references)
const DEMO_USER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const DEMO_USER2_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

// Chart IDs
const CHART1_ID = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f';
const CHART2_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';
const CHART3_ID = 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b';
const CHART4_ID = 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c';

export async function seed(knex: Knex): Promise<void> {
  // --- Demo Users ---
  const demoPasswordHash = await bcrypt.hash('Demo1234!', 10);
  const demo2PasswordHash = await bcrypt.hash('Demo5678!', 10);

  await knex('users').insert([
    {
      id: DEMO_USER_ID,
      name: 'Luna Starweaver',
      email: 'demo@astroverse.app',
      password_hash: demoPasswordHash,
      avatar_url: null,
      timezone: 'America/New_York',
      plan: 'premium',
      subscription_status: 'active',
      subscription_renews_at: '2026-05-01T00:00:00Z',
      preferences: JSON.stringify({
        notifications: true,
        dailyBriefing: true,
        theme: 'cosmic',
      }),
    },
    {
      id: DEMO_USER2_ID,
      name: 'Orion Nightsky',
      email: 'demo2@astroverse.app',
      password_hash: demo2PasswordHash,
      avatar_url: null,
      timezone: 'America/Los_Angeles',
      plan: 'free',
      subscription_status: 'active',
      preferences: JSON.stringify({
        notifications: false,
        dailyBriefing: false,
      }),
    },
  ]).onConflict('email').ignore();

  // --- Sample Charts ---
  await knex('charts').insert([
    // Luna's natal chart (Aries Sun, Leo Moon, Sagittarius Rising)
    {
      id: CHART1_ID,
      user_id: DEMO_USER_ID,
      name: 'My Birth Chart',
      type: 'natal',
      birth_date: '1990-04-05',
      birth_time: '14:30:00',
      birth_time_unknown: false,
      birth_place_name: 'New York, NY, USA',
      birth_latitude: 40.712776,
      birth_longitude: -74.005974,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
      calculated_data: JSON.stringify({
        planets: {
          sun: { sign: 'Aries', degree: 15.3, house: 4 },
          moon: { sign: 'Leo', degree: 22.1, house: 8 },
          mercury: { sign: 'Pisces', degree: 28.7, house: 3 },
          venus: { sign: 'Taurus', degree: 10.5, house: 5 },
          mars: { sign: 'Gemini', degree: 5.2, house: 6 },
          jupiter: { sign: 'Cancer', degree: 18.9, house: 7 },
          saturn: { sign: 'Capricorn', degree: 24.6, house: 1 },
          uranus: { sign: 'Capricorn', degree: 9.3, house: 1 },
          neptune: { sign: 'Capricorn', degree: 14.1, house: 1 },
          pluto: { sign: 'Scorpio', degree: 19.8, house: 11 },
          north_node: { sign: 'Aquarius', degree: 7.4, house: 2 },
          chiron: { sign: 'Cancer', degree: 3.2, house: 7 },
        },
        houses: {
          1: { sign: 'Sagittarius', degree: 0 },
          2: { sign: 'Capricorn', degree: 0 },
          3: { sign: 'Aquarius', degree: 0 },
          4: { sign: 'Pisces', degree: 0 },
          5: { sign: 'Aries', degree: 0 },
          6: { sign: 'Taurus', degree: 0 },
          7: { sign: 'Gemini', degree: 0 },
          8: { sign: 'Cancer', degree: 0 },
          9: { sign: 'Leo', degree: 0 },
          10: { sign: 'Virgo', degree: 0 },
          11: { sign: 'Libra', degree: 0 },
          12: { sign: 'Scorpio', degree: 0 },
        },
        aspects: [
          { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 1.8 },
          { planet1: 'sun', planet2: 'jupiter', type: 'sextile', orb: 3.6 },
          { planet1: 'moon', planet2: 'venus', type: 'sextile', orb: 5.2 },
          { planet1: 'mercury', planet2: 'mars', type: 'square', orb: 2.1 },
          { planet1: 'venus', planet2: 'pluto', type: 'opposition', orb: 4.3 },
        ],
        ascendant: { sign: 'Sagittarius', degree: 12.5 },
        midheaven: { sign: 'Virgo', degree: 8.3 },
      }),
    },
    // Luna's partner chart
    {
      id: CHART2_ID,
      user_id: DEMO_USER_ID,
      name: 'Partner Birth Chart',
      type: 'natal',
      birth_date: '1988-08-15',
      birth_time: '09:00:00',
      birth_time_unknown: false,
      birth_place_name: 'Los Angeles, CA, USA',
      birth_latitude: 34.052235,
      birth_longitude: -118.243683,
      birth_timezone: 'America/Los_Angeles',
      house_system: 'placidus',
      zodiac: 'tropical',
      calculated_data: JSON.stringify({
        planets: {
          sun: { sign: 'Leo', degree: 22.4, house: 11 },
          moon: { sign: 'Pisces', degree: 8.6, house: 5 },
          mercury: { sign: 'Virgo', degree: 5.1, house: 12 },
          venus: { sign: 'Cancer', degree: 17.3, house: 9 },
          mars: { sign: 'Aries', degree: 29.8, house: 7 },
          jupiter: { sign: 'Gemini', degree: 12.4, house: 8 },
          saturn: { sign: 'Sagittarius', degree: 20.7, house: 3 },
          uranus: { sign: 'Sagittarius', degree: 25.1, house: 3 },
          neptune: { sign: 'Capricorn', degree: 6.9, house: 4 },
          pluto: { sign: 'Scorpio', degree: 11.2, house: 2 },
          north_node: { sign: 'Pisces', degree: 14.5, house: 5 },
          chiron: { sign: 'Gemini', degree: 22.8, house: 8 },
        },
        houses: {
          1: { sign: 'Taurus', degree: 0 },
          2: { sign: 'Gemini', degree: 0 },
          3: { sign: 'Cancer', degree: 0 },
          4: { sign: 'Leo', degree: 0 },
          5: { sign: 'Virgo', degree: 0 },
          6: { sign: 'Libra', degree: 0 },
          7: { sign: 'Scorpio', degree: 0 },
          8: { sign: 'Sagittarius', degree: 0 },
          9: { sign: 'Capricorn', degree: 0 },
          10: { sign: 'Aquarius', degree: 0 },
          11: { sign: 'Pisces', degree: 0 },
          12: { sign: 'Aries', degree: 0 },
        },
        aspects: [
          { planet1: 'sun', planet2: 'mars', type: 'trine', orb: 2.4 },
          { planet1: 'moon', planet2: 'neptune', type: 'conjunction', orb: 1.7 },
          { planet1: 'venus', planet2: 'jupiter', type: 'sextile', orb: 4.9 },
        ],
        ascendant: { sign: 'Taurus', degree: 18.2 },
        midheaven: { sign: 'Aquarius', degree: 5.7 },
      }),
    },
    // Orion's natal chart
    {
      id: CHART3_ID,
      user_id: DEMO_USER2_ID,
      name: 'My Birth Chart',
      type: 'natal',
      birth_date: '1995-01-20',
      birth_time: '06:15:00',
      birth_time_unknown: false,
      birth_place_name: 'San Francisco, CA, USA',
      birth_latitude: 37.774929,
      birth_longitude: -122.419418,
      birth_timezone: 'America/Los_Angeles',
      house_system: 'placidus',
      zodiac: 'tropical',
      calculated_data: JSON.stringify({
        planets: {
          sun: { sign: 'Aquarius', degree: 0.2, house: 12 },
          moon: { sign: 'Scorpio', degree: 15.8, house: 9 },
          mercury: { sign: 'Capricorn', degree: 12.4, house: 11 },
          venus: { sign: 'Pisces', degree: 20.6, house: 1 },
          mars: { sign: 'Virgo', degree: 8.3, house: 7 },
          jupiter: { sign: 'Sagittarius', degree: 25.1, house: 10 },
          saturn: { sign: 'Pisces', degree: 3.7, house: 1 },
          uranus: { sign: 'Capricorn', degree: 28.9, house: 11 },
          neptune: { sign: 'Capricorn', degree: 24.2, house: 11 },
          pluto: { sign: 'Scorpio', degree: 28.6, house: 9 },
          north_node: { sign: 'Scorpio', degree: 11.3, house: 8 },
          chiron: { sign: 'Virgo', degree: 16.5, house: 7 },
        },
        houses: {
          1: { sign: 'Pisces', degree: 0 },
          2: { sign: 'Aries', degree: 0 },
          3: { sign: 'Taurus', degree: 0 },
          4: { sign: 'Gemini', degree: 0 },
          5: { sign: 'Cancer', degree: 0 },
          6: { sign: 'Leo', degree: 0 },
          7: { sign: 'Virgo', degree: 0 },
          8: { sign: 'Libra', degree: 0 },
          9: { sign: 'Scorpio', degree: 0 },
          10: { sign: 'Sagittarius', degree: 0 },
          11: { sign: 'Capricorn', degree: 0 },
          12: { sign: 'Aquarius', degree: 0 },
        },
        aspects: [
          { planet1: 'sun', planet2: 'venus', type: 'conjunction', orb: 5.6 },
          { planet1: 'moon', planet2: 'mars', type: 'opposition', orb: 3.5 },
          { planet1: 'mercury', planet2: 'uranus', type: 'conjunction', orb: 1.3 },
        ],
        ascendant: { sign: 'Pisces', degree: 22.4 },
        midheaven: { sign: 'Sagittarius', degree: 14.1 },
      }),
    },
    // Luna's transit chart
    {
      id: CHART4_ID,
      user_id: DEMO_USER_ID,
      name: 'Current Transits',
      type: 'transit',
      birth_date: '1990-04-05',
      birth_time: '14:30:00',
      birth_time_unknown: false,
      birth_place_name: 'New York, NY, USA',
      birth_latitude: 40.712776,
      birth_longitude: -74.005974,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
      calculated_data: JSON.stringify({
        transitDate: '2026-04-05T00:00:00Z',
        activeTransits: [
          { transitingPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'square', orb: 2.1, theme: 'Career pressure and responsibility' },
          { transitingPlanet: 'Jupiter', natalPlanet: 'Moon', aspect: 'trine', orb: 0.8, theme: 'Emotional growth and expansion' },
          { transitingPlanet: 'Pluto', natalPlanet: 'Venus', aspect: 'conjunction', orb: 1.5, theme: 'Deep transformation in relationships' },
        ],
      }),
    },
  ]).onConflict('id').ignore();

  // --- Sample Transit Readings ---
  await knex('transit_readings').insert([
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5e',
      user_id: DEMO_USER_ID,
      chart_id: CHART1_ID,
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      transit_data: JSON.stringify({
        summary: 'April 2026 brings significant career developments as Saturn squares your natal Sun, demanding discipline and structure.',
        keyThemes: ['Career growth', 'Emotional expansion', 'Relationship transformation'],
        highlights: [
          { date: '2026-04-05', description: 'Saturn square Sun — career pressure peaks, stay focused' },
          { date: '2026-04-12', description: 'Jupiter trine Moon — emotional breakthrough possible' },
          { date: '2026-04-20', description: 'Venus enters Gemini — social energy increases' },
          { date: '2026-04-28', description: 'Mercury direct — communication clears up' },
        ],
      }),
      moon_phases: JSON.stringify([
        { date: '2026-04-04', phase: 'full_moon', sign: 'Libra', theme: 'Balance in relationships' },
        { date: '2026-04-17', phase: 'new_moon', sign: 'Aries', theme: 'New beginnings in self-expression' },
      ]),
    },
  ]).onConflict('id').ignore();

  // --- Sample Synastry Report ---
  await knex('synastry_reports').insert([
    {
      id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6f',
      user_id: DEMO_USER_ID,
      chart1_id: CHART1_ID,
      chart2_id: CHART2_ID,
      overall_score: 78,
      category_scores: JSON.stringify({
        communication: 72,
        emotional: 85,
        passion: 80,
        values: 68,
        growth: 82,
      }),
      synastry_aspects: JSON.stringify([
        { planet1: 'Sun (Luna)', planet2: 'Moon (Partner)', aspect: 'trine', orb: 6.4, interpretation: 'Deep emotional understanding and natural harmony' },
        { planet1: 'Venus (Luna)', planet2: 'Mars (Partner)', aspect: 'opposition', orb: 2.8, interpretation: 'Strong attraction with creative tension' },
        { planet1: 'Moon (Luna)', planet2: 'Venus (Partner)', aspect: 'trine', orb: 1.9, interpretation: 'Natural emotional warmth and affection' },
        { planet1: 'Mercury (Luna)', planet2: 'Jupiter (Partner)', aspect: 'sextile', orb: 3.2, interpretation: 'Expansive conversations and shared learning' },
      ]),
      composite_chart: JSON.stringify({
        sun: { sign: 'Gemini', degree: 18.8 },
        moon: { sign: 'Aquarius', degree: 15.4 },
        ascendant: { sign: 'Libra', degree: 5.3 },
      }),
      interpretation: 'This is a dynamic and growth-oriented partnership. The strong trine between Luna\'s Sun and the Partner\'s Moon creates a deep emotional bond, while the Venus-Mars opposition adds passionate energy. Communication may need attention (Mercury square), but the overall compatibility score of 78/100 suggests a fulfilling and supportive relationship with excellent potential for mutual growth.',
      relationship_name: 'Luna & Partner',
      is_favorite: true,
    },
  ]).onConflict('id').ignore();
}
