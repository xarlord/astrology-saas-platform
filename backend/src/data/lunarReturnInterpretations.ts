/**
 * Lunar Return Interpretations Database
 * Comprehensive interpretations for lunar return readings
 */

export interface LunarReturnInterpretation {
  house: number;
  moonPhase: string;
  theme: string;
  description: string;
  emotionalFocus: string;
  keyChallenges: string[];
  keyOpportunities: string[];
  advice: string[];
}

export interface LunarAspectInterpretation {
  aspect: string;
  planet: string;
  interpretation: string;
  advice: string;
}

export interface MoonPhaseLunarReturn {
  phase: string;
  meaning: string;
  energy: string;
  bestActivities: string[];
  challenges: string[];
}

// House-based lunar return interpretations
export const houseInterpretations: Record<number, LunarReturnInterpretation[]> = {
  1: [
    {
      house: 1,
      moonPhase: 'new',
      theme: 'New Beginnings and Self-Discovery',
      description: 'This lunar return marks a powerful time for personal reinvention. Your emotional focus turns inward, inviting deep self-reflection and authentic self-expression.',
      emotionalFocus: 'Self-identity, personal appearance, how you present yourself to the world',
      keyChallenges: [
        'Self-doubt may creep in when initiating new projects',
        'Tendency to worry about others\' opinions',
        'Difficulty balancing personal needs with external expectations',
      ],
      keyOpportunities: [
        'Launch new personal projects with confidence',
        'Reinvent your personal image or style',
        'Discover hidden strengths and talents',
        'Set bold intentions for the month ahead',
      ],
      advice: [
        'Trust your instincts when making decisions',
        'Take calculated risks on behalf of your dreams',
        'Practice self-assertion in healthy ways',
        'Celebrate your uniqueness',
        'Set clear personal boundaries',
      ],
    },
    {
      house: 1,
      moonPhase: 'full',
      theme: 'Culmination and Personal Authenticity',
      description: 'The full moon in your first house illuminates your authentic self. Emotional clarity prevails, making it easier to understand who you are and what you want.',
      emotionalFocus: 'Self-realization, emotional authenticity, personal identity',
      keyChallenges: [
        'Heightened sensitivity to criticism',
        'Emotional reactivity in relationships',
        'Feeling exposed or vulnerable',
      ],
      keyOpportunities: [
        'Deep self-awareness and emotional breakthroughs',
        'Improved self-confidence',
        'Clear communication of personal needs',
        'Emotional healing and release',
      ],
      advice: [
        'Honor your feelings without judgment',
        'Practice self-compassion',
        'Share your authentic self with trusted others',
        'Release old self-perceptions that no longer serve',
        'Celebrate your growth',
      ],
    },
  ],
  2: [
    {
      house: 2,
      moonPhase: 'new',
      theme: 'Values and Financial Intentions',
      description: 'This lunar return focuses your emotional energy on material security, personal values, and self-worth. An ideal time to review finances and align spending with what matters most.',
      emotionalFocus: 'Money, possessions, personal values, self-worth',
      keyChallenges: [
        'Emotional spending patterns may surface',
        'Insecurity about finances',
        'Difficulty separating worth from net worth',
      ],
      keyOpportunities: [
        'Create or revise your budget',
        'Identify and clarify core values',
        'Build savings or investment plans',
        'Develop healthier relationships with money',
      ],
      advice: [
        'Track your spending honestly',
        'Invest in experiences that align with values',
        'Practice gratitude for what you have',
        'Separate self-worth from financial status',
        'Set clear financial goals',
      ],
    },
    {
      house: 2,
      moonPhase: 'full',
      theme: 'Financial Clarity and Value Realization',
      description: 'The full moon illuminates your financial situation and value system. Emotional truths about money and possessions come to light, offering clarity for decision-making.',
      emotionalFocus: 'Financial clarity, material culmination, worth issues',
      keyChallenges: [
        'Financial stress or anxiety may peak',
        'Revealing disparities between values and actions',
        'Confronting unhealthy money patterns',
      ],
      keyOpportunities: [
        'Break through money blocks',
        'Achieve important financial goals',
        'Let go of possessions that no longer serve',
        'Deepen understanding of true worth',
      ],
      advice: [
        'Face financial truths with courage',
        'Release attachments to material things',
        'Forgive yourself for past financial mistakes',
        'Celebrate financial progress',
        'Align spending with deepest values',
      ],
    },
  ],
  3: [
    {
      house: 3,
      moonPhase: 'new',
      theme: 'Communication and Learning Intentions',
      description: 'This lunar return highlights communication, learning, and your immediate environment. An excellent time to start new courses, improve communication skills, or connect with siblings and neighbors.',
      emotionalFocus: 'Communication, learning, local community, siblings',
      keyChallenges: [
        'Misunderstandings in communication',
        'Information overload',
        'Scattered thinking or restlessness',
      ],
      keyOpportunities: [
        'Learn new skills or take courses',
        'Improve communication with family',
        'Write, speak, or teach more effectively',
        'Strengthen community connections',
      ],
      advice: [
        'Practice active listening',
        'Express your thoughts clearly and kindly',
        'Stay curious and open-minded',
        'Balance information intake with processing time',
        'Connect with your local community',
      ],
    },
    {
      house: 3,
      moonPhase: 'full',
      theme: 'Communication Culmination and Clarity',
      description: 'The full moon in your third house brings important conversations, learning achievements, or clarity in communication. Emotional truths are spoken and understood.',
      emotionalFocus: 'Expression, understanding, learning completion',
      keyChallenges: [
        'Difficult conversations may arise',
        'Confronting communication patterns',
        'Processing intense information',
      ],
      keyOpportunities: [
        'Resolve misunderstandings',
        'Complete learning cycles',
        'Speak your emotional truth',
        'Deepen understanding through dialogue',
      ],
      advice: [
        'Speak from the heart',
        'Listen without judgment',
        'Honor different perspectives',
        'Release unexpressed emotions',
        'Celebrate learning achievements',
      ],
    },
  ],
  4: [
    {
      house: 4,
      moonPhase: 'new',
      theme: 'Home, Family, and Emotional Foundations',
      description: 'This lunar return turns your emotional focus homeward. Ideal for setting intentions around family relationships, home improvement, and emotional security. Deep healing work is supported.',
      emotionalFocus: 'Home, family, roots, emotional foundation, private life',
      keyChallenges: [
        'Family dynamics may trigger old emotions',
        'Home repairs or issues arise',
        'Need for more privacy or solitude',
      ],
      keyOpportunities: [
        'Deepen family bonds',
        'Create nurturing home spaces',
        'Heal ancestral or childhood patterns',
        'Establish healthy emotional boundaries',
        'Renovate or redecorate your home',
      ],
      advice: [
        'Create sacred space in your home',
        'Honor your need for privacy',
        'Nurture yourself like a loving parent',
        'Have honest conversations with family',
        'Build emotional security from within',
      ],
    },
    {
      house: 4,
      moonPhase: 'full',
      theme: 'Emotional Culmination and Family Revelations',
      description: 'The full moon in your fourth house illuminates your deepest emotional needs and family dynamics. Powerful emotions surface, offering opportunities for profound healing and transformation.',
      emotionalFocus: 'Emotional climax, family matters, home life, private self',
      keyChallenges: [
        'Intense family emotions or conflicts',
        'Feeling emotionally exposed',
        'Home or property issues come to head',
      ],
      keyOpportunities: [
        'Profound emotional healing',
        'Family breakthroughs and reconciliation',
        'Home improvements completed',
        'Release old emotional patterns',
        'Strengthen emotional foundations',
      ],
      advice: [
        'Feel your feelings fully',
        'Create safety for emotional expression',
        'Honor your need for emotional space',
        'Forgive family and yourself',
        'Celebrate emotional growth',
      ],
    },
  ],
  5: [
    {
      house: 5,
      moonPhase: 'new',
      theme: 'Creativity, Romance, and Self-Expression',
      description: 'This lunar return ignites your creative and romantic energy. Perfect for starting artistic projects, new romantic connections, or simply bringing more playfulness into your life.',
      emotionalFocus: 'Creativity, romance, pleasure, children, self-expression',
      keyChallenges: [
        'Need for validation through romance',
        'Overindulgence in pleasures',
        'Dramatic emotional expression',
      ],
      keyOpportunities: [
        'Start creative projects',
        'Attract new romantic connections',
        'Reconnect with your inner child',
        'Express yourself authentically',
        'Experience more joy and play',
      ],
      advice: [
        'Make time for play and creativity',
        'Express love generously',
        'Take creative risks',
        'Honor your desire for pleasure',
        'Share your gifts with the world',
      ],
    },
    {
      house: 5,
      moonPhase: 'full',
      theme: 'Creative and Romantic Culmination',
      description: 'The full moon in your fifth house brings creative projects to fruition and illuminates romantic connections. Emotional fulfillment through self-expression and joy is highlighted.',
      emotionalFocus: 'Creative completion, romantic clarity, joy, celebration',
      keyChallenges: [
        'Romantic relationships reach decision points',
        'Creative blocks may surface',
        'Need for attention or validation',
      ],
      keyOpportunities: [
        'Complete creative projects',
        'Deepen romantic connections',
        'Experience pure joy and celebration',
        'Share your creativity publicly',
        'Reconnect with your playful spirit',
      ],
      advice: [
        'Celebrate your creative achievements',
        'Express love boldly',
        'Make time for fun and play',
        'Share your artistic gifts',
        'Honor your inner child',
      ],
    },
  ],
  6: [
    {
      house: 6,
      moonPhase: 'new',
      theme: 'Work, Health, and Daily Routines',
      description: 'This lunar return focuses on service, health, and daily habits. An ideal time to start new wellness routines, organize your work life, and implement healthier daily practices.',
      emotionalFocus: 'Work, health, service, daily routines, self-care',
      keyChallenges: [
        'Work stress or overwhelm',
        'Health issues may require attention',
        'Perfectionism in daily tasks',
      ],
      keyOpportunities: [
        'Implement new health routines',
        'Improve work organization',
        'Develop self-care practices',
        'Be of service to others',
        'Create efficient daily systems',
      ],
      advice: [
        'Prioritize self-care without guilt',
        'Create realistic daily routines',
        'Listen to your body\'s needs',
        'Find meaning in service',
        'Balance work and rest',
      ],
    },
    {
      house: 6,
      moonPhase: 'full',
      theme: 'Work and Health Culmination',
      description: 'The full moon in your sixth house brings work projects to completion and highlights health matters. Emotional clarity around work-life balance and wellness routines emerges.',
      emotionalFocus: 'Work completion, health clarity, service, routines',
      keyChallenges: [
        'Work stress reaches peak',
        'Health issues demand attention',
        'Burnout or overwhelm',
      ],
      keyOpportunities: [
        'Complete important work projects',
        'Achieve health breakthroughs',
        'Improve work-life balance',
        'Release unhealthy routines',
        'Find fulfillment in service',
      ],
      advice: [
        'Honor your physical limits',
        'Celebrate work achievements',
        'Address health issues proactively',
        'Delegate when overwhelmed',
        'Nurture yourself through service',
      ],
    },
  ],
  7: [
    {
      house: 7,
      moonPhase: 'new',
      theme: 'Partnerships and Relationship Intentions',
      description: 'This lunar return focuses on one-on-one relationships of all kinds. Ideal for setting intentions around partnerships, marriage, business collaborations, and finding balance between self and other.',
      emotionalFocus: 'Partnerships, marriage, relationships, balance, compromise',
      keyChallenges: [
        'Relationship conflicts may arise',
        'Codependency issues surface',
        'Difficulty balancing needs',
      ],
      keyOpportunities: [
        'Strengthen existing partnerships',
        'Attract new harmonious relationships',
        'Improve communication with partners',
        'Find healthy balance in relationships',
        'Start collaborative projects',
      ],
      advice: [
        'Communicate needs clearly and kindly',
        'Practice active compromise',
        'Honor your partner\'s perspective',
        'Maintain your identity in relationships',
        'Choose relationships that reflect self-worth',
      ],
    },
    {
      house: 7,
      moonPhase: 'full',
      theme: 'Relationship Culmination and Clarity',
      description: 'The full moon in your seventh house illuminates your partnerships. Relationship dynamics come to light, decisions about commitments may be made, and emotional clarity in connections is achieved.',
      emotionalFocus: 'Relationship climax, partnership clarity, commitments',
      keyChallenges: [
        'Relationship conflicts reach breaking point',
        'Confronting relationship patterns',
        'Making difficult relationship decisions',
      ],
      keyOpportunities: [
        'Deepen partnership bonds',
        'Resolve long-standing relationship issues',
        'Make clear relationship commitments',
        'Release unhealthy partnerships',
        'Achieve relationship harmony',
      ],
      advice: [
        'Communicate honestly with partners',
        'Face relationship truths courageously',
        'Honor your need for partnership',
        'Balance compromise with self-respect',
        'Celebrate healthy relationships',
      ],
    },
  ],
  8: [
    {
      house: 8,
      moonPhase: 'new',
      theme: 'Transformation and Shared Resources',
      description: 'This lunar return delves into deep emotional territory—intimacy, shared resources, transformation, and the mysteries of life. A powerful time for setting intentions around emotional healing and financial partnerships.',
      emotionalFocus: 'Intimacy, shared resources, transformation, death/rebirth, occult',
      keyChallenges: [
        'Deep emotional intensity',
        'Financial issues with partners or inheritance',
        'Facing fears and shadows',
        'Letting go of control',
      ],
      keyOpportunities: [
        'Deep emotional healing and transformation',
        'Strengthen intimate bonds',
        'Resolve financial partnerships',
        'Release old patterns and trauma',
        'Access hidden psychological insights',
      ],
      advice: [
        'Embrace transformation rather than resist',
        'Face fears with courage',
        'Practice vulnerability with trusted others',
        'Release emotional baggage',
        'Trust the process of change',
      ],
    },
    {
      house: 8,
      moonPhase: 'full',
      theme: 'Transformation and Emotional Alchemy',
      description: 'The full moon in your eighth house brings powerful emotional transformations to completion. Deep psychological insights, intimate revelations, or financial matters reach a climax.',
      emotionalFocus: 'Deep transformation, emotional alchemy, shared resources',
      keyChallenges: [
        'Intense emotional experiences',
        'Confronting deepest fears',
        'Financial or inheritance matters',
        'Power dynamics in relationships',
      ],
      keyOpportunities: [
        'Profound emotional breakthroughs',
        'Transformative relationship experiences',
        'Resolve shared resource issues',
        'Release old emotional wounds',
        'Experience rebirth and renewal',
      ],
      advice: [
        'Surrender to transformation',
        'Face your shadows with compassion',
        'Honor your need for intimacy',
        'Release what must die',
        'Trust your capacity for rebirth',
      ],
    },
  ],
  9: [
    {
      house: 9,
      moonPhase: 'new',
      theme: 'Philosophy, Travel, and Higher Learning',
      description: 'This lunar return expands your horizons through philosophy, travel, education, and spiritual exploration. An excellent time to set intentions around belief systems, higher learning, or foreign connections.',
      emotionalFocus: 'Philosophy, travel, higher education, spirituality, foreign lands',
      keyChallenges: [
        'Questioning belief systems',
        'Restlessness or desire to escape',
        'Cultural or philosophical conflicts',
        'Over-optimism or exaggeration',
      ],
      keyOpportunities: [
        'Expand your knowledge through study',
        'Plan meaningful travel',
        'Explore spiritual or philosophical paths',
        'Connect with foreign cultures',
        'Publish or share your wisdom',
      ],
      advice: [
        'Stay open to new perspectives',
        'Question your assumptions with curiosity',
        'Plan adventures that expand your world',
        'Study subjects that inspire you',
        'Honor your need for meaning',
      ],
    },
    {
      house: 9,
      moonPhase: 'full',
      theme: 'Expansion and Philosophical Clarity',
      description: 'The full moon in your ninth house brings educational or travel endeavors to fruition and illuminates your belief system. Philosophical clarity and spiritual insights emerge.',
      emotionalFocus: 'Expansion completion, clarity, wisdom, adventure',
      keyChallenges: [
        'Confronting limiting beliefs',
        'Travel plans reach completion or face obstacles',
        'Cultural or religious conflicts',
        'Need for freedom versus commitments',
      ],
      keyOpportunities: [
        'Complete educational goals',
        'Transformative travel experiences',
        'Break through limiting beliefs',
        'Share your wisdom with others',
        'Experience spiritual insights',
      ],
      advice: [
        'Embrace new philosophies with discernment',
        'Honor your need for freedom',
        'Share your knowledge generously',
        'Integrate travel experiences',
        'Trust your spiritual journey',
      ],
    },
  ],
  10: [
    {
      house: 10,
      moonPhase: 'new',
      theme: 'Career and Public Life Intentions',
      description: 'This lunar return focuses your emotional energy on career, reputation, and public image. Ideal for setting professional goals, launching business ventures, or working on your public presence.',
      emotionalFocus: 'Career, reputation, public image, achievements, authority',
      keyChallenges: [
        'Work-life balance struggles',
        'Career pressure or ambition stress',
        'Public scrutiny or reputation concerns',
        'Authority figure conflicts',
      ],
      keyOpportunities: [
        'Launch career initiatives',
        'Enhance professional reputation',
        'Take on leadership roles',
        'Achieve significant career goals',
        'Build your public brand',
      ],
      advice: [
        'Set ambitious career goals',
        'Maintain integrity in professional dealings',
        'Balance ambition with ethics',
        'Network strategically',
        'Celebrate career achievements',
      ],
    },
    {
      house: 10,
      moonPhase: 'full',
      theme: 'Career Culmination and Public Recognition',
      description: 'The full moon in your tenth house brings career matters to a head. Professional achievements, public recognition, or career changes are highlighted. Your public image is illuminated.',
      emotionalFocus: 'Career climax, public recognition, achievements',
      keyChallenges: [
        'Career decisions must be made',
        'Public reputation scrutiny',
        'Work-life balance reaches crisis',
        'Authority figure conflicts',
      ],
      keyOpportunities: [
        'Achieve major career milestones',
        'Receive public recognition',
        'Advance to leadership positions',
        'Transform your career path',
        'Build lasting professional legacy',
      ],
      advice: [
        'Own your achievements confidently',
        'Make career decisions with clarity',
        'Balance public and private self',
        'Lead with integrity',
        'Celebrate your success',
      ],
    },
  ],
  11: [
    {
      house: 11,
      moonPhase: 'new',
      theme: 'Friendships and Community Intentions',
      description: 'This lunar return focuses on friendships, groups, and community. An excellent time to set intentions around social connections, join groups or organizations, and work toward collective goals.',
      emotionalFocus: 'Friendships, groups, community, hopes, wishes, networks',
      keyChallenges: [
        'Group conflicts or politics',
        'Friendship issues surface',
        'Balancing individual and group needs',
        'Disappointment in groups',
      ],
      keyOpportunities: [
        'Strengthen friendships',
        'Join like-minded communities',
        'Network for goals and dreams',
        'Collaborate on group projects',
        'Contribute to social causes',
      ],
      advice: [
        'Choose friends who reflect your values',
        'Balance social time with solitude',
        'Contribute authentically to groups',
        'Set healthy boundaries with friends',
        'Pursue shared dreams collectively',
      ],
    },
    {
      house: 11,
      moonPhase: 'full',
      theme: 'Social Culmination and Community Realizations',
      description: 'The full moon in your eleventh house illuminates your social world and community connections. Friendships are highlighted, group endeavors reach completion, and your hopes and dreams gain clarity.',
      emotionalFocus: 'Social completion, friendship clarity, group achievements',
      keyChallenges: [
        'Friendship conflicts come to light',
        'Group projects face completion challenges',
        'Disillusionment with groups or friends',
        'Reevaluating social circles',
      ],
      keyOpportunities: [
        'Achieve collective goals',
        'Deepen meaningful friendships',
        'Release unhealthy social connections',
        'Clarify your vision for the future',
        'Find your tribe',
      ],
      advice: [
        'Honor true friendships',
        'Release social connections that don\'t serve',
        'Celebrate group achievements',
        'Dream boldly for the future',
        'Build community intentionally',
      ],
    },
  ],
  12: [
    {
      house: 12,
      moonPhase: 'new',
      theme: 'Spirituality, Endings, and the Unconscious',
      description: 'This lunar return turns your emotional focus inward to the spiritual realm, the unconscious, and endings. A powerful time for spiritual practices, healing, and releasing what must complete.',
      emotionalFocus: 'Spirituality, unconscious, endings, solitude, hidden matters',
      keyChallenges: [
        'Confronting shadow self',
        'Isolation or loneliness',
        'Unconscious patterns surface',
        'Confusion or lack of clarity',
      ],
      keyOpportunities: [
        'Deep spiritual growth',
        'Heal old wounds',
        'Release patterns that no longer serve',
        'Develop intuition and psychic abilities',
        'Find peace in solitude',
      ],
      advice: [
        'Embrace solitude for spiritual growth',
        'Practice meditation or contemplation',
        'Work with dreams actively',
        'Release the old with grace',
        'Trust the unseen process',
      ],
    },
    {
      house: 12,
      moonPhase: 'full',
      theme: 'Spiritual Culmination and Completion',
      description: 'The full moon in your twelfth house brings spiritual insights, emotional completion, and confrontation with the unconscious. Hidden matters come to light for healing and release.',
      emotionalFocus: 'Spiritual climax, unconscious revelations, endings',
      keyChallenges: [
        'Intense emotional processing',
        'Facing suppressed emotions',
        'Spiritual crisis or dark night of soul',
        'Need for solitude and retreat',
      ],
      keyOpportunities: [
        'Profound spiritual insights',
        'Complete major emotional cycles',
        'Heal deep wounds',
        'Develop psychic or intuitive gifts',
        'Experience divine connection',
      ],
      advice: [
        'Trust your spiritual process',
        'Allow emotions to flow without judgment',
        'Create space for retreat and reflection',
        'Work with dreams and symbols',
        'Surrender to higher wisdom',
      ],
    },
  ],
};

