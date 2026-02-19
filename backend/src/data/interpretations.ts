/**
 * Astrological Interpretations Database
 *
 * Comprehensive interpretations for:
 * - Planets in signs
 * - Planets in houses
 * - Aspects between planets
 * - Transit interpretations
 * - House meanings
 */

// ============================================================================
// PLANETS IN SIGNS INTERPRETATIONS
// ============================================================================

export interface PlanetInSignInterpretation {
  planet: string;
  sign: string;
  keywords: string[];
  general: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

export const planetsInSigns: Record<string, Record<string, PlanetInSignInterpretation>> = {
  sun: {
    aries: {
      planet: 'sun',
      sign: 'aries',
      keywords: ['pioneering', 'courageous', 'energetic', 'independent', 'direct'],
      general: 'With the Sun in Aries, you are a natural-born pioneer. Your identity is forged through action, initiative, and courageous self-expression. You possess an innate drive to be first, to lead, and to blaze new trails. Your sense of self comes from asserting your will and overcoming challenges.',
      strengths: [
        'Natural leadership ability',
        'Courage to face challenges',
        'Direct and honest communication',
        'Enthusiastic and energetic',
        'Quick to take initiative',
      ],
      challenges: [
        'Can be impulsive or rash',
        'May struggle with patience',
        'Tendency to dominate conversations',
        'Difficulty seeing others\' perspectives',
        'Quick-tempered when frustrated',
      ],
      advice: [
        'Practice patience - not everything requires immediate action',
        'Learn to collaborate and value others\' contributions',
        'Channel your energy constructively through physical activity',
        'Develop awareness of how your actions affect others',
        'Balance independence with interdependence',
      ],
    },
    taurus: {
      planet: 'sun',
      sign: 'taurus',
      keywords: ['reliable', 'patient', 'sensual', 'determined', 'practical'],
      general: 'With the Sun in Taurus, you find your identity through stability, comfort, and the tangible world. You are grounded, practical, and possess a deep appreciation for beauty and sensory experiences. Your sense of self is built through steady progress, accumulating resources, and creating lasting foundations.',
      strengths: [
        'Extremely reliable and dependable',
        'Patient and persistent',
        'Strong aesthetic sense',
        'Practical and resourceful',
        'Loyal and devoted',
      ],
      challenges: [
        'Resistance to change',
        'Can be stubborn or inflexible',
        'Materialistic tendencies',
        'Slow to adapt to new situations',
        'May hold onto things (or people) too long',
      ],
      advice: [
        'Embrace necessary changes as opportunities for growth',
        'Practice letting go of what no longer serves you',
        'Share your resources and abundance with others',
        'Balance comfort with occasional risk-taking',
        'Recognize that flexibility is strength',
      ],
    },
    gemini: {
      planet: 'sun',
      sign: 'gemini',
      keywords: ['curious', 'versatile', 'communicative', 'intellectual', 'adaptable'],
      general: 'With the Sun in Gemini, your identity is expressed through communication, learning, and intellectual exploration. You are naturally curious, mentally agile, and driven to gather and share information. Your sense of self comes from your ability to connect ideas and people.',
      strengths: [
        'Quick-witted and intelligent',
        'Excellent communication skills',
        'Versatile and adaptable',
        'Natural networker',
        'Lifelong learner',
      ],
      challenges: [
        'Scattered energy and interests',
        'Difficulty with depth over breadth',
        'Can be inconsistent or unreliable',
        'Tendency to overthink',
        'May struggle with emotional depth',
      ],
      advice: [
        'Focus your energy on fewer projects for greater impact',
        'Practice diving deeper into subjects that truly matter',
        'Balance mental activity with emotional and physical awareness',
        'Follow through on commitments',
        'Connect intellectual pursuits with practical application',
      ],
    },
    cancer: {
      planet: 'sun',
      sign: 'cancer',
      keywords: ['nurturing', 'emotional', 'protective', 'intuitive', 'domestic'],
      general: 'With the Sun in Cancer, your identity is deeply connected to home, family, and emotional bonds. You possess strong nurturing instincts and a profound intuitive sense. Your sense of self comes from creating safe spaces and caring for those you love.',
      strengths: [
        'Deeply empathetic and caring',
        'Strong intuitive abilities',
        'Loyal and devoted to loved ones',
        'Excellent memory',
        'Naturally protective and nurturing',
      ],
      challenges: [
        'Overly sensitive to criticism',
        'Difficulty letting go of the past',
        'Moodiness and emotional fluctuations',
        'Tendency to be overprotective',
        'Can be passive-aggressive',
      ],
      advice: [
        'Develop emotional boundaries for healthy relationships',
        'Practice forgiveness and release past hurts',
        'Channel sensitivity into creative or healing pursuits',
        'Balance caring for others with self-care',
        'Trust your intuition while verifying facts',
      ],
    },
    leo: {
      planet: 'sun',
      sign: 'leo',
      keywords: ['confident', 'creative', 'generous', 'dramatic', 'charismatic'],
      general: 'With the Sun in Leo (its rulership), you shine with natural confidence and creative self-expression. You are here to be seen, to lead, and to share your unique gifts with the world. Your identity comes from creative self-expression and the recognition you receive from others.',
      strengths: [
        'Natural leadership and presence',
        'Generous and warm-hearted',
        'Creative and self-expressive',
        'Loyal and devoted',
        'Optimistic and inspiring',
      ],
      challenges: [
        'Need for constant validation',
        'Can be arrogant or egotistical',
        'Dramatic tendencies',
        'Difficulty sharing the spotlight',
        'Fixed opinions',
      ],
      advice: [
        'Practice humility - true confidence needs no constant praise',
        'Share the spotlight and uplift others',
        'Channel creativity for self-expression, not just attention',
        'Develop leadership through service, not ego',
        'Balance receiving recognition with giving it',
      ],
    },
    virgo: {
      planet: 'sun',
      sign: 'virgo',
      keywords: ['analytical', 'practical', 'helpful', 'perfectionist', 'discriminating'],
      general: 'With the Sun in Virgo, you find identity through service, analysis, and continual improvement. You possess a keen eye for detail and a natural drive to help others. Your sense of self comes from being useful, solving problems, and refining both yourself and your environment.',
      strengths: [
        'Detail-oriented and thorough',
        'Analytical and problem-solving',
        'Reliable and hardworking',
        'Desire to be of service',
        'Natural critic with good taste',
      ],
      challenges: [
        'Perfectionism leading to procrastination',
        'Overly critical of self and others',
        'Worry and anxiety',
        'Difficulty delegating',
        'Self-effacing tendencies',
      ],
      advice: [
        'Embrace "good enough" over perfect',
        'Practice self-compassion and acceptance',
        'Channel criticism constructively',
        'Delegate tasks and trust others',
        'Balance analysis with intuition and action',
      ],
    },
    libra: {
      planet: 'sun',
      sign: 'libra',
      keywords: ['harmonious', 'diplomatic', 'fair', 'artistic', 'relationship-oriented'],
      general: 'With the Sun in Libra, your identity is shaped through relationships, harmony, and aesthetic appreciation. You are a natural diplomat who seeks balance and beauty in all things. Your sense of self comes through partnership and your ability to create harmony around you.',
      strengths: [
        'Natural peacemaker and mediator',
        'Strong sense of fairness and justice',
        'Appreciation of beauty and aesthetics',
        'Socially graceful and charming',
        'Collaborative and cooperative',
      ],
      challenges: [
        'Indecision and analysis paralysis',
        'Dependence on others\' opinions',
        'Avoidance of conflict at all costs',
        'People-pleasing tendencies',
        'Loss of self in relationships',
      ],
      advice: [
        'Practice making decisions independently',
        'Learn that some conflict is necessary for growth',
        'Cultivate your own desires separate from others',
        'Balance others\' needs with self-care',
        'Develop authenticity over popularity',
      ],
    },
    scorpio: {
      planet: 'sun',
      sign: 'scorpio',
      keywords: ['intense', 'transformative', 'perceptive', 'passionate', 'determined'],
      general: 'With the Sun in Scorpio, you are a force of depth, transformation, and penetrating insight. You experience life with profound intensity and are drawn to life\'s mysteries. Your identity comes through deep emotional experiences, personal transformation, and uncovering hidden truths.',
      strengths: [
        'Deeply perceptive and intuitive',
        'Resilient and transformative',
        'Intense focus and determination',
        'Loyal and committed',
        'Natural detective and researcher',
      ],
      challenges: [
        'Tendency toward jealousy and possessiveness',
        'Difficulty forgiving and letting go',
        'Can be secretive or manipulative',
        'Extreme emotional intensity',
        'All-or-nothing thinking',
      ],
      advice: [
        'Practice forgiveness for your own peace of mind',
        'Channel intensity into transformative pursuits',
        'Cultivate transparency and trust',
        'Balance depth with lightness and joy',
        'Learn to surrender control when necessary',
      ],
    },
    sagittarius: {
      planet: 'sun',
      sign: 'sagittarius',
      keywords: ['adventurous', 'philosophical', 'optimistic', 'freedom-loving', 'truth-seeking'],
      general: 'With the Sun in Sagittarius, you are a seeker of truth, meaning, and expansion. Your identity comes through exploration, learning, and broadening your horizons. You possess natural optimism and a deep desire to understand the bigger picture of life.',
      strengths: [
        'Naturally optimistic and inspiring',
        'Philosophical and big-picture thinker',
        'Adventurous and open to new experiences',
        'Honest and direct',
        'Natural teacher and guide',
      ],
      challenges: [
        'Tendency to overcommit or overpromise',
        'Difficulty with details and follow-through',
        'Can be tactlessly blunt',
        'Restlessness and commitment issues',
        'Know-it-all tendencies',
      ],
      advice: [
        'Balance big dreams with practical steps',
        'Practice delivering truth with compassion',
        'Cultimate patience with slower processes',
        'Follow through on commitments',
        'Stay open to learning from all sources',
      ],
    },
    capricorn: {
      planet: 'sun',
      sign: 'capricorn',
      keywords: ['ambitious', 'disciplined', 'responsible', 'patient', 'authoritative'],
      general: 'With the Sun in Capricorn, your identity is forged through achievement, responsibility, and mastery. You possess natural discipline and a long-term view of success. Your sense of self comes from building lasting structures and achieving tangible goals.',
      strengths: [
        'Extremely disciplined and hardworking',
        'Natural leadership and authority',
        'Patient and strategic',
        'Responsible and reliable',
        'Excellent planner and organizer',
      ],
      challenges: [
        'Workaholic tendencies',
        'Difficulty expressing emotion',
        'Pessimistic or cynical outlook',
        'Rigid or controlling behavior',
        'Fear of failure or vulnerability',
      ],
      advice: [
        'Balance work with play and rest',
        'Practice vulnerability in trusted relationships',
        'Cultivate optimism and trust in the process',
        'Delegate and share responsibility',
        'Recognize that worth isn\'t defined by achievement',
      ],
    },
    aquarius: {
      planet: 'sun',
      sign: 'aquarius',
      keywords: ['innovative', 'independent', 'humanitarian', 'unconventional', 'visionary'],
      general: 'With the Sun in Aquarius, you are a visionary who marches to your own beat. Your identity comes through innovation, independence, and contributing to the greater good. You possess a unique perspective and natural desire to improve the world around you.',
      strengths: [
        'Highly original and innovative',
        'Strong humanitarian instincts',
        'Independent thinker',
        'Natural networker and connector',
        'Forward-thinking and progressive',
      ],
      challenges: [
        'Emotional detachment or aloofness',
        'Rebellion for rebellion\'s sake',
        'Fixed opinions despite open-minded appearance',
        'Difficulty with intimacy',
        'Can be eccentric or unpredictable',
      ],
      advice: [
        'Balance independence with emotional connection',
        'Practice expressing emotions authentically',
        'Channel innovation into practical solutions',
        'Respect others\' viewpoints even when disagreeing',
        'Ground your visions in actionable steps',
      ],
    },
    pisces: {
      planet: 'sun',
      sign: 'pisces',
      keywords: ['compassionate', 'artistic', 'intuitive', 'dreamy', 'spiritual'],
      general: 'With the Sun in Pisces, you are a sensitive soul who experiences life through emotions, imagination, and spiritual connection. Your identity comes through compassion, creativity, and your ability to transcend ordinary reality. You possess deep empathy and a rich inner world.',
      strengths: [
        'Deeply compassionate and empathetic',
        'Highly creative and imaginative',
        'Spiritually inclined',
        'Intuitive and perceptive',
        'Adaptable and go-with-the-flow',
      ],
      challenges: [
        'Boundary issues with others',
        'Escapist tendencies',
        'Overwhelming sensitivity',
        'Difficulty with practical realities',
        'Victim mentality or martyrdom',
      ],
      advice: [
        'Develop healthy emotional boundaries',
        'Ground spiritual insights in practical action',
        'Channel sensitivity into creative or healing work',
        'Face reality directly while maintaining compassion',
        'Balance giving with receiving',
      ],
    },
  },
  moon: {
    aries: {
      planet: 'moon',
      sign: 'aries',
      keywords: ['emotionally impulsive', 'independent', 'passionate', 'reactive', 'self-focused'],
      general: 'With the Moon in Aries, your emotional nature is direct, spontaneous, and action-oriented. You process feelings through immediate expression and instinctive action. Emotional security comes from maintaining your independence and being true to yourself in the moment.',
      strengths: [
        'Emotionally honest and authentic',
        'Quick to recover from setbacks',
        'Independent and self-reliant',
        'Passionate and enthusiastic',
        'Protective of self and loved ones',
      ],
      challenges: [
        'Emotional impulsivity',
        'Short emotional fuse',
        'Difficulty with emotional vulnerability',
        'Self-centered emotional responses',
        'Struggles with patience in emotional matters',
      ],
      advice: [
        'Practice counting to ten before emotional reactions',
        'Develop patience with slower emotional processes',
        'Learn to sit with uncomfortable emotions',
        'Balance independence with emotional interdependence',
        'Channel emotional energy constructively',
      ],
    },
    // ... Continue with Moon in other signs
    taurus: {
      planet: 'moon',
      sign: 'taurus',
      keywords: ['emotionally stable', 'sensual', 'stubborn', 'nurturing', 'comfort-seeking'],
      general: 'With the Moon in Taurus, you seek emotional security through stability, comfort, and tangible experiences. Your emotions are steady, reliable, and deeply connected to your physical environment. You find comfort in routines, possessions, and sensory pleasures.',
      strengths: [
        'Emotionally stable and consistent',
        'Nurturing and caring',
        'Patient with emotional processes',
        'Strong need for security creates stable environments',
        'Loyal and devoted in relationships',
      ],
      challenges: [
        'Emotional stubbornness',
        'Resistance to change in emotional life',
        'Possessiveness',
        'Materialistic approach to emotional security',
        'Holds onto past emotional hurts',
      ],
      advice: [
        'Practice emotional flexibility',
        'Find security within, not just in external things',
        'Embrace necessary emotional changes',
        'Share your nurturing nature freely',
        'Balance comfort with occasional emotional risks',
      ],
    },
    gemini: {
      planet: 'moon',
      sign: 'gemini',
      keywords: ['emotionally curious', 'versatile', 'communicative', 'mentally active', 'restless'],
      general: 'With the Moon in Gemini, your emotional nature is curious, communicative, and mentally stimulated. You process feelings through talking, thinking, and gathering information. Emotional security comes from mental stimulation, variety, and social connection.',
      strengths: [
        'Emotionally adaptable and flexible',
        'Excellent emotional communicator',
        'Curious about feelings',
        'Quick-witted emotional responses',
        'Connects emotions to ideas',
      ],
      challenges: [
        'Emotional restlessness',
        'Difficulty experiencing deep emotions',
        'Overthinking feelings',
        'Emotional inconsistency',
        'Uses humor to deflect vulnerability',
      ],
      advice: [
        'Practice sitting with deeper emotions',
        'Balance mental activity with emotional depth',
        'Communicate feelings honestly, not intellectually',
        'Find emotional security in consistency',
        'Connect with your body, not just your mind',
      ],
    },
    cancer: {
      planet: 'moon',
      sign: 'cancer',
      keywords: ['emotionally nurturing', 'protective', 'sensitive', 'intuitive', 'family-oriented'],
      general: 'With the Moon in Cancer (its rulership), your emotional nature is deep, nurturing, and highly sensitive. You possess strong intuitive abilities and profound emotional intelligence. Emotional security comes from home, family, and creating safe spaces for yourself and others.',
      strengths: [
        'Deeply empathetic and caring',
        'Strong emotional intelligence',
        'Intuitive and perceptive',
        'Nurturing and supportive',
        'Loyal and devoted to loved ones',
      ],
      challenges: [
        'Overwhelming emotional sensitivity',
        'Difficulty letting go of hurts',
        'Moodiness and emotional fluctuations',
        'Overprotective tendencies',
        'Emotional dependency',
      ],
      advice: [
        'Develop emotional boundaries',
        'Practice forgiveness and release',
        'Channel sensitivity into healing work',
        'Balance giving with self-care',
        'Trust your intuition while staying grounded',
      ],
    },
    leo: {
      planet: 'moon',
      sign: 'leo',
      keywords: ['emotionally expressive', 'creative', 'proud', 'warm', 'attention-seeking'],
      general: 'With the Moon in Leo, your emotional nature is dramatic, creative, and warmly expressive. You need to be seen, appreciated, and loved for who you are. Emotional security comes from creative self-expression, recognition, and being the center of your own life.',
      strengths: [
        'Warm and generous emotionally',
        'Creatively expressive',
        'Loyal and devoted',
        'Natural emotional leader',
        'Optimistic and inspiring',
      ],
      challenges: [
        'Emotional need for validation',
        'Pride makes apologizing difficult',
        'Dramatic emotional reactions',
        'Can be emotionally arrogant',
        'Hurt when not receiving attention',
      ],
      advice: [
        'Find validation within yourself',
        'Practice humility in emotional matters',
        'Express creativity without need for applause',
        'Share emotional spotlight with others',
        'True confidence needs no constant praise',
      ],
    },
    virgo: {
      planet: 'moon',
      sign: 'virgo',
      keywords: ['emotionally analytical', 'service-oriented', 'perfectionist', 'discriminating', 'helpful'],
      general: 'With the Moon in Virgo, your emotional nature is practical, analytical, and service-oriented. You process feelings through analysis and find emotional security through being useful and improving things. You care deeply about details and helping others.',
      strengths: [
        'Emotionally reliable and helpful',
        'Analyzes feelings constructively',
        'Desire to be of service emotionally',
        'Attentive to emotional needs of others',
        'Emotionally organized and methodical',
      ],
      challenges: [
        'Emotional perfectionism',
        'Overly critical of own feelings',
        'Worry and anxiety about emotions',
        'Difficulty with emotional messiness',
        'Self-effacing emotional nature',
      ],
      advice: [
        'Embrace emotional imperfection',
        'Practice self-compassion',
        'Balance analysis with feeling',
        'Accept help from others',
        'Not everything needs fixing',
      ],
    },
    libra: {
      planet: 'moon',
      sign: 'libra',
      keywords: ['emotionally diplomatic', 'harmony-seeking', 'relationship-oriented', 'fair', 'indecisive'],
      general: 'With the Moon in Libra, your emotional nature is focused on relationships, harmony, and balance. You process feelings through social connection and need emotional companionship. Emotional security comes from partnerships and creating beauty and harmony around you.',
      strengths: [
        'Emotionally fair and just',
        'Diplomatic and tactful',
        'Values emotional harmony',
        'Socially graceful emotionally',
        'Considerate of others\' feelings',
      ],
      challenges: [
        'Emotional indecision',
        'Dependence on others for emotional well-being',
        'Suppresses own feelings for harmony',
        'Emotional people-pleasing',
        'Loses self in relationships',
      ],
      advice: [
        'Make decisions based on your feelings',
        'Develop emotional independence',
        'Practice constructive conflict',
        'Honor your own emotional needs',
        'Balance self with others',
      ],
    },
    scorpio: {
      planet: 'moon',
      sign: 'scorpio',
      keywords: ['emotionally intense', 'transformative', 'perceptive', 'passionate', 'secretive'],
      general: 'With the Moon in Scorpio, your emotional nature is profound, intense, and transformative. You experience emotions with great depth and possess powerful emotional insight. Emotional security comes through deep transformation, emotional intimacy, and facing the truth.',
      strengths: [
        'Deeply perceptive emotionally',
        'Emotionally resilient',
        'Intense emotional commitment',
        'Transformative emotional power',
        'Detects emotional dishonesty',
      ],
      challenges: [
        'Emotional intensity can be overwhelming',
        'Holds onto emotional wounds',
        'Jealousy and possessiveness',
        'Emotional secrecy',
        'All-or-nothing emotional approach',
      ],
      advice: [
        'Practice emotional forgiveness',
        'Channel intensity constructively',
        'Be vulnerable with trusted people',
        'Let go of past emotional pain',
        'Balance depth with lightness',
      ],
    },
    sagittarius: {
      planet: 'moon',
      sign: 'sagittarius',
      keywords: ['emotionally optimistic', 'freedom-loving', 'philosophical', 'adventurous', 'direct'],
      general: 'With the Moon in Sagittarius, your emotional nature is optimistic, adventurous, and freedom-loving. You process feelings through exploration, philosophy, and seeking meaning. Emotional security comes from freedom, truth-seeking, and expanding your horizons.',
      strengths: [
        'Naturally optimistic emotionally',
        'Emotionally honest and direct',
        'Seeks higher meaning in feelings',
        'Adventurous emotional attitude',
        'Inspires others emotionally',
      ],
      challenges: [
        'Emotional restlessness',
        'Difficulty with emotional commitment',
        'Blunt emotional expression',
        'Avoids deeper emotional processing',
        'Philosophizes instead of feeling',
      ],
      advice: [
        'Practice emotional presence',
        'Commit to deep emotional work',
        'Deliver truth with compassion',
        'Find freedom through emotional depth',
        'Balance adventure with intimacy',
      ],
    },
    capricorn: {
      planet: 'moon',
      sign: 'capricorn',
      keywords: ['emotionally reserved', 'responsible', 'ambitious', 'disciplined', 'controlled'],
      general: 'With the Moon in Capricorn, your emotional nature is reserved, disciplined, and ambitious. You process feelings carefully and maintain emotional control. Emotional security comes from achievement, responsibility, and building stable structures.',
      strengths: [
        'Emotionally reliable and steady',
        'Disciplined emotional expression',
        'Takes emotional responsibility',
        'Patient with emotional processes',
        'Builds lasting emotional foundations',
      ],
      challenges: [
        'Emotional suppression',
        'Difficulty expressing vulnerability',
        'Fear of emotional chaos',
        'Workaholic emotional coping',
        'Pessimistic emotional outlook',
      ],
      advice: [
        'Practice emotional expression',
        'Allow yourself to be vulnerable',
        'Balance work with emotional connection',
        'Cultivate emotional optimism',
        'Feelings are not weaknesses',
      ],
    },
    aquarius: {
      planet: 'moon',
      sign: 'aquarius',
      keywords: ['emotionally detached', 'independent', 'humanitarian', 'unconventional', 'friendly'],
      general: 'With the Moon in Aquarius, your emotional nature is independent, intellectual, and humanitarian. You process feelings through logic and maintain emotional objectivity. Emotional security comes from freedom, individuality, and contributing to causes greater than yourself.',
      strengths: [
        'Emotionally objective and fair',
        'Values emotional freedom',
        'Humanitarian emotional approach',
        'Friendly and socially connected',
        'Emotionally independent',
      ],
      challenges: [
        'Emotional detachment and aloofness',
        'Intellectualizes feelings',
        'Difficulty with intimacy',
        'Unconventional emotional expression',
        'Can seem emotionally cold',
      ],
      advice: [
        'Practice emotional vulnerability',
        'Connect heart with mind',
        'Allow yourself to feel deeply',
        'Balance independence with intimacy',
        'Emotional authenticity over detachment',
      ],
    },
    pisces: {
      planet: 'moon',
      sign: 'pisces',
      keywords: ['emotionally sensitive', 'compassionate', 'dreamy', 'intuitive', 'escapist'],
      general: 'With the Moon in Pisces, your emotional nature is compassionate, intuitive, and deeply sensitive. You feel everything and experience profound empathy. Emotional security comes through spiritual connection, creativity, and serving others.',
      strengths: [
        'Profoundly empathetic',
        'Highly emotionally intuitive',
        'Compassionate and forgiving',
        'Creatively emotionally expressive',
        'Emotionally selfless',
      ],
      challenges: [
        'Overwhelming emotional sensitivity',
        'Lack of emotional boundaries',
        'Emotional escapism',
        'Absorbs others\' emotions',
        'Victim consciousness',
      ],
      advice: [
        'Develop strong emotional boundaries',
        'Ground emotions in reality',
        'Channel sensitivity into healing',
        'Distinguish your feelings from others\'',
        'Balance giving with receiving',
      ],
    },
  },
  mercury: {
    aries: {
      planet: 'mercury',
      sign: 'aries',
      keywords: ['direct thinking', 'decisive', 'impulsive mind', 'competitive', 'pioneering'],
      general: 'With Mercury in Aries, your mind is quick, decisive, and action-oriented. You think on your feet and communicate directly and assertively. You learn best through hands-on experience and immediate feedback.',
      strengths: ['Quick thinking', 'Decisive', 'Direct communication', 'Pioneering ideas', 'Competitive intelligence'],
      challenges: ['Impulsive decisions', 'Blunt communication', 'Lack of patience', 'Jumping to conclusions', 'Interrupting others'],
      advice: ['Think before speaking', 'Patience in learning', 'Listen to others\' ideas', 'Follow through on mental projects', 'Consider consequences'],
    },
    taurus: {
      planet: 'mercury',
      sign: 'taurus',
      keywords: ['practical thinking', 'reliable', 'patient mind', 'sensory learning', 'deliberate'],
      general: 'With Mercury in Taurus, your mind is practical, reliable, and thorough. You learn through repetition and hands-on experience with the material world. Your thinking is steady and you arrive at conclusions through careful consideration.',
      strengths: ['Practical intelligence', 'Reliable thinking', 'Patient learner', 'Excellent memory', 'Sound judgment'],
      challenges: ['Stubborn opinions', 'Resistant to new ideas', 'Slow decision-making', 'Set in ways', 'Dislikes change'],
      advice: ['Remain open to new ideas', 'Embrace mental flexibility', 'Trust your intuition', 'Share your practical wisdom', 'Consider different perspectives'],
    },
    gemini: {
      planet: 'mercury',
      sign: 'gemini',
      keywords: ['versatile mind', 'curious', 'quick-witted', 'communicative', 'adaptable'],
      general: 'With Mercury in Gemini (its rulership), your mind is quick, curious, and incredibly versatile. You learn rapidly and communicate with ease. Your thinking is adaptable and you excel at connecting diverse ideas and information.',
      strengths: ['Quick learner', 'Excellent communicator', 'Versatile intelligence', 'Curious mind', 'Great storyteller'],
      challenges: ['Scattered focus', 'Superficial learning', 'Restless mind', 'Difficulty with depth', 'Inconsistent interests'],
      advice: ['Focus your mental energy', 'Dive deeper into subjects', 'Finish what you start', 'Balance breadth with depth', 'Practice sustained attention'],
    },
    cancer: {
      planet: 'mercury',
      sign: 'cancer',
      keywords: ['intuitive thinking', 'memory-focused', 'protective mind', 'imaginative', 'retentive'],
      general: 'With Mercury in Cancer, your mind is intuitive, imaginative, and emotionally intelligent. You have an excellent memory and think in terms of feelings and personal experiences. You communicate with emotional depth and sensitivity.',
      strengths: ['Excellent memory', 'Emotionally intelligent', 'Intuitive thinker', 'Imaginative mind', 'Protective of ideas'],
      challenges: ['Emotional thinking', 'Holds onto past thoughts', 'Overly subjective', 'Takes things personally', 'Difficulty with objectivity'],
      advice: ['Balance emotion with logic', 'Practice objective thinking', 'Release past mental patterns', 'Share your imaginative insights', 'Trust your intuition'],
    },
    leo: {
      planet: 'mercury',
      sign: 'leo',
      keywords: ['creative thinking', 'confident mind', 'dramatic expression', 'loyal beliefs', 'proud'],
      general: 'With Mercury in Leo, your mind is creative, confident, and expressive. You think in grand terms and communicate with warmth and authority. You have a natural ability to inspire others through your words and ideas.',
      strengths: ['Creative intelligence', 'Confident communicator', 'Inspirational speaker', 'Loyal to beliefs', 'Dramatic expression'],
      challenges: ['Stubborn opinions', 'Need for attention', 'Dramatizes thoughts', 'Doesn\'t listen well', 'Arrogant in communication'],
      advice: ['Practice humility in communication', 'Listen to others\' ideas', 'Share the mental stage', 'Accept criticism constructively', 'Inspire, don\'t impress'],
    },
    virgo: {
      planet: 'mercury',
      sign: 'virgo',
      keywords: ['analytical mind', 'detail-oriented', 'critical thinking', 'organized', 'discriminating'],
      general: 'With Mercury in Virgo (its rulership), your mind is analytical, precise, and detail-oriented. You excel at breaking down complex information and finding practical solutions. Your thinking is organized and you notice what others miss.',
      strengths: ['Analytical genius', 'Detail-oriented', 'Organized thinker', 'Problem solver', 'Practical intelligence'],
      challenges: ['Overthinking', 'Overly critical', 'Perfectionist mind', 'Worry and anxiety', 'Misses the forest for the trees'],
      advice: ['Embrace "good enough"', 'Practice mental self-compassion', 'See the big picture', 'Quiet your mental critic', 'Trust your analysis'],
    },
    libra: {
      planet: 'mercury',
      sign: 'libra',
      keywords: ['balanced thinking', 'diplomatic mind', 'comparative', 'fair-minded', 'indecisive'],
      general: 'With Mercury in Libra, your mind is diplomatic, comparative, and focused on balance. You think in terms of relationships and consider multiple perspectives. You communicate with grace and seek harmony in intellectual exchange.',
      strengths: ['Fair-minded', 'Diplomatic communicator', 'Sees all sides', 'Gracious speech', 'Mediator'],
      challenges: ['Indecisive thinking', 'People-pleasing intellect', 'Difficulty taking stands', 'Relies on others\' opinions', 'Mental people-pleasing'],
      advice: ['Make decisions independently', 'Trust your own judgment', 'Practice assertive communication', 'Balance others\' needs with yours', 'Speak your truth kindly'],
    },
    scorpio: {
      planet: 'mercury',
      sign: 'scorpio',
      keywords: ['penetrating mind', 'investigative', 'secretive', 'perceptive', 'intense'],
      general: 'With Mercury in Scorpio, your mind is deep, investigative, and penetrating. You think beneath the surface and excel at uncovering hidden truths. Your communication is intense and you perceive what others try to hide.',
      strengths: ['Investigative mind', 'Perceptive thinker', 'Detects deception', 'Deep researcher', 'Strategic thinking'],
      challenges: ['Obsessive thinking', 'Secretive communication', 'Suspicious mind', 'All-or-nothing intellect', 'Detects threats everywhere'],
      advice: ['Trust but verify', 'Channel intensity into research', 'Communicate openly when safe', 'Balance depth with lightness', 'Practice mental trust'],
    },
    sagittarius: {
      planet: 'mercury',
      sign: 'sagittarius',
      keywords: ['philosophical mind', 'optimistic thinking', 'broad perspective', 'truth-seeking', 'adventurous'],
      general: 'With Mercury in Sagittarius, your mind is philosophical, optimistic, and truth-seeking. You think big and focus on the broader meaning of things. You communicate with enthusiasm and love exploring new ideas and perspectives.',
      strengths: ['Big-picture thinker', 'Optimistic mind', 'Philosophical', 'Loves learning', 'Inspirational communicator'],
      challenges: ['Overestimates abilities', 'Impatient with details', 'Bluntly honest', 'Talks too much', 'Know-it-all tendencies'],
      advice: ['Balance vision with details', 'Practice tactful communication', 'Listen to opposing views', 'Follow through on learning', 'Stay humble in knowledge'],
    },
    capricorn: {
      planet: 'mercury',
      sign: 'capricorn',
      keywords: ['structured thinking', 'practical mind', 'disciplined', 'ambitious', 'cautious'],
      general: 'With Mercury in Capricorn, your mind is structured, practical, and disciplined. You think in terms of goals and long-term planning. Your communication is serious and you speak with authority and responsibility.',
      strengths: ['Strategic thinker', 'Disciplined mind', 'Practical intelligence', 'Organized thoughts', 'Authoritative communicator'],
      challenges: ['Pessimistic thinking', 'Rigid mental patterns', 'Serious communicator', 'Difficulty with abstract ideas', 'Mental cynicism'],
      advice: ['Cultivate mental optimism', 'Embrace creative thinking', 'Lighten your communication', 'Consider unconventional ideas', 'Balance work with play'],
    },
    aquarius: {
      planet: 'mercury',
      sign: 'aquarius',
      keywords: ['innovative thinking', 'unconventional mind', 'humanitarian', 'forward-thinking', 'independent'],
      general: 'With Mercury in Aquarius, your mind is innovative, unconventional, and forward-thinking. You excel at original ideas and thinking outside the box. Your communication is unique and you enjoy challenging conventional wisdom.',
      strengths: ['Innovative mind', 'Original thinker', 'Forward-looking', 'Humanitarian perspective', 'Independent intellect'],
      challenges: ['Eccentric thinking', 'Stubborn about being different', 'Emotionally detached mind', 'Rebellious ideas', 'Intellectual superiority'],
      advice: ['Balance innovation with practicality', 'Consider traditional wisdom', 'Connect mind with heart', 'Respect different viewpoints', 'Ground your futuristic ideas'],
    },
    pisces: {
      planet: 'mercury',
      sign: 'pisces',
      keywords: ['imaginative mind', 'intuitive thinking', 'dreamy', 'compassionate', 'impressionable'],
      general: 'With Mercury in Pisces, your mind is imaginative, intuitive, and spiritually oriented. You think in images and symbols rather than linear logic. Your communication is poetic and you perceive subtle meanings others miss.',
      strengths: ['Imaginative thinker', 'Intuitive mind', 'Creative communicator', 'Compassionate thoughts', 'Spiritual perspective'],
      challenges: ['Escapist thinking', 'Lacks mental focus', 'Overly impressionable', 'Difficulty with facts', 'Vague communication'],
      advice: ['Ground your imagination', 'Practice mental discipline', 'Distinguish intuition from fantasy', 'Communicate clearly and directly', 'Balance spirituality with practicality'],
    },
  },
  venus: {
    aries: {
      planet: 'venus',
      sign: 'aries',
      keywords: ['direct love style', 'passionate', 'independent in relationships', 'impulsive heart', 'challenging'],
      general: 'With Venus in Aries, your love style is direct, passionate, and independent. You pursue love with courage and enthusiasm. You fall in love quickly and express affection openly and assertively.',
      strengths: ['Passionate lover', 'Direct in affection', 'Independent in relationships', 'Enthusiastic partner', 'Courageous heart'],
      challenges: ['Impulsive in love', 'Falls out of love quickly', 'Self-centered in relationships', 'Needs constant excitement', 'Competitive in love'],
      advice: ['Practice patience in love', 'Consider partners\' needs', 'Nurture long-term relationships', 'Balance independence with intimacy', 'Think before acting romantically'],
    },
    taurus: {
      planet: 'venus',
      sign: 'taurus',
      keywords: ['sensual love', 'loyal', 'possessive', 'stable in relationships', 'romantic'],
      general: 'With Venus in Taurus (its rulership), your love style is sensual, loyal, and deeply committed. You express love through physical touch, quality time, and creating beautiful, comfortable environments.',
      strengths: ['Devoted partner', 'Sensual affection', 'Loyal lover', 'Creates beauty', 'Reliable in relationships'],
      challenges: ['Possessive in love', 'Resistant to change', 'Stubborn in relationships', 'Materialistic approach to love', 'Holds onto relationships too long'],
      advice: ['Practice emotional flexibility', 'Release unhealthy attachments', 'Share rather than possess', 'Embrace relationship growth', 'Love without conditions'],
    },
    gemini: {
      planet: 'venus',
      sign: 'gemini',
      keywords: ['playful love', 'curious heart', 'communicative in romance', 'variety in love', 'mentally stimulated'],
      general: 'With Venus in Gemini, your love style is playful, curious, and communicative. You need mental stimulation in relationships and express love through conversation, wit, and shared activities.',
      strengths: ['Playful partner', 'Great communicator', 'Adaptable in love', 'Socially charming', 'Keeps relationships fresh'],
      challenges: ['Restless heart', 'Needs constant novelty', 'Intellectualizes love', 'Difficulty with emotional depth', 'Flirtatious nature'],
      advice: ['Deepen emotional bonds', 'Practice consistency in love', 'Balance fun with depth', 'Commit to emotional growth', 'Listen with your heart'],
    },
    cancer: {
      planet: 'venus',
      sign: 'cancer',
      keywords: ['nurturing love', 'protective heart', 'emotional in relationships', 'family-oriented', 'sensitive'],
      general: 'With Venus in Cancer, your love style is nurturing, protective, and deeply emotional. You express love through caring and creating a safe, comfortable home for loved ones. Emotional security is essential in your relationships.',
      strengths: ['Nurturing partner', 'Emotionally giving', 'Creates safe spaces', 'Loyal and devoted', 'Intuitive in love'],
      challenges: ['Overly sensitive in love', 'Clingy in relationships', 'Emotional moodiness', 'Holds onto past relationships', 'Smothering affection'],
      advice: ['Develop emotional independence', 'Practice healthy boundaries', 'Release past relationship hurts', 'Balance giving with receiving', 'Trust your partner\'s love'],
    },
    leo: {
      planet: 'venus',
      sign: 'leo',
      keywords: ['romantic love', 'generous heart', 'loyal', 'dramatic in romance', 'proud partner'],
      general: 'With Venus in Leo, your love style is romantic, generous, and warmly expressive. You love with your whole heart and express affection grandly. You need appreciation and admiration in relationships.',
      strengths: ['Generous lover', 'Romantic and dramatic', 'Loyal partner', 'Warm affection', 'Celebrates love'],
      challenges: ['Needs constant admiration', 'Proud in relationships', 'Theatrical in love', 'Can be demanding', 'Hurt by lack of appreciation'],
      advice: ['Find validation within yourself', 'Love without need for applause', 'Appreciate partner\'s love quietly', 'Practice humility in romance', 'Share the romantic stage'],
    },
    virgo: {
      planet: 'venus',
      sign: 'virgo',
      keywords: ['practical love', 'service-oriented', 'discriminating heart', 'modest affection', 'analytical in relationships'],
      general: 'With Venus in Virgo, your love style is practical, service-oriented, and attentive to details. You express love through acts of service and by helping your partner improve. You seek a relationship that works efficiently and serves practical needs.',
      strengths: ['Helpful partner', 'Attentive to needs', 'Reliable in love', 'Improves relationships', 'Devoted service'],
      challenges: ['Critical in love', 'Perfectionist in relationships', 'Overly analytical about feelings', 'Self-sacrificing', 'Difficulty receiving affection'],
      advice: ['Accept love as it is', 'Practice emotional acceptance', 'Receive affection graciously', 'Relax your critical standards', 'Love imperfectly'],
    },
    libra: {
      planet: 'venus',
      sign: 'libra',
      keywords: ['harmonious love', 'romantic', 'partner-oriented', 'fair in relationships', 'indecisive in love'],
      general: 'With Venus in Libra (its rulership), your love style is romantic, harmonious, and partnership-oriented. You seek balance and beauty in relationships and express love through cooperation, romance, and creating aesthetic harmony.',
      strengths: ['Romantic and charming', 'Fair partner', 'Values harmony', 'Diplomatic in love', 'Creates beauty together'],
      challenges: ['Dependent on relationships', 'Indecisive in love', 'Loses self in partnership', 'Conflict-avoidant', 'Superficial in romance'],
      advice: ['Maintain your identity in love', 'Make decisions independently', 'Embrace necessary relationship conflict', 'Choose yourself sometimes', 'Deepen beyond harmony'],
    },
    scorpio: {
      planet: 'venus',
      sign: 'scorpio',
      keywords: ['intense love', 'transformative relationships', 'possessive', 'deeply committed', 'magnetic'],
      general: 'With Venus in Scorpio, your love style is intense, transformative, and all-consuming. You love deeply and seek emotional and soul-level connections. Trust and intimacy are paramount in your relationships.',
      strengths: ['Intensely loyal', 'Transformative love', 'Deeply committed', 'Emotionally fearless', 'Magnetic attraction'],
      challenges: ['Jealous and possessive', 'All-or-nothing in love', 'Holds grudges in relationships', 'Trust issues', 'Emotionally manipulative'],
      advice: ['Practice trust in love', 'Release possessiveness', 'Forgive relationship hurts', 'Balance intensity with lightness', 'Let love transform you positively'],
    },
    sagittarius: {
      planet: 'venus',
      sign: 'sagittarius',
      keywords: ['adventurous love', 'freedom-loving', 'philosophical in relationships', 'optimistic heart', 'commitment issues'],
      general: 'With Venus in Sagittarius, your love style is adventurous, freedom-loving, and optimistic. You seek partners who share your love of exploration and growth. You express love through sharing experiences and philosophical exploration.',
      strengths: ['Adventurous partner', 'Optimistic lover', 'Grows in relationships', 'Philosophical about love', 'Fun and inspiring'],
      challenges: ['Commitment issues', 'Needs total freedom', 'Restless in relationships', 'Philosophizes instead of feeling', 'Avoids emotional depth'],
      advice: ['Balance freedom with commitment', 'Practice emotional presence', 'Dive deep in relationships', 'Stay through challenges', 'Adventure within intimacy'],
    },
    capricorn: {
      planet: 'venus',
      sign: 'capricorn',
      keywords: ['committed love', 'responsible partner', 'ambitious in relationships', 'controlled affection', 'loyal'],
      general: 'With Venus in Capricorn, your love style is responsible, committed, and reserved. You take relationships seriously and express love through practical support, loyalty, and building a secure future together.',
      strengths: ['Loyal and committed', 'Responsible partner', 'Builds security', 'Enduring love', 'Practically romantic'],
      challenges: ['Emotionally reserved', 'Work before love', 'Difficulty expressing affection', 'Controlling in relationships', 'Traditional romance'],
      advice: ['Express emotions openly', 'Prioritize love over work', 'Vulnerability is strength', 'Practice spontaneous affection', 'Love is not achievement'],
    },
    aquarius: {
      planet: 'venus',
      sign: 'aquarius',
      keywords: ['unconventional love', 'friendly', 'independent heart', 'intellectual in romance', 'detached'],
      general: 'With Venus in Aquarius, your love style is unconventional, friendly, and intellectually-oriented. You seek partners who are also friends and value mental connection and independence within relationships.',
      strengths: ['Friendly lover', 'Unique expression of affection', 'Independent in relationships', 'Humanitarian heart', 'Visionary partner'],
      challenges: ['Emotionally detached', 'Friendships over romance', 'Intellectualizes love', 'Unconventional to a fault', 'Aloof in intimacy'],
      advice: ['Connect heart and mind', 'Embrace emotional vulnerability', 'Be present in intimacy', 'Romance is not weakness', 'Balance independence with closeness'],
    },
    pisces: {
      planet: 'venus',
      sign: 'pisces',
      keywords: ['romantic love', 'compassionate', 'self-sacrificing', 'spiritual relationships', 'idealistic'],
      general: 'With Venus in Pisces (exalted), your love style is romantic, compassionate, and spiritually-oriented. You love unconditionally and seek soulmate connections. You express love through empathy, creativity, and spiritual devotion.',
      strengths: ['Compassionate lover', 'Unconditional love', 'Romantic and dreamy', 'Spiritually connected', 'Creative expression of affection'],
      challenges: ['Sacrifices too much', 'Idealizes partners', 'Victim in relationships', 'Boundary issues in love', 'Escapist in romance'],
      advice: ['Maintain healthy boundaries', 'See partners realistically', 'Love yourself first', 'Ground romance in reality', 'Balance giving with receiving'],
    },
  },
  mars: {
    aries: {
      planet: 'mars',
      sign: 'aries',
      keywords: ['direct action', 'courageous', 'energetic', 'impulsive', 'pioneering'],
      general: 'With Mars in Aries (its rulership), your energy is direct, courageous, and action-oriented. You pursue goals with enthusiasm and attack challenges head-on. You assert yourself boldly and express anger openly and immediately.',
      strengths: ['Courageous action', 'Pioneering spirit', 'Quick to act', 'Assertive energy', 'Faces challenges directly'],
      challenges: ['Impulsive actions', 'Quick temper', 'Lacks patience', 'Starts but doesn\'t finish', 'Reckless energy'],
      advice: ['Think before acting', 'Patience brings success', 'Finish what you start', 'Channel energy constructively', 'Count to ten when angry'],
    },
    taurus: {
      planet: 'mars',
      sign: 'taurus',
      keywords: ['persistent action', 'steady energy', 'determined', 'patient', 'possessive'],
      general: 'With Mars in Taurus, your energy is steady, persistent, and determined. You pursue goals with endurance and maintain consistent effort. You assert yourself through steady pressure and unshakeable resolve.',
      strengths: ['Enduring energy', 'Persistent effort', 'Reliable action', 'Steadfast determination', 'Financial motivation'],
      challenges: ['Stubborn action', 'Resists change', 'Slow to start', 'Possessive nature', 'Holds grudges'],
      advice: ['Adapt when necessary', 'Release fixed strategies', 'Start projects sooner', 'Share rather than possess', 'Forgive to move forward'],
    },
    gemini: {
      planet: 'mars',
      sign: 'gemini',
      keywords: ['versatile action', 'quick energy', 'curious drive', 'communicative', 'scattered'],
      general: 'With Mars in Gemini, your energy is versatile, quick, and mentally-driven. You pursue multiple interests simultaneously and assert yourself through communication and intellectual debate. Your actions are adaptable and you excel at multi-tasking.',
      strengths: ['Versatile energy', 'Quick thinking in action', 'Adaptable strategies', 'Communicative assertion', 'Juggles multiple pursuits'],
      challenges: ['Scattered energy', 'Lacks focus', 'Superficial effort', 'Restless action', 'Talks more than does'],
      advice: ['Focus your energy', 'Deepen your efforts', 'Follow through consistently', 'Balance breadth with depth', 'Speak less, act more'],
    },
    cancer: {
      planet: 'mars',
      sign: 'cancer',
      keywords: ['emotional action', 'protective energy', 'defensive', 'moody drive', 'intuitive'],
      general: 'With Mars in Cancer, your energy is emotionally-driven, protective, and defensive. You assert yourself to protect emotional security and take action based on feelings. Your motivation comes from caring for others and creating safe spaces.',
      strengths: ['Protective energy', 'Defends loved ones', 'Intuitive action', 'Persistent when motivated', 'Nurturing drive'],
      challenges: ['Moody energy', 'Passive-aggressive action', 'Overly defensive', 'Emotional reactions', 'Indirect assertion'],
      advice: ['Direct communication of needs', 'Action from courage not fear', 'Establish emotional boundaries', 'Channel feelings constructively', 'Assert yourself proactively'],
    },
    leo: {
      planet: 'mars',
      sign: 'leo',
      keywords: ['confident action', 'creative energy', 'dramatic drive', 'proud', 'generous'],
      general: 'With Mars in Leo, your energy is confident, creative, and dramatic. You pursue goals with flair and natural leadership. You assert yourself proudly and express your energy through creative self-expression and warm generosity.',
      strengths: ['Confident action', 'Natural leader', 'Creative drive', 'Generous energy', 'Inspiring motivation'],
      challenges: ['Proud energy', 'Needs attention', 'Dramatic reactions', 'Arrogant assertion', 'Takes things personally'],
      advice: ['Lead through service', 'Share the spotlight', 'Act without need for applause', 'Handle criticism constructively', 'Channel ego into creativity'],
    },
    virgo: {
      planet: 'mars',
      sign: 'virgo',
      keywords: ['precise action', 'analytical energy', 'service-oriented', 'discriminating', 'perfecting'],
      general: 'With Mars in Virgo, your energy is precise, analytical, and service-oriented. You pursue goals through careful planning and attention to detail. You assert yourself through helping others and improving systems.',
      strengths: ['Precise action', 'Analytical strategy', 'Helpful energy', 'Improving efforts', 'Disciplined work'],
      challenges: ['Perfectionist action', 'Overly critical energy', 'Misses the big picture', 'Self-sacrificing drive', 'Workaholic tendencies'],
      advice: ['Embrace "good enough" action', 'See the forest for the trees', 'Receive help from others', 'Balance work with rest', 'Value effort over perfection'],
    },
    libra: {
      planet: 'mars',
      sign: 'libra',
      keywords: ['cooperative action', 'diplomatic energy', 'indecisive', 'fair', 'assertive for harmony'],
      general: 'With Mars in Libra, your energy is cooperative, diplomatic, and focused on partnership. You pursue goals through collaboration and assert yourself to create balance and fairness. You take action most effectively when working with others.',
      strengths: ['Cooperative energy', 'Diplomatic action', 'Fair-minded assertion', 'Partnership-oriented', 'Charming influence'],
      challenges: ['Indecisive action', 'Needs others\' approval', 'Suppresses anger', 'Asserts for others not self', 'Avoids conflict'],
      advice: ['Make independent decisions', 'Assert your own needs', 'Express anger constructively', 'Accept necessary conflict', 'Act alone when needed'],
    },
    scorpio: {
      planet: 'mars',
      sign: 'scorpio',
      keywords: ['intense action', 'strategic energy', 'determined', 'transformative', 'power-focused'],
      general: 'With Mars in Scorpio (its rulership), your energy is intense, strategic, and transformative. You pursue goals with complete determination and penetrate to the core of any situation. You assert yourself powerfully and have immense reservoirs of will.',
      strengths: ['Intense focus', 'Strategic action', 'Penetrating insight', 'Transformative energy', 'Unwavering determination'],
      challenges: ['Obsessive action', 'Vindictive anger', 'Controlling energy', 'All-or-nothing effort', 'Destructive potential'],
      advice: ['Channel intensity positively', 'Practice forgiveness', 'Release need for control', 'Transform rather than destroy', 'Use power to heal'],
    },
    sagittarius: {
      planet: 'mars',
      sign: 'sagittarius',
      keywords: ['adventurous action', 'optimistic energy', 'freedom-loving', 'direct', 'philosophical'],
      general: 'With Mars in Sagittarius, your energy is adventurous, optimistic, and freedom-loving. You pursue goals with enthusiasm and expand your horizons through action. You assert yourself through honesty and philosophical conviction.',
      strengths: ['Adventurous energy', 'Optimistic drive', 'Freedom-oriented action', 'Straightforward', 'Inspirational motivation'],
      challenges: ['Restless energy', 'Overestimates abilities', 'Direct to a fault', 'Lacks follow-through', 'Impatient with results'],
      advice: ['Focus your adventurous spirit', 'Follow through on commitments', 'Practice tactful honesty', 'Balance freedom with discipline', 'Finish what you start'],
    },
    capricorn: {
      planet: 'mars',
      sign: 'capricorn',
      keywords: ['disciplined action', 'ambitious energy', 'responsible', 'controlled', 'enduring'],
      general: 'With Mars in Capricorn, your energy is disciplined, ambitious, and controlled. You pursue long-term goals with patience and strategic planning. You assert yourself through achievement and building lasting structures.',
      strengths: ['Disciplined energy', 'Strategic action', 'Enduring effort', 'Ambitious drive', 'Responsible assertion'],
      challenges: ['Inhibited energy', 'Overly controlled action', 'Pessimistic drive', 'Fear of failure', 'Workaholic tendencies'],
      advice: ['Express energy freely', 'Take calculated risks', 'Cultivate optimism', 'Balance work with play', 'Enjoy the journey'],
    },
    aquarius: {
      planet: 'mars',
      sign: 'aquarius',
      keywords: ['innovative action', 'unconventional energy', 'independent', 'humanitarian', 'detached'],
      general: 'With Mars in Aquarius, your energy is innovative, unconventional, and independent. You pursue unique goals and assert yourself through originality and rebellion against the status quo. You fight for humanitarian causes and progressive ideals.',
      strengths: ['Innovative action', 'Independent energy', 'Humanitarian drive', 'Original strategies', 'Future-oriented'],
      challenges: ['Eccentric action', 'Rebellious without cause', 'Emotionally detached', 'Fixed opinions', 'Unpredictable energy'],
      advice: ['Channel innovation wisely', 'Connect passion with people', 'Collaborate with others', 'Respect useful traditions', 'Ground your futuristic visions'],
    },
    pisces: {
      planet: 'mars',
      sign: 'pisces',
      keywords: ['compassionate action', 'spiritual energy', 'adaptable', 'escapist', 'intuitive'],
      general: 'With Mars in Pisces, your energy is compassionate, spiritual, and adaptable. You pursue goals through intuition and spiritual connection. Your assertion is softened by empathy and you often act for the benefit of others.',
      strengths: ['Compassionate action', 'Intuitive drive', 'Adaptable energy', 'Spiritual motivation', 'Selfless efforts'],
      challenges: ['Escapist action', 'Lacks direction', 'Victim mentality', 'Diffuse energy', 'Passive assertion'],
      advice: ['Ground your spirituality', 'Set clear goals', 'Assert your own needs', 'Channel compassion into action', 'Dreams require action'],
    },
  },
  jupiter: {
    aries: {
      planet: 'jupiter',
      sign: 'aries',
      keywords: ['expansive action', 'pioneering growth', 'optimistic drive', 'courageous beliefs', 'independent philosophy'],
      general: 'With Jupiter in Aries, your expansion comes through courageous action and pioneering initiatives. You grow by taking risks, starting new ventures, and asserting your independence. Your beliefs are direct and you lead others through enthusiastic example.',
      strengths: ['Courageous expansion', 'Pioneering spirit', 'Optimistic beliefs', 'Independent growth', 'Inspires confidence'],
      challenges: ['Overestimates abilities', 'Impulsive growth', 'Self-centered philosophy', 'Starts but doesn\'t finish', 'Blind optimism'],
      advice: ['Follow through on ventures', 'Consider consequences', 'Include others in success', 'Balance courage with wisdom', 'Learn from mistakes'],
    },
    taurus: {
      planet: 'jupiter',
      sign: 'taurus',
      keywords: ['material growth', 'patient expansion', 'steady beliefs', 'sensual philosophy', 'possessive values'],
      general: 'With Jupiter in Taurus, your expansion comes through steady effort and material accumulation. You grow by building lasting value and enjoying life\'s pleasures. Your beliefs are practical and you find wisdom in nature and the material world.',
      strengths: ['Patient growth', 'Builds material security', 'Practical wisdom', 'Reliable expansion', 'Earthy philosophy'],
      challenges: ['Resists change', 'Overly attached to comfort', 'Stubborn beliefs', 'Possessive growth', 'Materialistic focus'],
      advice: ['Embrace necessary growth', 'Share your abundance', 'Release fixed patterns', 'Value spiritual growth too', 'Flexibility brings fortune'],
    },
    gemini: {
      planet: 'jupiter',
      sign: 'gemini',
      keywords: ['intellectual expansion', 'curious wisdom', 'communicative beliefs', 'versatile growth', 'teaching ability'],
      general: 'With Jupiter in Gemini, your expansion comes through learning, communication, and gathering diverse experiences. You grow by exploring multiple interests and sharing knowledge with others. Your beliefs are varied and you find wisdom in conversation.',
      strengths: ['Curious wisdom', 'Loves learning', 'Great teacher', 'Versatile growth', 'Communicative philosophy'],
      challenges: ['Scattered growth', 'Superficial beliefs', 'Know-it-all attitude', 'Lacks depth', 'Restless expansion'],
      advice: ['Focus your learning', 'Dive deeper into subjects', 'Listen more than teach', 'Balance breadth with depth', 'Finish what you start'],
    },
    cancer: {
      planet: 'jupiter',
      sign: 'cancer',
      keywords: ['emotional expansion', 'nurturing growth', 'protective beliefs', 'family-oriented wisdom', 'intuitive faith'],
      general: 'With Jupiter in Cancer, your expansion comes through emotional connection, family, and creating nurturing environments. You grow by caring for others and building emotional security. Your beliefs are emotionally-based and you find wisdom in feelings and intuition.',
      strengths: ['Nurturing growth', 'Emotional wisdom', 'Protective expansion', 'Intuitive faith', 'Creates emotional abundance'],
      challenges: ['Overprotective growth', 'Smothers others', 'Emotional dependency', 'Holds onto past', 'Moody beliefs'],
      advice: ['Allow others to grow independently', 'Release emotional attachments', 'Share your nurturing nature', 'Trust emotional growth', 'Balance giving with receiving'],
    },
    leo: {
      planet: 'jupiter',
      sign: 'leo',
      keywords: ['creative expansion', 'generous wisdom', 'confident beliefs', 'heart-centered growth', 'dramatic faith'],
      general: 'With Jupiter in Leo, your expansion comes through creative self-expression and generosity. You grow by sharing your talents and leading from the heart. Your beliefs are confident and you find wisdom through joyous self-expression.',
      strengths: ['Generous expansion', 'Creative wisdom', 'Confident beliefs', 'Warm-hearted growth', 'Inspirational leadership'],
      challenges: ['Needs constant admiration', 'Arrogant beliefs', 'Overestimates self', 'Dramatic faith', 'Proud wisdom'],
      advice: ['Humble leadership', 'Share the stage', 'Give without need for praise', 'True confidence needs applause', 'Serve through creativity'],
    },
    virgo: {
      planet: 'jupiter',
      sign: 'virgo',
      keywords: ['practical expansion', 'service-oriented growth', 'analytical wisdom', 'perfecting beliefs', 'discriminating faith'],
      general: 'With Jupiter in Virgo, your expansion comes through service, analysis, and continual improvement. You grow by helping others and refining systems. Your beliefs are practical and you find wisdom in details and efficient processes.',
      strengths: ['Service-oriented expansion', 'Practical wisdom', 'Analytical beliefs', 'Helpful growth', 'Improves systems'],
      challenges: ['Perfectionist faith', 'Overly critical', 'Misses the big picture', 'Self-sacrificing', 'Worry blocks growth'],
      advice: ['Embrace imperfection', 'See the forest for the trees', 'Practice self-compassion', 'Receive help graciously', 'Value the process'],
    },
    libra: {
      planet: 'jupiter',
      sign: 'libra',
      keywords: ['harmonious expansion', 'relationship-oriented growth', 'balanced wisdom', 'fair beliefs', 'cooperative faith'],
      general: 'With Jupiter in Libra, your expansion comes through partnerships and creating harmony. You grow through relationships and finding balance between opposites. Your beliefs are diplomatic and you find wisdom in beauty and justice.',
      strengths: ['Harmonious growth', 'Diplomatic wisdom', 'Fair-minded beliefs', 'Partnership expansion', 'Creates beauty'],
      challenges: ['Dependent expansion', 'People-pleasing faith', 'Indecisive beliefs', 'Loses self in relationships', 'Superficial harmony'],
      advice: ['Grow independently too', 'Make your own decisions', 'Embrace necessary conflict', 'Find balance within', 'Assert your own needs'],
    },
    scorpio: {
      planet: 'jupiter',
      sign: 'scorpio',
      keywords: ['transformative expansion', 'deep wisdom', 'intense growth', 'occult interests', 'regenerative faith'],
      general: 'With Jupiter in Scorpio, your expansion comes through deep transformation and psychological exploration. You grow by facing your shadows and embracing change. Your beliefs are intense and you find wisdom in life\'s mysteries and hidden truths.',
      strengths: ['Transformative growth', 'Deep wisdom', 'Regenerative faith', 'Psychological insight', 'Healing abilities'],
      challenges: ['Obsessive beliefs', 'All-or-nothing faith', 'Suspicious of others', 'Controlling expansion', 'Vindictive wisdom'],
      advice: ['Release and forgive', 'Trust the process', 'Share your transformation', 'Lighten your intensity', 'Heal rather than destroy'],
    },
    sagittarius: {
      planet: 'jupiter',
      sign: 'sagittarius',
      keywords: ['adventurous expansion', 'philosophical growth', 'optimistic beliefs', 'freedom-loving faith', 'exploratory wisdom'],
      general: 'With Jupiter in Sagittarius (its rulership), your expansion comes through exploration, philosophy, and seeking truth. You grow by traveling, learning, and expanding your horizons. Your beliefs are optimistic and you find wisdom in diverse experiences and higher meaning.',
      strengths: ['Optimistic growth', 'Philosophical wisdom', 'Adventure brings fortune', 'Expansive faith', 'Inspirational teacher'],
      challenges: ['Overextends self', 'Overconfident beliefs', 'Restless expansion', 'Preaches more than practices', 'Excessive freedom'],
      advice: ['Practice moderation', 'Walk your talk', 'Commit to deep learning', 'Ground your visions', 'Stay present during expansion'],
    },
    capricorn: {
      planet: 'jupiter',
      sign: 'capricorn',
      keywords: ['ambitious expansion', 'structured growth', 'responsible wisdom', 'conservative beliefs', 'enduring faith'],
      general: 'With Jupiter in Capricorn, your expansion comes through disciplined effort, achievement, and building lasting structures. You grow through professional success and taking responsibility. Your beliefs are traditional and you find wisdom in established systems.',
      strengths: ['Ambitious growth', 'Responsible expansion', 'Structural wisdom', 'Enduring success', 'Professional fortune'],
      challenges: ['Overly serious', 'Workaholic growth', 'Traditional mindset', 'Pessimistic faith', 'Cautious expansion'],
      advice: ['Balance work with joy', 'Embrace innovation', 'Cultivate optimism', 'Take calculated risks', 'Enjoy the journey'],
    },
    aquarius: {
      planet: 'jupiter',
      sign: 'aquarius',
      keywords: ['innovative expansion', 'humanitarian growth', 'progressive beliefs', 'unconventional wisdom', 'collective faith'],
      general: 'With Jupiter in Aquarius, your expansion comes through innovation, humanitarian efforts, and community involvement. You grow by embracing uniqueness and contributing to collective progress. Your beliefs are progressive and you find wisdom in futuristic visions.',
      strengths: ['Innovative growth', 'Humanitarian expansion', 'Progressive wisdom', 'Community-oriented', 'Visionary beliefs'],
      challenges: ['Eccentric growth', 'Fixed opinions about freedom', 'Detached wisdom', 'Rebellious faith', 'Unrealistic ideals'],
      advice: ['Ground your visions', 'Connect with individuals', 'Practice emotional warmth', 'Balance innovation with tradition', 'Make ideals practical'],
    },
    pisces: {
      planet: 'jupiter',
      sign: 'pisces',
      keywords: ['spiritual expansion', 'compassionate growth', 'mystical wisdom', 'forgiving faith', 'dream-based beliefs'],
      general: 'With Jupiter in Pisces (exalted), your expansion comes through spiritual connection, compassion, and transcending ordinary reality. You grow through forgiveness, spiritual practice, and artistic expression. Your beliefs are universal and you find wisdom in unity and divine love.',
      strengths: ['Spiritual growth', 'Compassionate wisdom', 'Mystical faith', 'Forgiving beliefs', 'Artistic expansion'],
      challenges: ['Escapist growth', 'Victim mentality', 'Lacks boundaries', 'Over-sacrificing', 'Illusionary beliefs'],
      advice: ['Ground your spirituality', 'Maintain healthy boundaries', 'Face reality directly', 'Balance giving with receiving', 'Integrate spiritual insights'],
    },
  },
  saturn: {
    aries: {
      planet: 'saturn',
      sign: 'aries',
      keywords: ['independent discipline', 'courageous restrictions', 'pioneering challenges', 'impulsive limits', 'self-reliance lessons'],
      general: 'With Saturn in Aries, you learn discipline through independent action and courageous initiative. Your challenges involve learning patience and controlling impulsive tendencies. You grow by becoming a courageous, self-reliant leader who acts wisely rather than rashly.',
      strengths: ['Self-disciplined action', 'Courageous endurance', 'Independent strength', 'Pioneering resilience', 'Initiates wisely'],
      challenges: ['Impulsive self-control', 'Quick temper', 'Acts without thinking', 'Rash limitations', 'Self-centered discipline'],
      advice: ['Think before acting', 'Patience brings mastery', 'Lead by example', 'Consider consequences', 'Channel courage constructively'],
    },
    taurus: {
      planet: 'saturn',
      sign: 'taurus',
      keywords: ['stable discipline', 'material restrictions', 'patient challenges', 'possessive limits', 'steady lessons'],
      general: 'With Saturn in Taurus, you learn discipline through building stability and managing resources. Your challenges involve learning security comes from within and releasing attachments. You grow by becoming patient, persistent, and financially wise.',
      strengths: ['Enduring patience', 'Reliable discipline', 'Practical limitations', 'Steadfast persistence', 'Builds security'],
      challenges: ['Stubborn resistance', 'Fear of change', 'Materialistic limits', 'Possessive discipline', 'Slow to adapt'],
      advice: ['Embrace necessary change', 'Release attachments', 'Find security within', 'Practice flexibility', 'Share your resources'],
    },
    gemini: {
      planet: 'saturn',
      sign: 'gemini',
      keywords: ['mental discipline', 'communication restrictions', 'curious challenges', 'scattered limits', 'focused lessons'],
      general: 'With Saturn in Gemini, you learn discipline through mental focus and effective communication. Your challenges involve overcoming scattered thinking and superficial learning. You grow by developing concentrated attention, speaking with purpose, and thinking deeply.',
      strengths: ['Focused mind', 'Disciplined communication', 'Concentrated learning', 'Careful speech', 'Structured thinking'],
      challenges: ['Anxious thinking', 'Rigid mental patterns', 'Communication blocks', 'Scattered self-control', 'Superficial limits'],
      advice: ['Focus your mental energy', 'Dive deep into learning', 'Speak purposefully', 'Overcome anxiety', 'Structure your curiosity'],
    },
    cancer: {
      planet: 'saturn',
      sign: 'cancer',
      keywords: ['emotional discipline', 'family restrictions', 'nurturing challenges', 'insecure limits', 'foundational lessons'],
      general: 'With Saturn in Cancer, you learn discipline through emotional maturity and creating inner security. Your challenges involve overcoming emotional dependency and fear of abandonment. You grow by building strong foundations, nurturing yourself, and developing emotional resilience.',
      strengths: ['Emotional resilience', 'Self-nurturing', 'Disciplined feelings', 'Creates security', 'Protective boundaries'],
      challenges: ['Emotional insecurity', 'Overprotective discipline', 'Fear of abandonment', 'Moody restrictions', 'Family burdens'],
      advice: ['Parent yourself', 'Build emotional security within', 'Release family patterns', 'Trust in relationships', 'Honor your feelings'],
    },
    leo: {
      planet: 'saturn',
      sign: 'leo',
      keywords: ['creative discipline', 'pride restrictions', 'leadership challenges', 'attention limits', 'self-expression lessons'],
      general: 'With Saturn in Leo, you learn discipline through creative mastery and humble leadership. Your challenges involve overcoming need for external validation and ego-driven behavior. You grow by developing authentic self-expression and leading through service rather than dominance.',
      strengths: ['Humble creativity', 'Authentic leadership', 'Disciplined self-expression', 'Enduring recognition', 'Mature pride'],
      challenges: ['Inhibited creativity', 'Prideful limitations', 'Needs approval', 'Self-conscious leadership', 'Arrogant discipline'],
      advice: ['Express yourself authentically', 'Lead through service', 'Find validation within', 'Practice humility', 'Share your gifts'],
    },
    virgo: {
      planet: 'saturn',
      sign: 'virgo',
      keywords: ['analytical discipline', 'perfectionism restrictions', 'service challenges', 'critical limits', 'detailed lessons'],
      general: 'With Saturn in Virgo (dignity), you learn discipline through analysis, service, and attention to detail. Your challenges involve overcoming perfectionism and self-criticism. You grow by accepting imperfection, serving with wisdom, and finding value in practical work.',
      strengths: ['Analytical mastery', 'Detailed discipline', 'Service with wisdom', 'Practical perfection', 'Reliable skills'],
      challenges: ['Perfectionist self-control', 'Overly critical', 'Worry and anxiety', 'Self-sacrificing service', 'Rigid standards'],
      advice: ['Accept "good enough"', 'Compassionate criticism', 'Balance work and rest', 'Value your efforts', 'Trust the process'],
    },
    libra: {
      planet: 'saturn',
      sign: 'libra',
      keywords: ['relationship discipline', 'partnership restrictions', 'harmony challenges', 'indecisive limits', 'balance lessons'],
      general: 'With Saturn in Libra, you learn discipline through relationships and achieving balance. Your challenges involve overcoming dependency on others and avoiding necessary conflict. You grow by developing healthy interdependence, making firm decisions, and creating lasting partnerships.',
      strengths: ['Committed relationships', 'Fair discipline', 'Diplomatic boundaries', 'Lasting partnerships', 'Balanced decisions'],
      challenges: ['People-pleasing control', 'Indecisive restrictions', 'Fear of conflict', 'Loses self in relationships', 'Codependent patterns'],
      advice: ['Decide independently', 'Embrace necessary conflict', 'Develop your own identity', 'Balance self with others', 'Commit to healthy relationships'],
    },
    scorpio: {
      planet: 'saturn',
      sign: 'scorpio',
      keywords: ['intense discipline', 'emotional restrictions', 'transformative challenges', 'fear-based limits', 'depth lessons'],
      general: 'With Saturn in Scorpio (dignity), you learn discipline through emotional transformation and facing fears. Your challenges involve overcoming control issues, emotional holding, and fear of vulnerability. You grow by releasing the past, embracing change, and developing emotional mastery.',
      strengths: ['Emotional mastery', 'Transformative discipline', 'Deep resilience', 'Psychological wisdom', 'Regenerative power'],
      challenges: ['Controlling restrictions', 'Fear of vulnerability', 'Holds onto pain', 'Obsessive limits', 'Distrusting boundaries'],
      advice: ['Release control', 'Practice emotional surrender', 'Forgive to move forward', 'Trust the transformation', 'Transform fear into power'],
    },
    sagittarius: {
      planet: 'saturn',
      sign: 'sagittarius',
      keywords: ['philosophical discipline', 'freedom restrictions', 'adventure challenges', 'optimistic limits', 'truth lessons'],
      general: 'With Saturn in Sagittarius, you learn discipline through focused study and ethical living. Your challenges involve overcoming restlessness and overextending yourself. You grow by developing wisdom through experience, practicing what you preach, and committing to deep learning.',
      strengths: ['Wise discipline', 'Ethical living', 'Committed learner', 'Focused expansion', 'Philosophical wisdom'],
      challenges: ['Restless self-control', 'Preachy limits', 'Overestimates abilities', 'Scattered focus', 'Unrealistic optimism'],
      advice: ['Follow through on learning', 'Practice what you preach', 'Focus your energy', 'Commit to depth', 'Walk your talk'],
    },
    capricorn: {
      planet: 'saturn',
      sign: 'capricorn',
      keywords: ['ambitious discipline', 'authority restrictions', 'achievement challenges', 'serious limits', 'responsibility lessons'],
      general: 'With Saturn in Capricorn (its rulership), you learn discipline through achievement, responsibility, and mastery. Your challenges involve overcoming pessimism and fear of failure. You grow by building lasting structures, assuming authority wisely, and achieving through persistent effort.',
      strengths: ['Masterful discipline', 'Enduring achievement', 'Wise authority', 'Strategic patience', 'Lasting success'],
      challenges: ['Pessimistic outlook', 'Fear of failure', 'Overly serious', 'Inhibited self-expression', 'Workaholic tendencies'],
      advice: ['Cultivate optimism', 'Embrace appropriate risks', 'Balance work and life', 'Express vulnerability', 'Enjoy the journey'],
    },
    aquarius: {
      planet: 'saturn',
      sign: 'aquarius',
      keywords: ['innovative discipline', 'freedom restrictions', 'community challenges', 'unconventional limits', 'independence lessons'],
      general: 'With Saturn in Aquarius, you learn discipline through innovation, community involvement, and balancing individuality with collectivism. Your challenges involve overcoming emotional detachment and rebelliousness. You grow by using your originality responsibly and contributing to lasting progress.',
      strengths: ['Innovative structure', 'Community discipline', 'Original wisdom', 'Lasting progress', 'Humanitarian authority'],
      challenges: ['Eccentric restrictions', 'Rebellious control', 'Emotional detachment', 'Fixed opinions', 'Unrealistic ideals'],
      advice: ['Connect with others emotionally', 'Use originality constructively', 'Collaborate for lasting change', 'Ground your innovations', 'Balance freedom with responsibility'],
    },
    pisces: {
      planet: 'saturn',
      sign: 'pisces',
      keywords: ['spiritual discipline', 'compassion restrictions', 'reality challenges', 'escapist limits', 'boundaries lessons'],
      general: 'With Saturn in Pisces (dignity), you learn discipline through spiritual practice and distinguishing reality from illusion. Your challenges involve overcoming escapism and boundary issues. You grow by developing healthy boundaries, practicing spiritual discipline, and bringing compassion into practical action.',
      strengths: ['Spiritual mastery', 'Healthy boundaries', 'Practical compassion', 'Clear discernment', 'Wisdom from suffering'],
      challenges: ['Escapist restrictions', 'Victim mentality', 'Boundary confusion', 'Diffuse self-control', 'Illusory limits'],
      advice: ['Face reality directly', 'Maintain strong boundaries', 'Ground your spirituality', 'Compassion requires boundaries', 'Integrate spiritual wisdom'],
    },
  },
  uranus: {
    aries: {
      planet: 'uranus',
      sign: 'aries',
      keywords: ['radical independence', 'rebellious initiative', 'innovative action', 'sudden changes', 'pioneering originality'],
      general: 'With Uranus in Aries, your originality expresses through courageous innovation and rebellion against convention. You initiate sudden changes and pioneer new paths. Your genius is direct and you break through barriers with assertive independence.',
      strengths: ['Pioneering innovation', 'Assertive originality', 'Courageous rebellion', 'Sudden breakthroughs', 'Independent genius'],
      challenges: ['Rebellious without cause', 'Impulsive innovation', 'Disrupts for disruption\'s sake', 'Self-centered originality', 'Abrupt changes'],
      advice: ['Channel rebellion wisely', 'Consider impact of changes', 'Innovate for others\' benefit', 'Listen to wise counsel', 'Persist in your innovations'],
    },
    taurus: {
      planet: 'uranus',
      sign: 'taurus',
      keywords: ['practical innovation', 'stubborn originality', 'material revolution', 'sudden changes in values', 'stability disruptions'],
      general: 'With Uranus in Taurus, your originality expresses through practical innovation and revolutionizing material security. You challenge traditional values and introduce new approaches to resources and stability.',
      strengths: ['Practical innovation', 'Lasting changes', 'Material revolution', 'Stable originality', 'Enduring genius'],
      challenges: ['Stubborn unconventionality', 'Resists necessary change', 'Fixed innovations', 'Disrupts security', 'Possessive originality'],
      advice: ['Embrace necessary evolution', 'Flexibility brings progress', 'Innovate sustainably', 'Release old values', 'Trust change'],
    },
    gemini: {
      planet: 'uranus',
      sign: 'gemini',
      keywords: ['intellectual revolution', 'innovative communication', 'unconventional ideas', 'mental breakthroughs', 'freedom of thought'],
      general: 'With Uranus in Gemini, your originality expresses through innovative thinking and revolutionary communication. You challenge traditional ideas and introduce new mental concepts. Your genius is quick and you communicate in unique, original ways.',
      strengths: ['Brilliant innovation', 'Revolutionary ideas', 'Original communication', 'Mental breakthroughs', 'Quick genius'],
      challenges: ['Scattered originality', 'Superficial innovation', 'Eccentric communication', 'Rebellious thinking', 'Unfocused brilliance'],
      advice: ['Focus your innovations', 'Deepen your original ideas', 'Communicate clearly', 'Persist with breakthroughs', 'Ground your genius'],
    },
    cancer: {
      planet: 'uranus',
      sign: 'cancer',
      keywords: ['emotional innovation', 'domestic revolution', 'unconventional nurturing', 'sensitive changes', 'family disruptions'],
      general: 'With Uranus in Cancer, your originality expresses through emotional freedom and revolutionizing domestic life. You challenge traditional family roles and introduce new approaches to nurturing and security.',
      strengths: ['Emotional freedom', 'Innovative nurturing', 'Domestic breakthroughs', 'Intuitive genius', 'Liberating care'],
      challenges: ['Unpredictable emotions', 'Family disruptions', 'Detached nurturing', 'Restless security', 'Unconventional families'],
      advice: ['Balance freedom with bonding', 'Honor need for roots', 'Innovate family patterns', 'Emotional authenticity', 'Revolutionize with care'],
    },
    leo: {
      planet: 'uranus',
      sign: 'leo',
      keywords: ['creative revolution', 'innovative self-expression', 'unique leadership', 'dramatic originality', 'unconventional creativity'],
      general: 'With Uranus in Leo, your originality expresses through creative innovation and unique self-expression. You challenge traditional forms of art and leadership. Your genius is dramatic and you shine through your unconventional, authentic expression.',
      strengths: ['Creative innovation', 'Unique leadership', 'Authentic expression', 'Dramatic genius', 'Inspires originality'],
      challenges: ['Eccentric creativity', 'Needs unique attention', 'Rebellious self-expression', 'Disrupts traditions', 'Arrogant originality'],
      advice: ['Create for the joy of it', 'Share the spotlight', 'Innovate art forms', 'Express authentically', 'Revolutionize through creativity'],
    },
    virgo: {
      planet: 'uranus',
      sign: 'virgo',
      keywords: ['analytical innovation', 'practical genius', 'unconventional service', 'mental revolution', 'healing breakthroughs'],
      general: 'With Uranus in Virgo, your originality expresses through innovative analysis and revolutionary approaches to service. You challenge traditional systems and introduce new methods of healing and improvement.',
      strengths: ['Analytical genius', 'Innovative service', 'Revolutionary methods', 'Healing innovations', 'Systems breakthroughs'],
      challenges: ['Eccentric perfectionism', 'Scattered improvements', 'Rebellious service', 'Critical unconventionality', 'Overthinks innovations'],
      advice: ['Implement your innovations', 'Balance analysis with intuition', 'Serve through originality', 'Revolutionize with care', 'Simplify your genius'],
    },
    libra: {
      planet: 'uranus',
      sign: 'libra',
      keywords: ['social revolution', 'innovative relationships', 'unconventional partnerships', 'freedom in love', 'unique harmony'],
      general: 'With Uranus in Libra, your originality expresses through social innovation and revolutionizing relationships. You challenge traditional partnership roles and introduce new approaches to harmony and cooperation.',
      strengths: ['Social innovation', 'Unique relationships', 'Partnership freedom', 'Revolutionary harmony', 'Progressive aesthetics'],
      challenges: ['Unreliable in love', 'Eccentric social values', 'Relationship disruptions', 'Needs total freedom', 'Rebellious partnerships'],
      advice: ['Balance freedom with commitment', 'Innovate relationships wisely', 'Honor connection needs', 'Revolutionize with beauty', 'Unique but connected'],
    },
    scorpio: {
      planet: 'uranus',
      sign: 'scorpio',
      keywords: ['transformative innovation', 'emotional breakthroughs', 'unconventional depth', 'psychological revolution', 'radical intimacy'],
      general: 'With Uranus in Scorpio, your originality expresses through emotional transformation and revolutionary psychological insight. You challenge taboos and introduce new approaches to intimacy, power, and healing.',
      strengths: ['Transformative genius', 'Emotional breakthroughs', 'Psychological innovation', 'Healing revolutions', 'Radical intimacy'],
      challenges: ['Obsessive unconventionality', 'Volatile emotions', 'Disrupts taboos recklessly', 'Control through rebellion', 'Extremes in intimacy'],
      advice: ['Channel innovation into healing', 'Emotional freedom with wisdom', 'Transform through insight', 'Break taboos carefully', 'Integrate your breakthroughs'],
    },
    sagittarius: {
      planet: 'uranus',
      sign: 'sagittarius',
      keywords: ['philosophical revolution', 'innovative truth-seeking', 'unconventional freedom', 'mental breakthroughs', 'unique wisdom'],
      general: 'With Uranus in Sagittarius, your originality expresses through philosophical innovation and revolutionary truth-seeking. You challenge traditional beliefs and introduce new spiritual and intellectual paradigms.',
      strengths: ['Philosophical genius', 'Truth innovations', 'Freedom revolutions', 'Mental breakthroughs', 'Spiritual originality'],
      challenges: ['Rebellious beliefs', 'Uncommitted truth', 'Scattered philosophy', 'Preaches unconventionality', 'Extreme freedom'],
      advice: ['Commit to your truths', 'Walk your innovative path', 'Teach through example', 'Ground your visions', 'Balance freedom with discipline'],
    },
    capricorn: {
      planet: 'uranus',
      sign: 'capricorn',
      keywords: ['structural revolution', 'innovative authority', 'unconventional ambition', 'system breakthroughs', 'radical achievement'],
      general: 'With Uranus in Capricorn, your originality expresses through structural innovation and revolutionizing institutions. You challenge traditional authority and introduce new approaches to achievement, business, and governance.',
      strengths: ['Structural genius', 'Innovative leadership', 'System revolutions', 'Progressive authority', 'Lasting reforms'],
      challenges: ['Unreliable authority', 'Rebellious achievement', 'Disrupts necessary structures', 'Anarchic tendencies', 'Eccentric ambition'],
      advice: ['Innovate from within', 'Respect useful traditions', 'Build lasting change', 'Responsible innovation', 'Revolution with wisdom'],
    },
    aquarius: {
      planet: 'uranus',
      sign: 'aquarius',
      keywords: ['humanitarian revolution', 'collective innovation', 'technological genius', 'radical freedom', 'future vision'],
      general: 'With Uranus in Aquarius (its rulership), your originality is at its most powerful and authentic. You represent revolutionary change, technological advancement, and collective evolution. Your genius serves humanity\'s progress.',
      strengths: ['Collective genius', 'Technological innovation', 'Humanitarian revolution', 'Visionary leadership', 'Social progress'],
      challenges: ['Eccentric humanity', 'Detached from people', 'Fixed opinions on freedom', 'Rebellious without purpose', 'Unrealistic innovations'],
      advice: ['Connect your genius with people', 'Ground your humanitarian vision', 'Collaborate for change', 'Practice emotional warmth', 'Make innovation practical'],
    },
    pisces: {
      planet: 'uranus',
      sign: 'pisces',
      keywords: ['spiritual innovation', 'mystical breakthroughs', 'unconventional compassion', 'artistic revolution', 'intuitive genius'],
      general: 'With Uranus in Pisces, your originality expresses through spiritual innovation and mystical breakthroughs. You challenge traditional spirituality and introduce new approaches to healing, art, and transcendent experience.',
      strengths: ['Spiritual genius', 'Mystical innovation', 'Artistic revolution', 'Intuitive breakthroughs', 'Healing originality'],
      challenges: ['Escapist innovation', 'Illusory genius', 'Confused originality', 'Disorganized spirituality', 'Overwhelming sensitivity'],
      advice: ['Ground your innovations', 'Balance mysticism with reality', 'Channel breakthroughs wisely', 'Spiritual discipline', 'Artistic structure'],
    },
  },
  neptune: {
    aries: {
      planet: 'neptune',
      sign: 'aries',
      keywords: ['spiritual initiative', 'mystical action', 'compassionate courage', 'spiritual warrior', 'idealistic energy'],
      general: 'With Neptune in Aries, your spirituality expresses through compassionate action and spiritual initiative. You pursue spiritual goals with courage and fight for humanitarian causes. Your ideals are direct and you seek to infuse the material world with spiritual purpose.',
      strengths: ['Spiritual warrior', 'Compassionate action', 'Idealistic courage', 'Mystical initiative', 'Inspired leadership'],
      challenges: ['Impulsive spirituality', 'Martyr tendencies', 'Illusory courage', 'Disorganized compassion', 'Vague direction'],
      advice: ['Ground your spirituality', 'Focus your compassion', 'Spiritual discipline', 'Direct your ideals', 'Practice discernment'],
    },
    taurus: {
      planet: 'neptune',
      sign: 'taurus',
      keywords: ['spiritual stability', 'practical mysticism', 'sensory spirituality', 'earthy devotion', 'material idealism'],
      general: 'With Neptune in Taurus, your spirituality expresses through practical devotion and finding the sacred in nature. You seek spiritual security and find the divine in sensory experiences and material abundance.',
      strengths: ['Practical spirituality', 'Devotional stability', 'Nature mysticism', 'Earthy devotion', 'Material idealism'],
      challenges: ['Possessive spirituality', 'Stubborn beliefs', 'Escapist materialism', 'Sensual indulgence', 'Fixed devotion'],
      advice: ['Share your spiritual abundance', 'Embrace spiritual growth', 'Find the sacred in change', 'Practice detachment', 'Ground your mysticism'],
    },
    gemini: {
      planet: 'neptune',
      sign: 'gemini',
      keywords: ['spiritual curiosity', 'mystical communication', 'intuitive learning', 'compassionate intellect', 'versatile devotion'],
      general: 'With Neptune in Gemini, your spirituality expresses through diverse exploration and communicating mystical truths. You seek spiritual knowledge through varied experiences and share your insights through inspired communication.',
      strengths: ['Intuitive learning', 'Mystical communication', 'Compassionate mind', 'Spiritual curiosity', 'Inspirational speaker'],
      challenges: ['Scattered spirituality', 'Superficial mysticism', 'Illusory knowledge', 'Confused beliefs', 'Escapist intellect'],
      advice: ['Focus your spiritual path', 'Dive deep into practices', 'Ground your insights', 'Communicate truth', 'Consistent devotion'],
    },
    cancer: {
      planet: 'neptune',
      sign: 'cancer',
      keywords: ['spiritual nurturing', 'mystical compassion', 'emotional devotion', 'psychic sensitivity', 'collective intuition'],
      general: 'With Neptune in Cancer, your spirituality expresses through emotional depth and universal nurturing. You feel collective emotions and seek to offer spiritual comfort to all. Your intuition is profound and you sense emotional undercurrents.',
      strengths: ['Compassionate intuition', 'Spiritual nurturing', 'Psychic sensitivity', 'Universal mothering', 'Emotional healing'],
      challenges: ['Overwhelming sensitivity', 'Emotional boundaries', 'Absorbs collective pain', 'Spiritual escapism', 'Martyr consciousness'],
      advice: ['Maintain spiritual boundaries', 'Protect your sensitivity', 'Heal yourself first', 'Ground your intuition', 'Spiritual self-care'],
    },
    leo: {
      planet: 'neptune',
      sign: 'leo',
      keywords: ['spiritual creativity', 'mystical performance', 'devotional art', 'idealistic leadership', 'romantic spirituality'],
      general: 'With Neptune in Leo, your spirituality expresses through creative devotion and inspired self-expression. You seek spiritual meaning through art and performance, and you lead others through inspiring visions.',
      strengths: ['Creative spirituality', 'Inspiring visions', 'Devotional art', 'Romantic mysticism', 'Dramatic devotion'],
      challenges: ['Needs spiritual applause', 'Theatrical devotion', 'Idealizes leaders', 'Grandiose spirituality', 'Ego in spirituality'],
      advice: ['Create for the divine', 'Inspire without ego', 'Serve through creativity', 'Authentic devotion', 'Share the spiritual stage'],
    },
    virgo: {
      planet: 'neptune',
      sign: 'virgo',
      keywords: ['spiritual service', 'mystical healing', 'practical devotion', 'discriminating compassion', 'analytical spirituality'],
      general: 'With Neptune in Virgo, your spirituality expresses through humble service and healing work. You seek the divine in practical service and offer compassionate care through detailed attention to needs.',
      strengths: ['Healing spirituality', 'Humble service', 'Practical mysticism', 'Compassionate discrimination', 'Devotional details'],
      challenges: ['Self-sacrificing service', 'Spiritual perfectionism', 'Worries spiritually', 'Overly critical compassion', 'Escapist work'],
      advice: ['Serve with healthy boundaries', 'Embrace spiritual imperfection', 'Trust the divine plan', 'Compassion without worry', 'Rest in service'],
    },
    libra: {
      planet: 'neptune',
      sign: 'libra',
      keywords: ['spiritual harmony', 'mystical partnerships', 'idealistic relationships', 'universal compassion', 'beauty devotion'],
      general: 'With Neptune in Libra, your spirituality expresses through seeking divine harmony and sacred partnership. You see the divine in beauty and seek spiritual connection through relationships and artistic appreciation.',
      strengths: ['Spiritual diplomacy', 'Universal compassion', 'Sees divine beauty', 'Romantic spirituality', 'Harmonious devotion'],
      challenges: ['Dependent spirituality', 'Illusory relationships', 'Codependent compassion', 'Superficial devotion', 'Escapist romance'],
      advice: ['Find spiritual independence', 'See relationships clearly', 'Compassion with wisdom', 'Deep spiritual bonds', 'Beauty within'],
    },
    scorpio: {
      planet: 'neptune',
      sign: 'scorpio',
      keywords: ['spiritual transformation', 'mystical depth', 'psychic healing', 'emotional alchemy', 'divine magic'],
      general: 'With Neptune in Scorpio, your spirituality expresses through deep transformation and emotional alchemy. You seek mystical experiences that dissolve ego boundaries and you possess powerful healing abilities.',
      strengths: ['Transformative spirituality', 'Psychic healing', 'Emotional alchemy', 'Mystical depth', 'Regenerative devotion'],
      challenges: ['Escapist transformation', 'Obsessive spirituality', 'Psychic overwhelm', 'Emotional merge', 'Power struggles'],
      advice: ['Healthy transformation', 'Release emotional power', 'Ground your psychic abilities', 'Transmute pain into wisdom', 'Spiritual surrender'],
    },
    sagittarius: {
      planet: 'neptune',
      sign: 'sagittarius',
      keywords: ['spiritual exploration', 'mystical philosophy', 'idealistic truth', 'compassionate wisdom', 'divine freedom'],
      general: 'With Neptune in Sagittarius, your spirituality expresses through seeking truth and exploring diverse spiritual paths. You pursue spiritual freedom and find meaning in philosophical exploration and compassionate wisdom.',
      strengths: ['Spiritual philosopher', 'Compassionate wisdom', 'Universal truth-seeker', 'Inspirational teacher', 'Mystical explorer'],
      challenges: ['Escapist spirituality', 'Scattered beliefs', 'Illusory wisdom', 'Preachy devotion', 'Unrealistic ideals'],
      advice: ['Commit to your path', 'Ground your explorations', 'Walk your spiritual talk', 'Realistic ideals', 'Practice what you preach'],
    },
    capricorn: {
      planet: 'neptune',
      sign: 'capricorn',
      keywords: ['spiritual structure', 'mystical responsibility', 'practical devotion', 'structural idealism', ' disciplined spirituality'],
      general: 'With Neptune in Capricorn, your spirituality expresses through building lasting structures for spiritual growth. You seek divine order and find the sacred through disciplined practice and responsible spiritual leadership.',
      strengths: ['Spiritual structure builder', 'Disciplined devotion', 'Practical mysticism', 'Spiritual authority', 'Enduring faith'],
      challenges: ['Rigid spirituality', 'Pessimistic mysticism', 'Control through spiritual means', 'Traditional over truth', 'Heavy spiritual burden'],
      advice: ['Embrace spiritual flow', 'Innovate within tradition', 'Lead with love', 'Lighten your faith', 'Spiritual flexibility'],
    },
    aquarius: {
      planet: 'neptune',
      sign: 'aquarius',
      keywords: ['spiritual innovation', 'mystical humanitarianism', 'universal compassion', 'collective devotion', 'visionary spirituality'],
      general: 'With Neptune in Aquarius, your spirituality expresses through humanitarian service and collective evolution. You seek divine connection through group consciousness and visionary ideals for humanity\'s future.',
      strengths: ['Visionary spirituality', 'Humanitarian mysticism', 'Universal compassion', 'Collective devotion', 'Spiritual innovation'],
      challenges: ['Detached compassion', 'Illusory collectivism', 'Spiritual rebellion', 'Unrealistic visions', 'Intellectualizes spirituality'],
      advice: ['Connect spirituality with heart', 'Ground your visions', 'Compassion individuals', 'Practical idealism', 'Live your spiritual values'],
    },
    pisces: {
      planet: 'neptune',
      sign: 'pisces',
      keywords: ['universal spirituality', 'divine compassion', 'mystical union', 'transcendent devotion', 'oceanic consciousness'],
      general: 'With Neptune in Pisces (its rulership), your spirituality is at its most powerful and natural. You embody universal compassion and experience divine union. Your mysticism is profound and you serve as a conduit for divine love.',
      strengths: ['Universal compassion', 'Divine connection', 'Mystical union', 'Transcendent service', 'Oceanic awareness'],
      challenges: ['Boundary-less spirituality', 'Escapist mysticism', 'Victim consciousness', 'Overwhelming sensitivity', 'Illusory devotion'],
      advice: ['Maintain healthy boundaries', 'Ground your divinity', 'Face reality spiritually', 'Discernment in compassion', 'Embody divine love'],
    },
  },
  pluto: {
    aries: {
      planet: 'pluto',
      sign: 'aries',
      keywords: ['radical transformation', 'warrior rebirth', 'pioneering power', 'aggressive regeneration', 'courageous death'],
      general: 'With Pluto in Aries, your transformation comes through confronting fears directly and asserting your will. You experience death and rebirth cycles through courageous action and the destruction of old identities.',
      strengths: ['Regenerative warrior', 'Courageous rebirth', 'Powerful initiative', 'Transforms through action', 'Confronts fears directly'],
      challenges: ['Destructive assertiveness', 'Violent transformation', 'Aggressive power', 'Impulsive regeneration', 'Forces change'],
      advice: ['Channel power wisely', 'Transform through courage not force', 'Build rather than destroy', 'Consider consequences', 'Heal your anger'],
    },
    taurus: {
      planet: 'pluto',
      sign: 'taurus',
      keywords: ['material transformation', 'stubborn rebirth', 'possessive power', 'enduring regeneration', 'sensual metamorphosis'],
      general: 'With Pluto in Taurus, your transformation comes through releasing attachments to security and resources. You experience death and rebirth cycles through material upheaval and shifts in your value system.',
      strengths: ['Enduring transformation', 'Regenerative stability', 'Powerful values', 'Resource metamorphosis', 'Deep regeneration'],
      challenges: ['Possessive power', 'Stubborn resistance to change', 'Material destruction', 'Obsessive security', 'Controlling resources'],
      advice: ['Release attachments', 'Embrace metamorphosis', 'Share your power', 'Trust the transformation', 'Let go to rebirth'],
    },
    gemini: {
      planet: 'pluto',
      sign: 'gemini',
      keywords: ['mental transformation', 'intellectual rebirth', 'communicative power', 'dualistic death', 'curiosity regeneration'],
      general: 'With Pluto in Gemini, your transformation comes through destroying limiting mental patterns and embracing new paradigms. You experience death and rebirth cycles through shifts in your perception and communication.',
      strengths: ['Transformative intellect', 'Regenerative communication', 'Powerful curiosity', 'Mental metamorphosis', 'Destroys illusions'],
      challenges: ['Manipulative communication', 'Scattered transformation', 'Destructive curiosity', 'Dualistic power games', 'Superficial regeneration'],
      advice: ['Transform deeply', 'Communicative honesty', 'Focus your power', 'Mental discipline', 'Depth over breadth'],
    },
    cancer: {
      planet: 'pluto',
      sign: 'cancer',
      keywords: ['emotional transformation', 'family rebirth', 'ancestral power', 'emotional death', 'nurturing metamorphosis'],
      general: 'With Pluto in Cancer, your transformation comes through releasing family patterns and emotional baggage. You experience death and rebirth cycles through emotional upheaval and restructuring your domestic life.',
      strengths: ['Emotional regeneration', 'Ancestral healing', 'Transformative nurturing', 'Powerful emotions', 'Destroys emotional patterns'],
      challenges: ['Emotional manipulation', 'Smothering power', 'Family destruction', 'Holds onto emotional pain', 'Controlling care'],
      advice: ['Release family karma', 'Heal emotional wounds', 'Empower rather than control', 'Transform through love', 'Forgive to rebirth'],
    },
    leo: {
      planet: 'pluto',
      sign: 'leo',
      keywords: ['creative transformation', 'ego rebirth', 'dramatic power', 'leadership metamorphosis', 'self-expression death'],
      general: 'With Pluto in Leo, your transformation comes through destroying your ego and rebirthing authentic creativity. You experience death and rebirth cycles through dramatic events that reshape your identity and self-expression.',
      strengths: ['Regenerative creativity', 'Powerful self-expression', 'Ego transformation', 'Charismatic rebirth', 'Destroys false self'],
      challenges: ['Egoic power', 'Dramatic destruction', 'Arrogant transformation', 'Needs control', 'Forces recognition'],
      advice: ['Surrender your ego', 'Authentic creativity', 'Empower others', 'Transform through heart', 'Express truth not performance'],
    },
    virgo: {
      planet: 'pluto',
      sign: 'virgo',
      keywords: ['analytical transformation', 'service rebirth', 'perfectionist power', 'health metamorphosis', 'ritual death'],
      general: 'With Pluto in Virgo, your transformation comes through releasing perfectionism and embracing wholeness. You experience death and rebirth cycles through health challenges and service that purifies your approach to work and daily life.',
      strengths: ['Transformative analysis', 'Regenerative service', 'Powerful healing', 'Purifying rituals', 'Destroys imperfections'],
      challenges: ['Critical power', 'Health destruction', 'Self-sacrificing transformation', 'Obsessive improvement', 'Judgmental regeneration'],
      advice: ['Embrace wholeness', 'Heal yourself first', 'Accept imperfection', 'Power through service', 'Rituals for transformation'],
    },
    libra: {
      planet: 'pluto',
      sign: 'libra',
      keywords: ['relationship transformation', 'partnership rebirth', 'balance power', 'social metamorphosis', 'intimacy death'],
      general: 'With Pluto in Libra, your transformation comes through destroying codependent patterns and rebirthing authentic partnerships. You experience death and rebirth cycles through relationship upheaval that transforms your approach to love and cooperation.',
      strengths: ['Transformative partnerships', 'Regenerative harmony', 'Powerful balance', 'Social rebirth', 'Destroys false equality'],
      challenges: ['Relational power struggles', 'Vengeful transformation', 'Partnership destruction', 'Codependent power', 'Social manipulation'],
      advice: ['Transform within relationships', 'Healthy interdependence', 'Release control', 'Embrace authentic connection', 'Die to old patterns'],
    },
    scorpio: {
      planet: 'pluto',
      sign: 'scorpio',
      keywords: ['emotional transformation', 'death and rebirth', 'occult power', 'regenerative force', 'psychic metamorphosis'],
      general: 'With Pluto in Scorpio (its rulership), your transformative power is at its most intense. You embody death and rebirth as a way of life and possess the power for complete regeneration. Your path involves facing the shadows and emerging transformed.',
      strengths: ['Ultimate transformation', 'Regenerative power', 'Psychic mastery', 'Destroys for rebirth', 'Alchemical force'],
      challenges: ['Destructive power', 'Obsessive transformation', 'Vengeful regeneration', 'Control through destruction', 'Emotional abyss'],
      advice: ['Use power for healing', 'Transform through love', 'Release control', 'Embrace the death', 'Rise reborn'],
    },
    sagittarius: {
      planet: 'pluto',
      sign: 'sagittarius',
      keywords: ['philosophical transformation', 'truth rebirth', 'belief metamorphosis', 'freedom power', 'visionary death'],
      general: 'With Pluto in Sagittarius, your transformation comes through destroying limiting beliefs and rebirthing your truth. You experience death and rebirth cycles through paradigm shifts that revolutionize your philosophy and spiritual perspective.',
      strengths: ['Transformative beliefs', 'Regenerative truth', 'Powerful freedom', 'Visionary metamorphosis', 'Destroys illusions'],
      challenges: ['Dogmatic power', 'Forced transformation', 'Freedom destruction', 'Religious fanaticism', 'Preachy regeneration'],
      advice: ['Transform your truth', 'Live your philosophy', 'Freedom through wisdom', 'Question your beliefs', 'Expand through death'],
    },
    capricorn: {
      planet: 'pluto',
      sign: 'capricorn',
      keywords: ['ambitious transformation', 'structural rebirth', 'authority power', 'career metamorphosis', 'achievement death'],
      general: 'With Pluto in Capricorn, your transformation comes through destroying old structures and rebirthing authentic authority. You experience death and rebirth cycles through career upheaval and changes in your public status and ambitions.',
      strengths: ['Transformative achievement', 'Regenerative structure', 'Authoritative power', 'Systemic metamorphosis', 'Destroys old orders'],
      challenges: ['Controlling power', 'Ruthless ambition', 'Structural destruction', 'Authoritarian regeneration', 'Status obsession'],
      advice: ['Build rather than control', 'Empower through authority', 'Transform the system', 'Ethical achievement', 'Die to ambition'],
    },
    aquarius: {
      planet: 'pluto',
      sign: 'aquarius',
      keywords: ['collective transformation', 'humanitarian rebirth', 'innovative power', 'social metamorphosis', 'freedom death'],
      general: 'With Pluto in Aquarius, your transformation comes through destroying outdated social structures and rebirthing collective consciousness. You experience death and rebirth cycles through revolutionary changes that transform your role in community.',
      strengths: ['Collective transformation', 'Regenerative innovation', 'Humanitarian power', 'Social metamorphosis', 'Destroys old systems'],
      challenges: ['Anarchic transformation', 'Forced revolution', 'Fanatical power', 'Destructive individuality', 'Group manipulation'],
      advice: ['Transform for humanity', 'Innovate wisely', 'Collaborative rebirth', 'Balance freedom and order', 'Evolution not destruction'],
    },
    pisces: {
      planet: 'pluto',
      sign: 'pisces',
      keywords: ['spiritual transformation', 'transcendent rebirth', 'mystical power', 'dissolution metamorphosis', 'universal death'],
      general: 'With Pluto in Pisces, your transformation comes through dissolving ego boundaries and merging with the universal. You experience death and rebirth cycles through spiritual awakening and transcendence of ordinary reality.',
      strengths: ['Transcendent power', 'Universal transformation', 'Mystical rebirth', 'Complete regeneration', 'Dissolves limitations'],
      challenges: ['Escapist power', 'Victim transformation', 'Illusory regeneration', 'Overwhelming dissolution', 'Boundary-less death'],
      advice: ['Ground your transformation', 'Spiritual authenticity', 'Healthy surrender', 'Integrate transcendent experiences', 'Die to the self'],
    },
  },
};

// ============================================================================
// ASPECT INTERPRETATIONS
// ============================================================================

export interface AspectInterpretation {
  type: string;
  keywords: string[];
  general: string;
  harmonious: boolean;
  expression: string;
  advice: string[];
}

export const aspectInterpretations: Record<string, AspectInterpretation> = {
  conjunction: {
    type: 'conjunction',
    keywords: ['fusion', 'intensity', 'new beginning', 'integration', 'focus'],
    general: 'A conjunction occurs when two planets are at the same degree, creating a powerful fusion of their energies. This aspect represents a new beginning, where the archetypal forces merge and intensify each other. The conjunction acts as a focal point in the chart, where the combined energy must be integrated and expressed.',
    harmonious: false, // Depends on planets involved
    expression: 'Conjunctions create a blending of energies that cannot be easily separated. The planets involved work as a team, their identities fused together. This creates intensity and focus in the areas of life represented by both planets.',
    advice: [
      'Integrate the combined energy consciously',
      'Recognize the fused nature of these planetary forces',
      'Work with both planets together, not separately',
      'This aspect requires self-awareness and integration',
      'The energy flows naturally once understood',
    ],
  },
  opposition: {
    type: 'opposition',
    keywords: ['tension', 'balance', 'polarity', 'awareness', 'integration'],
    general: 'An opposition occurs when two planets are 180 degrees apart, creating a dynamic tension between their energies. This aspect represents a polarity that must be reconciled, forcing awareness and balance. The opposition creates a seesaw effect where you swing between extremes until finding middle ground.',
    harmonious: false,
    expression: 'Oppositions create a dynamic tension where you must integrate opposing forces. You may project one side onto others or alternate between extremes. The goal is not to choose one side but to find a balance that honors both.',
    advice: [
      'Seek balance and integration, not elimination of either side',
      'Recognize projections in relationships',
      'Work with both energies consciously',
      'Find the middle path between extremes',
      'Relationships often mirror this dynamic back to you',
    ],
  },
  trine: {
    type: 'trine',
    keywords: ['harmony', 'flow', 'ease', 'talent', 'opportunity'],
    general: 'A trine occurs when two planets are 120 degrees apart, creating an easy flow of energy between them. This harmonious aspect indicates natural talent and ability in the areas represented by the planets. The trine brings opportunities, luck, and a sense of ease in expressing these combined energies.',
    harmonious: true,
    expression: 'Trines create natural flow and harmony between planetary energies. Things come easily in these areas, often representing innate talents and gifts. However, too much ease can lead to complacency or taking these abilities for granted.',
    advice: [
      'Don\'t take your natural talents for granted',
      'Consciously develop and use these gifts',
      'Share your abilities with others',
      'Balance ease with effort for true mastery',
      'Recognize not everyone has these natural advantages',
    ],
  },
  square: {
    type: 'square',
    keywords: ['challenge', 'dynamic tension', 'growth', 'action', 'frustration'],
    general: 'A square occurs when two planets are 90 degrees apart, creating dynamic tension and challenge between their energies. This aspect represents obstacles that must be overcome through action and persistence. The square forces growth and development, though often through uncomfortable pressure.',
    harmonious: false,
    expression: 'Squares create internal and external tension that demands action. The planetary energies are at cross-purposes, creating frustration until you learn to work with both simultaneously. This aspect builds character and strength through overcoming obstacles.',
    advice: [
      'Embrace challenges as opportunities for growth',
      'Take action rather than avoiding tension',
      'Find creative ways to work with both energies',
      'Patience and persistence are key',
      'The discomfort is productive - it builds strength',
    ],
  },
  sextile: {
    type: 'sextile',
    keywords: ['opportunity', 'communication', 'mental stimulation', 'connection'],
    general: 'A sextile occurs when two planets are 60 degrees apart, creating an opportunity for positive interaction. This aspect indicates potential that can be realized through conscious effort and initiative. The sextile offers chances and possibilities, especially in communication and mental activities.',
    harmonious: true,
    expression: 'Sextiles create opportunities that require some effort to activate. Unlike trines, the energy doesn\'t flow automatically - you must take initiative to access these positive connections. Mental stimulation and communication are highlighted.',
    advice: [
      'Take initiative to activate these opportunities',
      'Communicate and connect with others',
      'Look for chances to learn and grow',
      'Stay alert to possibilities in these areas',
      'Your actions will unlock this potential',
    ],
  },
  quincunx: {
    type: 'quincunx',
    keywords: ['adjustment', 'misalignment', 'healing', 'transformation', 'release'],
    general: 'A quincunx (inconjunct) occurs when two planets are 150 degrees apart, creating a need for adjustment and release. This aspect indicates areas where you must let go of old patterns and adapt to new ways of being. The quincunx often brings health or healing themes.',
    harmonious: false,
    expression: 'Quincunxs create a sense of misalignment where old approaches no longer work. You must release something and embrace a new perspective. This aspect often points to areas needing healing or transformation.',
    advice: [
      'Release old patterns that no longer serve',
      'Be willing to adjust and adapt',
      'Pay attention to health signals in these areas',
      'Let go of control and find new approaches',
      'This aspect demands transformation',
    ],
  },
};

// ============================================================================
// HOUSE MEANINGS
// ============================================================================

export interface HouseMeaning {
  house: number;
  themes: string[];
  naturalRuler: string;
  description: string;
  advice: string[];
}

export const houseMeanings: HouseMeaning[] = [
  {
    house: 1,
    themes: ['identity', 'self-expression', 'appearance', 'first impressions', 'new beginnings'],
    naturalRuler: 'mars',
    description: 'The First House represents your identity, physical appearance, and how you present yourself to the world. It is the house of self, where you express your individuality and begin all new ventures. The sign on the cusp and planets in this house reveal your approach to life and personal style.',
    advice: [
      'Own your authentic self-expression',
      'Make conscious first impressions',
      'Take initiative in this area of life',
      'Your physical presence matters - honor it',
      'This house sets the tone for the entire chart',
    ],
  },
  {
    house: 2,
    themes: ['values', 'money', 'possessions', 'self-worth', 'resources'],
    naturalRuler: 'venus',
    description: 'The Second House rules your material resources, money, possessions, and sense of self-worth. It reveals your relationship with the physical world and what you value. The sign and planets here show how you earn, spend, and relate to material security.',
    advice: [
      'Build self-worth from within, not from possessions',
      'Align spending with true values',
      'Develop financial skills and awareness',
      'Share resources generously',
      'Your relationship with money reflects your self-worth',
    ],
  },
  {
    house: 3,
    themes: ['communication', 'thinking', 'siblings', 'short trips', 'learning'],
    naturalRuler: 'mercury',
    description: 'The Third House governs communication, mental processes, and immediate environment. It rules your thinking style, learning, siblings, neighbors, and short-distance travel. This house reveals how you gather and share information.',
    advice: [
      'Communicate clearly and honestly',
      'Be curious and keep learning',
      'Maintain good relationships with siblings/neighbors',
      'Stay connected to your immediate community',
      'Your mind is a powerful tool - use it well',
    ],
  },
  {
    house: 4,
    themes: ['home', 'family', 'roots', 'foundations', 'private life'],
    naturalRuler: 'moon',
    description: 'The Fourth House rules home, family, roots, and your private emotional foundation. It represents your connection to ancestry, your physical home, and your innermost self. This house reveals what makes you feel secure and nurtured.',
    advice: [
      'Create a nurturing home environment',
      'Heal family patterns and wounds',
      'Build strong emotional foundations',
      'Honor your ancestry and roots',
      'Your private life is sacred - protect it',
    ],
  },
  {
    house: 5,
    themes: ['creativity', 'romance', 'children', 'pleasure', 'self-expression'],
    naturalRuler: 'sun',
    description: 'The Fifth House governs creativity, romance, children, pleasure, and self-expression. It is the house of play, where you express your authentic joy and create what you love. This area rules artistic pursuits, hobbies, and affairs of the heart.',
    advice: [
      'Make time for play and creativity',
      'Express yourself authentically',
      'Honor your inner child',
      'Take healthy risks in love and life',
      'Joy is essential - not optional',
    ],
  },
  {
    house: 6,
    themes: ['work', 'health', 'service', 'routine', 'habits'],
    naturalRuler: 'mercury',
    description: 'The Sixth House rules daily work, health, service, and routines. It governs your job (as opposed to career), daily habits, and physical well-being. This house reveals how you serve others and maintain your body and life.',
    advice: [
      'Create healthy daily routines',
      'Find meaning in your work and service',
      'Take care of your physical body',
      'Balance work with rest and play',
      'Small habits create big results',
    ],
  },
  {
    house: 7,
    themes: ['partnerships', 'relationships', 'marriage', 'open enemies', 'projection'],
    naturalRuler: 'venus',
    description: 'The Seventh House rules committed partnerships, marriage, and close one-on-one relationships. It represents "the other" and how you relate to partners both personally and professionally. This house reveals what you seek in close partnerships.',
    advice: [
      'Choose partners who reflect your values',
      'Balance self-identity with partnership',
      'Learn through relationship mirrors',
      'Commitment requires compromise and work',
      'Healthy relationships require two whole individuals',
    ],
  },
  {
    house: 8,
    themes: ['transformation', 'shared resources', 'intimacy', 'death', 'occult'],
    naturalRuler: 'mars/pluto',
    description: 'The Eighth House governs transformation, shared resources, intimacy, and life\'s mysteries. It rules other people\'s money, sexuality, death, rebirth, and the occult. This house reveals deep psychological patterns and your capacity for regeneration.',
    advice: [
      'Embrace transformation as growth',
      'Practice vulnerability in intimacy',
      'Heal deep psychological wounds',
      'Share resources wisely and fairly',
      'Death is not the end - it is transformation',
    ],
  },
  {
    house: 9,
    themes: ['higher learning', 'philosophy', 'travel', 'religion', 'expansion'],
    naturalRuler: 'jupiter',
    description: 'The Ninth House rules higher education, philosophy, long-distance travel, religion, and expansion of consciousness. It represents your search for meaning, truth, and adventure beyond the familiar. This house reveals your belief systems and desire for exploration.',
    advice: [
      'Keep exploring and seeking truth',
      'Challenge and expand your beliefs',
      'Travel to broaden your perspective',
      'Study subjects that inspire you',
      'Your philosophy shapes your reality',
    ],
  },
  {
    house: 10,
    themes: ['career', 'status', 'public image', 'authority', 'achievement'],
    naturalRuler: 'saturn',
    description: 'The Tenth House rules career, public status, authority, and your public image. It represents your ambitions, achievements, and how you\'re perceived in the world. This house reveals your relationship with authority and desire for recognition.',
    advice: [
      'Build a career aligned with your values',
      'Take responsibility for your public image',
      'Honor legitimate authority while claiming your own',
      'Achievement without integrity is hollow',
      'Your reputation is built on actions, not intentions',
    ],
  },
  {
    house: 11,
    themes: ['friends', 'groups', 'hopes', 'community', 'humanitarianism'],
    naturalRuler: 'saturn/uranus',
    description: 'The Eleventh House rules friendships, groups, hopes, wishes, and community. It represents your social networks, aspirations, and contribution to collective causes. This house reveals how you connect with like-minded others and your vision for the future.',
    advice: [
      'Choose friends who inspire growth',
      'Participate in communities that matter to you',
      'Dream big for your future',
      'Contribute to causes larger than yourself',
      'Your network shapes your possibilities',
    ],
  },
  {
    house: 12,
    themes: ['unconscious', 'spirituality', 'seclusion', 'sacrifice', 'hidden things'],
    naturalRuler: 'jupiter/neptune',
    description: 'The Twelfth House rules the unconscious, spirituality, seclusion, and hidden matters. It represents what is beneath the surface - dreams, intuition, karma, and connection to the divine. This house reveals your relationship with the invisible realms.',
    advice: [
      'Honor your spiritual life and intuition',
      'Spend time in solitude and reflection',
      'Release what no longer serves you',
      'Serve others without expectation of return',
      'The unconscious has wisdom - listen to it',
    ],
  },
];

// ============================================================================
// TRANSIT INTERPRETATIONS
// ============================================================================

export interface TransitInterpretation {
  aspect: string;
  keywords: string[];
  themes: string[];
  description: string;
  advice: {
    positive: string[];
    challenges: string[];
    suggestions: string[];
  };
}

export const getTransitInterpretation = (
  transitingPlanet: string,
  aspect: string,
  natalPlanet: string
): TransitInterpretation => {
  // This is a simplified version - in production, you'd have detailed interpretations
  // for each combination of transiting planet + aspect + natal planet

  const aspectKeywords: Record<string, string[]> = {
    conjunction: ['new beginnings', 'focus', 'amplification', 'initiation'],
    opposition: ['tension', 'balance', 'relationships', 'awareness'],
    trine: ['flow', 'ease', 'opportunity', 'harmony'],
    square: ['challenge', 'action', 'growth', 'tension'],
    sextile: ['opportunity', 'connection', 'communication', 'potential'],
    quincunx: ['adjustment', 'healing', 'release', 'realignment'],
  };

  return {
    aspect,
    keywords: aspectKeywords[aspect] || [],
    themes: ['transformation', 'timing', 'opportunity', 'growth'],
    description: `The ${transitingPlanet} ${aspect} your natal ${natalPlanet} activates this area of your life, bringing attention and energy to matters related to both planets. This transit lasts for a specific duration, offering opportunities for growth and awareness.`,
    advice: {
      positive: [
        'Work consciously with this transit\'s energy',
        'Take advantage of opportunities presented',
        'Trust the process of transformation',
        'Express the combined energies creatively',
      ],
      challenges: [
        'Be patient with tension or challenges',
        'Avoid impulsive decisions during stressful periods',
        'Face what arises with courage',
        'Seek support if needed',
      ],
      suggestions: [
        'Reflect on the houses involved in your chart',
        'Journal about experiences during this transit',
        'Set intentions aligned with this energy',
        'Practice self-care during intense transits',
      ],
    },
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get interpretation for a planet in a sign
 */
export function getPlanetInSignInterpretation(
  planet: string,
  sign: string
): PlanetInSignInterpretation | null {
  if (planetsInSigns[planet] && planetsInSigns[planet][sign]) {
    return planetsInSigns[planet][sign];
  }
  return null;
}

/**
 * Get interpretation for an aspect
 */
export function getAspectInterpretation(aspect: string): AspectInterpretation | null {
  if (aspectInterpretations[aspect]) {
    return aspectInterpretations[aspect];
  }
  return null;
}

/**
 * Get interpretation for a house
 */
export function getHouseInterpretation(house: number): HouseMeaning | null {
  if (house >= 1 && house <= 12) {
    return houseMeanings[house - 1];
  }
  return null;
}

/**
 * Generate personality analysis from chart data
 */
export function generatePersonalityAnalysis(chartData: {
  planets: Array<{ planet: string; sign: string; house: number }>;
  aspects: Array<{ planet1: string; planet2: string; type: string }>;
}) {
  const analysis = {
    overview: {
      sunSign: getPlanetInSignInterpretation('sun', chartData.planets.find(p => p.planet === 'sun')?.sign || 'aries'),
      moonSign: getPlanetInSignInterpretation('moon', chartData.planets.find(p => p.planet === 'moon')?.sign || 'aries'),
      ascendantSign: null, // Would be calculated from house cusp
    },
    planetsInSigns: chartData.planets.map(p => ({
      planet: p.planet,
      sign: p.sign,
      interpretation: getPlanetInSignInterpretation(p.planet, p.sign),
    })),
    houses: chartData.planets
      .filter(p => p.house)
      .reduce((acc, p) => {
        if (!acc[p.house]) {
          acc[p.house] = {
            house: p.house,
            planetsInHouse: [],
            interpretation: getHouseInterpretation(p.house),
          };
        }
        acc[p.house].planetsInHouse.push(p.planet);
        return acc;
      }, {} as Record<number, any>),
    aspects: chartData.aspects.map(a => ({
      ...a,
      interpretation: getAspectInterpretation(a.type),
    })),
  };

  return analysis;
}
