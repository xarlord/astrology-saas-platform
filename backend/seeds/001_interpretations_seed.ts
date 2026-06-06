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
    aspectType: 'Intensifying / Blending Aspect',
    coreMeaning: 'A conjunction occurs when two planets or points are close together. Their energies merge and act as a combined force.',
    psychologicalPattern: 'The person may experience the two planetary functions as inseparable. This can create focus, intensity, talent, pressure, or over-identification with that combination.',
    realLifeExpression: 'The themes of the two planets often appear together. For example, Venus conjunct Mars may combine affection with desire, attraction with action, or relationship with passion.',
    birthChartMeaning: 'In a natal chart, a conjunction shows a strong life theme. It can become a major part of identity or behavior, depending on the planets and house involved.',
    transitMeaning: 'In transit, a conjunction activates a natal planet or point directly. It can mark a new cycle, strong awareness, or a concentrated event/theme.',
    constructiveUse: 'Use the combined energy consciously instead of letting one planet dominate the other.',
    beginnerTip: 'A conjunction is powerful, but not automatically positive or negative. Always interpret the planets, sign, house, and orb.',
  },
  opposition: {
    keywords: ['tension', 'balance', 'awareness'],
    general: 'An opposition creates tension between two opposing forces, requiring balance and integration. This aspect highlights polarities in your life that must be reconciled.',
    harmonious: false,
    expression: 'The energy creates a push-pull dynamic, requiring conscious integration of opposing needs.',
    aspectType: 'Polarizing / Awareness Aspect',
    coreMeaning: 'An opposition occurs when two planets face each other across the chart. It creates contrast, tension, projection, and the need for balance.',
    psychologicalPattern: 'The person may swing between two different needs or see one side of the aspect through other people. Oppositions often become visible through relationships, conflict, comparison, or external situations.',
    realLifeExpression: 'The person may feel pulled between two life areas, two desires, or two roles. For example, Moon opposite Saturn may create tension between emotional needs and responsibility.',
    birthChartMeaning: 'In a natal chart, an opposition asks for integration. The person must learn to hold both sides instead of rejecting one and over-identifying with the other.',
    transitMeaning: 'In transit, an opposition may bring confrontation, clarity, relationship events, decisions, or external circumstances that reveal an imbalance.',
    constructiveUse: 'Practice balance, negotiation, and conscious awareness of projection.',
    beginnerTip: 'An opposition does not mean one side must win. The goal is integration.',
  },
  trine: {
    keywords: ['harmony', 'flow', 'ease'],
    general: 'A trine represents harmonious flow between planets. The energies work together naturally, often indicating talents and abilities that come easily to you.',
    harmonious: true,
    expression: 'The energy flows effortlessly, creating opportunities for creative expression and success.',
    aspectType: 'Harmonious / Flowing Aspect',
    coreMeaning: 'A trine shows natural flow between two planets. Their energies support each other easily.',
    psychologicalPattern: 'The person may have a natural ability, comfort, or ease connected with the planets involved.',
    realLifeExpression: 'Trines may appear as talent, support, confidence, ease, creativity, or circumstances that develop without too much resistance.',
    birthChartMeaning: 'In a natal chart, a trine shows a natural resource. However, because it feels easy, the person may take it for granted.',
    transitMeaning: 'In transit, a trine may bring support, opportunity, ease, emotional relief, or smoother progress.',
    constructiveUse: 'Use the natural talent actively. Do not assume ease means automatic success.',
    beginnerTip: 'A trine is helpful, but it can become passive if not consciously used.',
  },
  square: {
    keywords: ['challenge', 'action', 'growth'],
    general: 'A square creates dynamic tension that motivates action and growth. While challenging, squares often indicate where your greatest potential for development lies.',
    harmonious: false,
    expression: 'The energy creates internal and external pressure that drives growth and achievement.',
    aspectType: 'Dynamic / Challenging Aspect',
    coreMeaning: 'A square creates friction between two planets. It shows tension, pressure, conflict, and the need for action.',
    psychologicalPattern: 'The person may feel blocked, irritated, motivated, or forced to grow. Squares often describe inner conflicts that push development.',
    realLifeExpression: 'Squares may appear as repeated challenges, frustration, urgency, ambition, conflict, or situations that demand effort.',
    birthChartMeaning: 'In a natal chart, a square shows an area of life that requires work and conscious development. It may feel difficult early in life but can become a source of strength.',
    transitMeaning: 'In transit, a square often brings pressure, decisions, conflict, deadlines, or turning points.',
    constructiveUse: 'Use the pressure as fuel. Squares become productive when the person stops avoiding the tension and works with it directly.',
    beginnerTip: 'Squares are not "bad." They are engines of growth. Many achievements come from square aspects.',
  },
  sextile: {
    keywords: ['opportunity', 'communication', 'talent'],
    general: 'A sextile represents harmonious aspects that offer opportunities. Like a trine but less powerful, sextiles indicate areas where you can develop talents with some effort.',
    harmonious: true,
    expression: 'The energy offers opportunities that can be realized with conscious effort.',
    aspectType: 'Supportive / Opportunity Aspect',
    coreMeaning: 'A sextile shows cooperation and potential between two planets. It is helpful, but it usually requires conscious effort to activate.',
    psychologicalPattern: 'The person may have a skill or opportunity that develops through practice, choice, and awareness.',
    realLifeExpression: 'Sextiles may appear as useful contacts, learnable talents, productive conversations, practical support, or opportunities that need action.',
    birthChartMeaning: 'In a natal chart, a sextile shows an area where the person can develop competence with effort.',
    transitMeaning: 'In transit, a sextile may bring openings, helpful timing, constructive choices, or manageable opportunities.',
    constructiveUse: 'Take action. A sextile works best when the person participates.',
    beginnerTip: 'A sextile is potential, not a guarantee.',
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

  await knex('interpretations').insert(planetSignData).onConflict(['type', 'key']).ignore();

  // Seed aspect interpretations
  const aspectData = Object.entries(aspectInterpretations).map(([key, data]) => ({
    type: 'aspect',
    key,
    data: data as any,
    language: 'en',
  }));

  await knex('interpretations').insert(aspectData).onConflict(['type', 'key']).ignore();

  // Seed house interpretations
  const houseData = Object.entries(houseInterpretations).map(([key, data]) => ({
    type: 'house_cusp',
    key,
    data: data as any,
    language: 'en',
  }));

  await knex('interpretations').insert(houseData).onConflict(['type', 'key']).ignore();
}
