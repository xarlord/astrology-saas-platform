/**
 * Planets Constants
 */

export const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto'
] as const;

export type Planet = typeof PLANETS[number];

export const PLANET_SYMBOLS: Record<Planet, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

export const PLANET_NAMES: Record<Planet, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto'
};

export const PERSONAL_PLANETS: Planet[] = ['sun', 'moon', 'mercury', 'venus', 'mars'];
export const SOCIAL_PLANETS: Planet[] = ['jupiter', 'saturn'];
export const OUTER_PLANETS: Planet[] = ['uranus', 'neptune', 'pluto'];

export const PLANET_COLORS: Record<Planet, string> = {
  sun: '#FFD700',      // Gold
  moon: '#C0C0C0',    // Silver
  mercury: '#8B4513', // SaddleBrown
  venus: '#FF69B4',   // HotPink
  mars: '#FF0000',    // Red
  jupiter: '#FFA500', // Orange
  saturn: '#696969',  // DimGray
  uranus: '#40E0D0',  // Turquoise
  neptune: '#4169E1', // RoyalBlue
  pluto: '#8B0000'    // DarkRed
};
