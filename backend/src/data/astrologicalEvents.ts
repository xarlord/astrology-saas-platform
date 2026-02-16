/**
 * Astrological Events Interpretations
 * Contains interpretations for retrogrades, eclipses, moon phases, and seasonal ingresses
 */

import { Planet, MoonPhase } from '../models/calendar.model';

export interface RetrogradeInterpretation {
  planet: Planet;
  keywords: string[];
  description: string;
  generalAdvice: string[];
  challenges: string[];
  opportunities: string[];
  activitiesToAvoid: string[];
  activitiesToFavor: string[];
}

export interface MoonPhaseInterpretation {
  phase: MoonPhase;
  intention: string;
  energy: string;
  advice: string;
  ritual?: string;
}

export interface EclipseInterpretation {
  type: 'solar' | 'lunar';
  keywords: string[];
  description: string;
  influence: string;
  advice: string[];
}

export interface SeasonalIngressInterpretation {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  type: 'equinox' | 'solstice';
  theme: string;
  energy: string;
  advice: string[];
}

// Retrograde Interpretations
export const RETROGRADE_INTERPRETATIONS: Record<Planet, RetrogradeInterpretation> = {
  mercury: {
    planet: 'mercury',
    keywords: [
      'communication delays',
      'technology glitches',
      'misunderstandings',
      'travel disruptions',
      'rethinking',
      'reviewing',
    ],
    description:
      'Mercury appears to move backward in the sky, often bringing communication challenges, technology mishaps, and delays in travel and decision-making.',
    generalAdvice: [
      'Back up all important data and files',
      'Avoid signing contracts or making major purchases',
      'Double-check travel arrangements and itineraries',
      'Review and revise existing plans rather than starting new ones',
      'Practice patience in all communications',
      'Allow extra time for commutes and appointments',
    ],
    challenges: [
      'Miscommunications and misunderstandings',
      'Travel delays and cancellations',
      'Technology failures and data loss',
      'Lost or misplaced items',
      'Decision-making difficulties',
      'Resurfacing of past issues',
    ],
    opportunities: [
      'Revisiting old projects and completing unfinished business',
      'Reconnecting with people from the past',
      'Deep thinking, reflection, and introspection',
      'Editing and refining work',
      'Research and planning',
      'Healing old wounds through understanding',
    ],
    activitiesToAvoid: [
      'Starting new ventures',
      'Signing contracts',
      'Making major purchases (especially electronics)',
      'Important conversations',
      'Travel if possible',
    ],
    activitiesToFavor: [
      'Reviewing and revising',
      'Meditation and reflection',
      'Organizing and decluttering',
      'Research and planning',
      'Reconnecting with old friends',
      'Editing and refining creative work',
    ],
  },

  venus: {
    planet: 'venus',
    keywords: [
      'relationship reassessment',
      'financial review',
      're-evaluating values',
      'past loves',
      'self-worth',
      'aesthetic reassessment',
    ],
    description:
      'Venus retrograde invites deep reflection on relationships, finances, and personal values. Old lovers may resurface, and financial matters require careful review.',
    generalAdvice: [
      'Reassess your relationships and what you truly value',
      'Avoid making major relationship decisions',
      'Review your budget and financial commitments',
      'Reconnect with your creative passions',
      'Practice self-love and self-care',
      'Refrain from dramatic changes in appearance',
    ],
    challenges: [
      'Relationship tensions and misunderstandings',
      'Financial setbacks or unexpected expenses',
      'Feeling unloved or undervalued',
      'Resurfacing of past relationship issues',
      'Impulsive spending on unnecessary items',
    ],
    opportunities: [
      'Healing and strengthening existing relationships',
      'Reconnecting with your authentic values',
      'Rediscovering forgotten creative talents',
      'Financial planning and budgeting',
      'Self-reflection and personal growth',
      'Resolving past relationship patterns',
    ],
    activitiesToAvoid: [
      'Starting new relationships',
      'Expensive purchases or investments',
      'Cosmetic surgery or major appearance changes',
      'Wedding proposals',
      'Luxury purchases',
    ],
    activitiesToFavor: [
      'Relationship counseling',
      'Creative projects and artistic expression',
      'Financial review and planning',
      'Self-care practices',
      'Reconnecting with old friends',
      'Reflecting on personal values',
    ],
  },

  mars: {
    planet: 'mars',
    keywords: [
      'delayed action',
      'frustrated energy',
      'internal conflict',
      'reconsidered goals',
      'patience',
      'redirected ambition',
    ],
    description:
      'Mars retrograde can feel like driving with the parking brake on. Energy turns inward, causing frustration but offering opportunities for strategic planning and reassessment of goals.',
    generalAdvice: [
      'Practice patience with yourself and others',
      'Avoid starting new ventures or conflicts',
      'Channel energy into exercise and physical activity',
      'Reassess your goals and strategies',
      'Reflect on how you express anger',
      'Avoid risky activities and impulsive actions',
    ],
    challenges: [
      'Low energy and motivation',
      'Frustration and irritability',
      'Delayed progress on goals',
      'Conflicts and misunderstandings',
      'Accidents and injuries (especially from rushing)',
      'Sexual frustration',
    ],
    opportunities: [
      'Strategic planning for future actions',
      'Reassessing goals and desires',
      'Building physical strength and endurance',
      'Learning healthy anger expression',
      'Completing unfinished projects',
      'Developing patience and persistence',
    ],
    activitiesToAvoid: [
      'Starting new business ventures',
      'Aggressive confrontations',
      'Risky physical activities',
      'Impulsive decisions',
      'Surgical procedures if possible',
    ],
    activitiesToFavor: [
      'Exercise and physical training',
      'Martial arts or yoga',
      'Strategic planning',
      'Goal setting and review',
      'Sexual sublimation through creative work',
      'Patience-building practices',
    ],
  },

  jupiter: {
    planet: 'jupiter',
    keywords: [
      'inner growth',
      'philosophical reflection',
      'ethical review',
      'belief reassessment',
      'education review',
      'expansion pause',
    ],
    description:
      'Jupiter retrograde shifts focus from external expansion to inner growth. It\'s a time for philosophical reflection, ethical review, and reassessing beliefs and education.',
    generalAdvice: [
      'Reflect on your beliefs and philosophy of life',
      'Review your educational path and knowledge goals',
      'Practice gratitude and abundance consciousness',
      'Reassess your ethical boundaries',
      'Focus on spiritual and philosophical growth',
      'Avoid risky investments or gambling',
    ],
    challenges: [
      'Feeling stuck or limited in growth',
      'Questioning life direction and purpose',
      'Disappointment in teachers or mentors',
      'Financial overextension',
      'Optimism turning into unrealistic expectations',
    ],
    opportunities: [
      'Deep spiritual and philosophical insights',
      'Developing inner wisdom',
      'Learning from past mistakes',
      'Strengthening personal ethics',
      'Finding meaning and purpose',
      'Building inner abundance',
    ],
    activitiesToAvoid: [
      'Risky investments',
      'Legal battles if possible',
      'Excessive spending',
      'Starting new educational programs',
      'Long-distance travel if possible',
    ],
    activitiesToFavor: [
      'Spiritual practices and meditation',
      'Philosophical study',
      'Ethical self-reflection',
      'Teaching and mentoring',
      'Gratitude journaling',
      'Reviewing past learning experiences',
    ],
  },

  saturn: {
    planet: 'saturn',
    keywords: [
      'responsibility review',
      'discipline reflection',
      'authority reassessment',
      'karmic review',
      'structure building',
      'patience test',
    ],
    description:
      'Saturn retrograde is a time of karmic review. Responsibilities feel heavier, but this period offers opportunities to build stronger foundations and master life lessons.',
    generalAdvice: [
      'Review your commitments and responsibilities',
      'Strengthen your discipline and routines',
      'Confront fears and limitations',
      'Learn from past mistakes',
      'Practice patience and persistence',
      'Avoid taking on new responsibilities',
    ],
    challenges: [
      'Increased pressure and responsibilities',
      'Feelings of limitation and restriction',
      'Confronting fears and insecurities',
      'Difficulties with authority figures',
      'Delays in career advancement',
      'Physical and emotional fatigue',
    ],
    opportunities: [
      'Building stronger foundations',
      'Mastering important life lessons',
      'Developing wisdom and maturity',
      'Clearing karmic debts',
      'Strengthening boundaries',
      'Long-term planning and strategy',
    ],
    activitiesToAvoid: [
      'Taking on new responsibilities',
      'Career changes if possible',
      'Confronting authority figures',
      'Major structural changes',
      'Rushing progress',
    ],
    activitiesToFavor: [
      'Discipline and routine building',
      'Therapy and shadow work',
      'Career planning and skill development',
      'Confronting fears in safe ways',
      'Patience and persistence practices',
      'Reviewing long-term goals',
    ],
  },

  uranus: {
    planet: 'uranus',
    keywords: [
      'inner rebellion',
      'authenticity quest',
      'innovation pause',
      'freedom reflection',
      'unconventional thinking',
      'change resistance',
    ],
    description:
      'Uranus retrograde turns revolutionary energy inward. External changes slow, but internal transformation accelerates as you question authenticity and freedom.',
    generalAdvice: [
      'Question your need for freedom and independence',
      'Explore your authentic self-expression',
      'Embrace your uniqueness and eccentricity',
      'Innovate in your thinking and approach',
      'Review your relationship with technology',
      'Avoid reckless rebellious actions',
    ],
    challenges: [
      'Feeling restless and constrained',
      'Inner tension between freedom and security',
      'Unpredictable mood shifts',
      'Technology glitches and disruptions',
      'Questioning your place in groups and communities',
    ],
    opportunities: [
      'Deep personal authenticity',
      'Innovative problem-solving',
      'Breaking free from internal limitations',
      'Embracing your uniqueness',
      'Technological innovation',
      'Finding freedom within constraints',
    ],
    activitiesToAvoid: [
      'Impulsive rebellious actions',
      'Rash decisions to change everything',
      'Risky technological experiments',
      'Burning bridges',
    ],
    activitiesToFavor: [
      'Innovation and brainstorming',
      'Exploring unconventional ideas',
      'Technology skills development',
      'Authentic self-expression',
      'Group involvement and networking',
      'Questioning societal norms',
    ],
  },

  neptune: {
    planet: 'neptune',
    keywords: [
      'spiritual reflection',
      'illusion examination',
      'intuition development',
      'compassion cultivation',
      'dream analysis',
      'reality check',
    ],
    description:
      'Neptune retrograde is a time of spiritual sobriety. Illusions fade, reality becomes clearer, and intuition strengthens as fog dissolves.',
    generalAdvice: [
      'Question your dreams and illusions',
      'Develop spiritual discernment',
      'Trust your intuition more',
      'Practice compassionate boundaries',
      'Engage in creative and spiritual practices',
      'Avoid escapism and addiction',
    ],
    challenges: [
      'Disillusionment and disappointment',
      'Seeing reality instead of fantasy',
      'Heightened sensitivity',
      'Confusion and uncertainty',
      'Spiritual crisis or dark night of the soul',
    ],
    opportunities: [
      'Clearer spiritual vision',
      'Strengthened intuition',
      'Creative inspiration',
      'Healing through truth',
      'Developing compassion with boundaries',
      'Breaking free from illusions',
    ],
    activitiesToAvoid: [
      'Escapist behaviors',
      'Substance use',
      'Trusting without verification',
      'Major financial decisions',
      'Psychic or spiritual vulnerability',
    ],
    activitiesToFavor: [
      'Meditation and spiritual practice',
      'Dream journaling',
      'Creative expression',
      'Therapy and shadow work',
      'Developing discernment',
      'Compassion practices',
    ],
  },

  pluto: {
    planet: 'pluto',
    keywords: [
      'inner transformation',
      'power dynamics review',
      'shadow work',
      'death and rebirth',
      'psychological depth',
      'control release',
    ],
    description:
      'Pluto retrograde intensifies transformation. Hidden truths emerge, power dynamics shift, and deep psychological purification occurs.',
    generalAdvice: [
      'Embrace transformation and change',
      'Confront your shadow self',
      'Release need for control',
      'Trust the death and rebirth process',
      'Practice psychological honesty',
      'Avoid power struggles and manipulation',
    ],
    challenges: [
      'Intense emotional purging',
      'Confronting darkness within',
      'Power struggles and control issues',
      'Obsessive thoughts and compulsions',
      'Loss and transformation',
      'Hidden truths revealed',
    ],
    opportunities: [
      'Deep personal transformation',
      'Empowerment through surrender',
      'Healing core wounds',
      'Reclaiming personal power',
      'Psychological breakthroughs',
      'Regeneration and renewal',
    ],
    activitiesToAvoid: [
      'Power struggles',
      'Manipulative behaviors',
      'Obsessive attachments',
      'Control issues',
      'Revenge or resentment',
    ],
    activitiesToFavor: [
      'Therapy and shadow work',
      'Letting go practices',
      'Transformational rituals',
      'Honest self-reflection',
      'Empowerment work',
      'Healing ancestral patterns',
    ],
  },

  sun: {
    planet: 'sun',
    keywords: ['ego reflection', 'vitality review', 'identity reassessment'],
    description: 'The Sun never goes retrograde, but this placeholder exists for type safety.',
    generalAdvice: [],
    challenges: [],
    opportunities: [],
    activitiesToAvoid: [],
    activitiesToFavor: [],
  },

  moon: {
    planet: 'moon',
    keywords: ['emotional review', 'inner needs', 'nurturing reflection'],
    description: 'The Moon never goes retrograde, but this placeholder exists for type safety.',
    generalAdvice: [],
    challenges: [],
    opportunities: [],
    activitiesToAvoid: [],
    activitiesToFavor: [],
  },
};

