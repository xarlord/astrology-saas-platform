/**
 * Shared types for the Learn module
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PlanetCard {
  id: string;
  name: string;
  symbol: string;
  color: string;
  difficulty: DifficultyLevel;
  coreFunction: string;
  psychologicalMeaning: string;
  inBirthChart: string;
  inTransit: string;
  healthyExpression: string;
  difficultExpression: string;
  interpretationQuestions: string[];
  beginnerTip: string;
  practicalExample?: string;
  commonMisconception?: string;
}

export interface SignCard {
  id: string;
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  accentColor: string;
  difficulty: DifficultyLevel;
  coreTraits: string;
  howItColorsEnergy: string;
  rulingPlanet: string;
  psychologicalMeaning: string;
  inBirthChart: string;
  practicalExample: string;
  compatibilityNote: string;
  beginnerTip: string;
  commonMisconception: string;
  interpretationQuestions: string[];
}

export interface HouseCard {
  id: string;
  number: number;
  title: string;
  accentColor: string;
  difficulty: DifficultyLevel;
  mainTheme: string;
  psychologicalMeaning: string;
  lifeAreas: string[];
  whatPlanetsEmphasize: string;
  transitMeaning: string;
  commonMisconception: string;
  interpretationQuestions: string[];
  practicalExample?: string;
  beginnerTip?: string;
}

export interface AspectCard {
  id: string;
  name: string;
  angle: string;
  symbol: string;
  nature: 'Harmonious' | 'Challenging' | 'Neutral';
  accentColor: string;
  difficulty: DifficultyLevel;
  meaning: string;
  psychologicalFunction: string;
  howItAppearsInRealLife: string;
  howToInterpretInBirthChart: string;
  commonMisconception: string;
  beginnerTip: string;
  practicalExample?: string;
  interpretationTip?: string;
}

export interface TransitCategory {
  id: string;
  name: string;
  planets: string[];
  description: string;
  speed: 'fast' | 'social' | 'outer';
}

export interface TransitExample {
  id: string;
  title: string;
  meaning: string;
  difficulty: DifficultyLevel;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  difficulty: DifficultyLevel;
  relatedTerms?: string[];
  practicalExample?: string;
}

export type LearnSection = 'overview' | 'planets' | 'signs' | 'houses' | 'aspects' | 'transits' | 'reading' | 'glossary';

export interface LearningPathStep {
  id: string;
  title: string;
  section: LearnSection;
  order: number;
  description: string;
}

export interface ReadingLesson {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  difficulty: DifficultyLevel;
  content: string;
  practicalExample: string;
  keyTakeaway: string;
}