// Moon phase interpretations for lunar returns
export const moonPhaseLunarReturn: Record<string, MoonPhaseLunarReturn> = {
  'new': {
    phase: 'new',
    meaning: 'New beginnings, fresh energy, intention setting',
    energy: 'Inward, receptive, planting seeds, initiating',
    bestActivities: [
      'Set intentions for the lunar month',
      'Start new projects',
      'Begin new habits',
      'Plant literal or metaphorical seeds',
      'Meditate on goals',
      'Create vision boards',
    ],
    challenges: [
      'Energy may be low',
      'Clarity may take time to emerge',
      'Premature action before planning',
    ],
  },
  'waxing-crescent': {
    phase: 'waxing-crescent',
    meaning: 'Growing momentum, increasing clarity, early action',
    energy: 'Building, strengthening, clarifying',
    bestActivities: [
      'Take first steps on intentions',
      'Gather resources',
      'Build momentum',
      'Refine plans',
      'Increase commitment to goals',
    ],
    challenges: [
      'Impatience with slow progress',
      'Self-doubt may surface',
      'Obstacles may appear',
    ],
  },
  'first-quarter': {
    phase: 'first-quarter',
    meaning: 'Action phase, overcoming obstacles, decision making',
    energy: 'Active, challenging, decisive',
    bestActivities: [
      'Take decisive action',
      'Overcome obstacles',
      'Make important decisions',
      'Push through resistance',
      'Commit fully to goals',
    ],
    challenges: [
      'Crisis of action versus inaction',
      'Resistance from self or others',
      'Need for courage',
    ],
  },
  'waxing-gibbous': {
    phase: 'waxing-gibbous',
    meaning: 'Refining, perfecting, building toward fulfillment',
    energy: 'Refining, adjusting, preparing',
    bestActivities: [
      'Fine-tune plans and projects',
      'Make adjustments based on feedback',
      'Prepare for completion',
      'Build anticipation',
      'Analyze progress',
    ],
    challenges: [
      'Perfectionism',
      'Impatience for completion',
      'Need for flexibility',
    ],
  },
  'full': {
    phase: 'full',
    meaning: 'Culmination, completion, illumination, realization',
    energy: 'Outward, expressive, fulfilling, releasing',
    bestActivities: [
      'Celebrate achievements',
      'Complete projects',
      'Release what no longer serves',
      'Express gratitude',
      'Harvest fruits of efforts',
      'Share accomplishments',
    ],
    challenges: [
      'Emotional intensity',
      'Relationship tensions',
      'Illumination of uncomfortable truths',
    ],
  },
  'waning-gibbous': {
    phase: 'waning-gibbous',
    meaning: 'Gratitude, sharing, teaching, integration',
    energy: 'Sharing, grateful, integrating, teaching',
    bestActivities: [
      'Share wisdom with others',
      'Teach what you\'ve learned',
      'Practice gratitude',
      'Integrate lessons',
      'Distribute results',
    ],
    challenges: [
      'Letting go of achievements',
      'Moving to new cycles',
      'Arrogance or pride',
    ],
  },
  'last-quarter': {
    phase: 'last-quarter',
    meaning: 'Release, reflection, reevaluation, letting go',
    energy: 'Releasing, reflective, clearing',
    bestActivities: [
      'Release old patterns',
      'Clear clutter',
      'Reflect on lessons learned',
      'Forgive yourself and others',
      'Make space for new',
    ],
    challenges: [
      'Resistance to letting go',
      'Crisis of consciousness',
      'Emotional clearing',
    ],
  },
  'waning-crescent': {
    phase: 'waning-crescent',
    meaning: 'Rest, surrender, regeneration, dreaming',
    energy: 'Resting, surrendering, restoring, visioning',
    bestActivities: [
      'Rest and restore energy',
      'Surrender outcomes',
      'Dream and vision',
      'Prepare for new cycle',
      'Practice self-care',
      'Meditate and reflect',
    ],
    challenges: [
      'Low energy',
      'Confusion or disorientation',
      'Impatience for new beginning',
    ],
  },
};