// Moon Phase Interpretations
export const MOON_PHASE_INTERPRETATIONS: Record<MoonPhase, MoonPhaseInterpretation> = {
  new: {
    phase: 'new',
    intention: 'Set new intentions and plant seeds',
    energy: 'Inner, reflective, new beginnings',
    advice:
      'The new moon is perfect for setting intentions, starting new projects, and planting seeds for the future. Take time to clarify your desires and visualize your goals.',
    ritual:
      'Write down your intentions for the month. Create a vision board or speak your goals aloud. Light a candle to symbolize new beginnings.',
  },
  'waxing-crescent': {
    phase: 'waxing-crescent',
    intention: 'Nurture your intentions',
    energy: 'Growing, expanding, committed',
    advice:
      'As the moon grows, your intentions gain momentum. Stay focused on your goals and take small, consistent actions toward them.',
    ritual:
      'Take your first concrete actions toward your intentions. Nurture your goals with attention and care.',
  },
  'first-quarter': {
    phase: 'first-quarter',
    intention: 'Face challenges and overcome obstacles',
    energy: 'Active, decisive, action-oriented',
    advice:
      'The half-moon brings challenges and obstacles. Stay committed to your path and push through resistance. This is a time of action and decision.',
    ritual:
      'Identify obstacles standing in your way. Make decisive plans to overcome them. Take bold action.',
  },
  'waxing-gibbous': {
    phase: 'waxing-gibbous',
    intention: 'Refine and adjust your approach',
    energy: 'Analytical, preparing, refining',
    advice:
      'As the moon approaches fullness, refine your plans and prepare for completion. Stay flexible and make adjustments as needed.',
    ritual:
      'Review your progress and make necessary adjustments. Prepare for the culmination of your efforts.',
  },
  full: {
    phase: 'full',
    intention: 'Celebrate and release',
    energy: 'Culminating, illuminating, emotional',
    advice:
      'The full moon illuminates and brings emotions to the surface. Celebrate your achievements and release what no longer serves you.',
    ritual:
      'Write down what you want to release from your life. Burn the paper or bury it. Celebrate your progress and express gratitude.',
  },
  'waning-gibbous': {
    phase: 'waning-gibbous',
    intention: 'Share and distribute',
    energy: 'Sharing, teaching, grateful',
    advice:
      'After the full moon, share your wisdom and express gratitude. Teach others what you\'ve learned and distribute the fruits of your labor.',
    ritual:
      'Share your knowledge with others. Express gratitude for your blessings. Give back to your community.',
  },
  'last-quarter': {
    phase: 'last-quarter',
    intention: 'Reflect and release',
    energy: 'Reflective, releasing, letting go',
    advice:
      'The waning half-moon invites deep reflection. Release attachments, forgive, and clear space for the next cycle.',
    ritual:
      'Practice forgiveness of yourself and others. Clear physical and emotional space. Let go of what no longer serves.',
  },
  'waning-crescent': {
    phase: 'waning-crescent',
    intention: 'Rest and restore',
    energy: 'Resting, surrendering, emptying',
    advice:
      'As the cycle completes, rest and restore your energy. Surrender to the void and prepare for the new beginning.',
    ritual:
      'Practice deep rest and meditation. Clear your mind and prepare for the next cycle. Surrender to stillness.',
  },
};

