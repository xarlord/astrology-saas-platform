/**
 * Interpretations Seed
 * Seeds basic astrological interpretations
 */

import type { Knex } from 'knex';

// Planet interpretations
const planetInSignInterpretations = {
  sun_in_aries: {
    keywords: ['energetic', 'pioneering', 'confident', 'impulsive'],
    general: 'With the Sun in Aries, you are a natural-born leader with a strong desire to be first. You approach life with enthusiasm, courage, and a competitive spirit.',
    strengths: ['Leadership', 'Courage', 'Initiative', 'Independence'],
    challenges: ['Impulsiveness', 'Impatience', 'Bluntness', 'Competitiveness'],
  },
  sun_in_taurus: {
    keywords: ['reliable', 'patient', 'determined', 'sensual'],
    general: 'With the Sun in Taurus, you value stability, comfort, and material security. You are persistent, practical, and have a strong appreciation for beauty and pleasure.',
    strengths: ['Patience', 'Reliability', 'Determination', 'Practicality'],
    challenges: ['Stubbornness', 'Possessiveness', 'Resistance to change', 'Materialism'],
  },
  // ... more signs would be added
};

// Aspect interpretations
const aspectInterpretations = {
  conjunction: {
    keywords: ['fusion', 'intensity', 'new beginnings'],
    general: 'A conjunction represents a powerful merging of energies. The planets involved work together as a unified force, amplifying their combined expression.',
    harmonious: false,
    expression: 'The energy is concentrated and focused, creating intensity in the areas of life represented.',
  },
  opposition: {
    keywords: ['tension', 'balance', 'awareness'],
    general: 'An opposition creates tension between two opposing forces, requiring balance and integration. This aspect highlights polarities in your life that must be reconciled.',
    harmonious: false,
    expression: 'The energy creates a push-pull dynamic, requiring conscious integration of opposing needs.',
  },
  trine: {
    keywords: ['harmony', 'flow', 'ease'],
    general: 'A trine represents harmonious flow between planets. The energies work together naturally, often indicating talents and abilities that come easily to you.',
    harmonious: true,
    expression: 'The energy flows effortlessly, creating opportunities for creative expression and success.',
  },
  square: {
    keywords: ['challenge', 'action', 'growth'],
    general: 'A square creates dynamic tension that motivates action and growth. While challenging, squares often indicate where your greatest potential for development lies.',
    harmonious: false,
    expression: 'The energy creates internal and external pressure that drives growth and achievement.',
  },
  sextile: {
    keywords: ['opportunity', 'communication', 'talent'],
    general: 'A sextile represents harmonious aspects that offer opportunities. Like a trine but less powerful, sextiles indicate areas where you can develop talents with some effort.',
    harmonious: true,
    expression: 'The energy offers opportunities that can be realized with conscious effort.',
  },
};

// House interpretations
const houseInterpretations = {
  house_1: {
    name: 'First House',
    ruler: 'Aries',
    themes: ['self-identity', 'appearance', 'first impressions'],
    general: 'The First House represents your self-image, physical appearance, and how you present yourself to the world. It is the house of new beginnings.',
  },
  house_2: {
    name: 'Second House',
    ruler: 'Taurus',
    themes: ['money', 'possessions', 'values'],
    general: 'The Second House governs your finances, material possessions, and personal values. It shows how you earn, spend, and relate to material resources.',
  },
  // ... more houses would be added
};

export async function seed(knex: Knex): Promise<void> {
  // Seed planet in sign interpretations
  const planetSignData = Object.entries(planetInSignInterpretations).map(([key, data]) => ({
    type: 'planet_in_sign',
    key,
    data: data as any,
    language: 'en',
  }));

  await knex('interpretations').insert(planetSignData);

  // Seed aspect interpretations
  const aspectData = Object.entries(aspectInterpretations).map(([key, data]) => ({
    type: 'aspect',
    key,
    data: data as any,
    language: 'en',
  }));

  await knex('interpretations').insert(aspectData);

  // Seed house interpretations
  const houseData = Object.entries(houseInterpretations).map(([key, data]) => ({
    type: 'house_cusp',
    key,
    data: data as any,
    language: 'en',
  }));

  await knex('interpretations').insert(houseData);
}