// Aspect interpretations for lunar returns
export const lunarAspectInterpretations: LunarAspectInterpretation[] = [
  {
    aspect: 'conjunction',
    planet: 'Sun',
    interpretation: 'Your conscious and emotional nature are powerfully aligned. Your feelings and actions work in harmony, creating a sense of inner wholeness and authentic self-expression.',
    advice: 'Trust your inner alignment, express yourself authentically, honor both your feelings and your logic.',
  },
  {
    aspect: 'opposition',
    planet: 'Sun',
    interpretation: 'Tension between your emotional needs and conscious desires creates an opportunity for growth. Relationship dynamics may reflect this inner polarity.',
    advice: 'Find balance between head and heart, communicate needs clearly, honor both sides of your nature.',
  },
  {
    aspect: 'trine',
    planet: 'Sun',
    interpretation: 'Harmonious flow between your feelings and actions creates ease in self-expression. You feel emotionally supported in pursuing your goals.',
    advice: 'Express gratitude for this harmony, use it to pursue goals, share your good energy with others.',
  },
  {
    aspect: 'square',
    planet: 'Sun',
    interpretation: 'Challenges between your emotional needs and conscious expression require attention. Growth comes through integrating these different parts of yourself.',
    advice: 'Work to integrate feelings and actions, be patient with yourself, find creative solutions to inner conflicts.',
  },
  {
    aspect: 'sextile',
    planet: 'Sun',
    interpretation: 'Opportunities for harmonizing your feelings and actions present themselves. Pleasant connections between inner and outer self support your goals.',
    advice: 'Take advantage of supportive energy, express yourself creatively, enjoy the flow.',
  },
  {
    aspect: 'conjunction',
    planet: 'Mercury',
    interpretation: 'Your emotions and mind are closely linked, giving you strong emotional intelligence and communication skills. Feelings may color your thinking.',
    advice: 'Honor your emotional intelligence, communicate feelings clearly, be aware of emotional biases in thinking.',
  },
  {
    aspect: 'opposition',
    planet: 'Mercury',
    interpretation: 'Tension between your emotions and intellect may create challenges in communication. You may struggle to express feelings clearly or understand others\' emotional communications.',
    advice: 'Practice patience in communication, listen deeply, separate thoughts from feelings when needed.',
  },
  {
    aspect: 'trine',
    planet: 'Mercury',
    interpretation: 'Your emotions and mind work together harmoniously. Emotional intelligence supports clear thinking and effective communication.',
    advice: 'Express your feelings articulately, use this time for important conversations, enjoy mental clarity.',
  },
  {
    aspect: 'square',
    planet: 'Mercury',
    interpretation: 'Challenges in communicating your feelings or understanding others\' emotions. Emotional reasoning may conflict with logical thinking.',
    advice: 'Practice clarity and patience, learn to separate thoughts from feelings, choose words carefully.',
  },
  {
    aspect: 'conjunction',
    planet: 'Venus',
    interpretation: 'Your emotional nature and capacity for love are harmoniously aligned. This is a favorable time for relationships, pleasure, and artistic expression.',
    advice: 'Express love generously, enjoy beauty and pleasure, strengthen relationships, create art.',
  },
  {
    aspect: 'opposition',
    planet: 'Venus',
    interpretation: 'Relationship tensions may reflect inner conflicts between your emotional needs and your capacity for giving and receiving love.',
    advice: 'Find balance in relationships, address love and values conflicts, practice compromise.',
  },
  {
    aspect: 'trine',
    planet: 'Venus',
    interpretation: 'Harmonious energy supports love, pleasure, and artistic expression. Your emotional nature is in flow with your capacity for joy.',
    advice: 'Enjoy loving connections, express yourself creatively, appreciate beauty, celebrate love.',
  },
  {
    aspect: 'square',
    planet: 'Venus',
    interpretation: 'Challenges in relationships or self-worth may surface. Conflicts between what you value emotionally and how you express love or experience pleasure.',
    advice: 'Work on self-worth, address relationship issues honestly, find healthy ways to experience pleasure.',
  },
  {
    aspect: 'conjunction',
    planet: 'Mars',
    interpretation: 'Your emotional energy and drive are powerfully connected. You may feel emotionally motivated to take action, or emotions may fuel your ambitions.',
    advice: 'Channel emotional energy constructively, take action on feelings, be aware of emotional reactivity.',
  },
  {
    aspect: 'opposition',
    planet: 'Mars',
    interpretation: 'Tension between your emotional needs and your drive for action. You may feel conflicted between what you feel and what you want to do.',
    advice: 'Find balance between feeling and acting, avoid impulsive decisions, channel energy wisely.',
  },
  {
    aspect: 'trine',
    planet: 'Mars',
    interpretation: 'Your emotional energy and physical drive work together harmoniously. Good time for taking action on emotional matters.',
    advice: 'Use emotional energy productively, take initiative, pursue goals with passion.',
  },
  {
    aspect: 'square',
    planet: 'Mars',
    interpretation: 'Frustration between emotional needs and desires for action. May feel emotionally irritable or have difficulty directing energy effectively.',
    advice: 'Find constructive outlets for frustration, avoid impulsive actions, practice emotional management.',
  },
  {
    aspect: 'conjunction',
    planet: 'Jupiter',
    interpretation: 'Your emotions are expanded and optimistic. This is a favorable time for emotional growth, philosophical exploration, and experiencing abundance.',
    advice: 'Embrace emotional expansion, practice gratitude, share your good fortune, explore spiritual growth.',
  },
  {
    aspect: 'opposition',
    planet: 'Jupiter',
    interpretation: 'Tension between emotional needs and desires for expansion. May feel emotionally excessive or struggle with boundaries.',
    advice: 'Practice emotional moderation, find healthy balance, avoid overextending emotionally.',
  },
  {
    aspect: 'trine',
    planet: 'Jupiter',
    interpretation: 'Flowing emotional energy supports growth, optimism, and abundance. Feelings of generosity and emotional expansion.',
    advice: 'Share your emotional abundance, embrace opportunities for growth, practice gratitude.',
  },
  {
    aspect: 'square',
    planet: 'Jupiter',
    interpretation: 'Challenges around emotional excess, over-optimism, or unrealistic expectations. May need to temper emotional expansion with realism.',
    advice: 'Balance optimism with realism, practice emotional moderation, ground your expectations.',
  },
];

// Intensity level interpretations
export const intensityInterpretations: Record<number, string> = {
  1: 'Very gentle emotional energy. Use this time for rest, reflection, and subtle inner work.',
  2: 'Mild emotional influence. Good for routine emotional maintenance and gentle self-care.',
  3: 'Light emotional energy. Minor feelings and insights may arise, but overall low intensity.',
  4: 'Moderate-low emotional energy. Some feelings surface, but nothing overwhelming.',
  5: 'Average emotional intensity. Normal emotional fluctuations and experiences.',
  6: 'Moderate-high emotional energy. Stronger feelings and more significant emotional experiences.',
  7: 'High emotional intensity. Powerful emotions and important emotional insights likely.',
  8: 'Very high emotional intensity. Deep feelings, major emotional work, and transformation possible.',
  9: 'Extreme emotional energy. Profound emotional experiences, breakthroughs, or challenges.',
  10: 'Maximum emotional intensity. Life-altering emotional experiences, powerful transformation, deep catharsis.',
};

export default {
  houseInterpretations,
  moonPhaseLunarReturn,
  lunarAspectInterpretations,
  intensityInterpretations,
};