// Eclipse Interpretations
export const ECLIPSE_INTERPRETATIONS: Record<'solar' | 'lunar', EclipseInterpretation> = {
  solar: {
    type: 'solar',
    keywords: ['new beginnings', 'external changes', 'bold action', 'destiny'],
    description:
      'Solar eclipses occur at new moons and signify powerful new beginnings. They often bring unexpected events and external changes that redirect your life path.',
    influence:
      'Solar eclipses activate the area of life where they occur in your chart, bringing new opportunities, unexpected events, and fated encounters.',
    advice: [
      'Embrace new beginnings and opportunities',
      'Be open to unexpected changes',
      'Set powerful intentions for the next 6 months',
      'Pay attention to themes that emerge during this time',
      'Take bold action toward your goals',
      'Release fear of the unknown',
    ],
  },
  lunar: {
    type: 'lunar',
    keywords: ['emotional culminations', 'internal changes', 'release', 'awareness'],
    description:
      'Lunar eclipses occur at full moons and bring emotional culminations. They illuminate hidden truths and facilitate release of old patterns.',
    influence:
      'Lunar eclipses bring emotional revelations and relationship dynamics to light. They facilitate completion and release.',
    advice: [
      'Release what no longer serves you',
      'Honor your emotions and feelings',
      'Bring shadow aspects to light for healing',
      'Complete projects and relationships that have run their course',
      'Practice self-care and emotional processing',
      'Trust your intuition and inner knowing',
    ],
  },
};

