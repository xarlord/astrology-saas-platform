/**
 * Houses Constants
 */

export const HOUSE_SYSTEMS = [
  'placidus',
  'koch',
  'porphyry',
  'whole',
  'equal',
  'topocentric',
  'campanus',
  'regiomontanus'
] as const;

export type HouseSystem = typeof HOUSE_SYSTEMS[number];

export const HOUSE_SYSTEM_NAMES: Record<HouseSystem, string> = {
  placidus: 'Placidus',
  koch: 'Koch',
  porphyry: 'Porphyry',
  whole: 'Whole Sign',
  equal: 'Equal House',
  topocentric: 'Topocentric',
  campanus: 'Campanus',
  regiomontanus: 'Regiomontanus'
};

export const DEFAULT_HOUSE_SYSTEM: HouseSystem = 'placidus';

export const HOUSE_COUNT = 12;

export const HOUSE_MEANINGS = [
  'Self, identity, appearance',
  'Values, possessions, money',
  'Communication, thinking, siblings',
  'Home, family, roots',
  'Creativity, romance, children',
  'Work, health, service',
  'Partnerships, relationships',
  'Transformation, sexuality, shared resources',
  'Philosophy, travel, higher learning',
  'Career, reputation, public image',
  'Community, friends, aspirations',
  'Spirituality, subconscious, hidden matters'
];