// Seasonal Ingress Interpretations
export const SEASONAL_INGRESS_INTERPRETATIONS: Record<
  'spring' | 'summer' | 'autumn' | 'winter',
  SeasonalIngressInterpretation
> = {
  spring: {
    season: 'spring',
    type: 'equinox',
    theme: 'New beginnings and fresh starts',
    energy: 'Active, initiating, energetic',
    advice: [
      'Plant seeds for new projects',
      'Take initiative and bold action',
      'Embrace new beginnings',
      'Focus on personal growth and development',
      'Set goals for the coming season',
    ],
  },
  summer: {
    season: 'summer',
    type: 'solstice',
    theme: 'Peak energy and manifestation',
    energy: 'Expansive, creative, social',
    advice: [
      'Enjoy the fruits of your labor',
      'Socialize and connect with others',
      'Express yourself creatively',
      'Celebrate life and abundance',
      'Honor your achievements',
    ],
  },
  autumn: {
    season: 'autumn',
    type: 'equinox',
    theme: 'Harvest and balance',
    energy: 'Reflective, organizing, preparing',
    advice: [
      'Harvest the fruits of your labor',
      'Organize and prepare for winter',
      'Find balance between work and rest',
      'Release what is no longer needed',
      'Gratitude for abundance received',
    ],
  },
  winter: {
    season: 'winter',
    type: 'solstice',
    theme: 'Rest and renewal',
    energy: 'Inner, dormant, reflective',
    advice: [
      'Rest and restore your energy',
      'Reflect on the past year',
      'Plan for the year ahead',
      'Honor the darkness and stillness',
      'Nurture yourself and others',
    ],
  },
};

export default {
  RETROGRADE_INTERPRETATIONS,
  MOON_PHASE_INTERPRETATIONS,
  ECLIPSE_INTERPRETATIONS,
  SEASONAL_INGRESS_INTERPRETATIONS,
};
