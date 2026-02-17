/**
 * Synastry/Compatibility AI Prompts
 * Prompts for relationship compatibility analysis
 */

import { PromptTemplate } from './index';

export const SYNASTRY_PROMPTS: Record<string, PromptTemplate> = {
  basic: {
    name: 'basic-synastry',
    systemMessage: 'You are an expert relationship astrologer providing insightful compatibility analyses.',
    userPrompt: `Provide a compatibility analysis for two individuals:

CHART A (Person 1):
{chartA}

CHART B (Person 2):
{chartB}

Include:

**1. OVERALL COMPATIBILITY**
- General compatibility score (1-10)
- Key strengths of the relationship
- Potential challenges
- Relationship dynamic description

**2. KEY SYNASTRY ASPECTS**
- Sun-Sun aspect
- Moon-Moon aspect
- Venus-Mars aspect
- Mercury-Mercury aspect
- Any major aspect patterns (conjunctions, trines, squares, oppositions)

**3. ELEMENTAL & MODAL HARMONY**
- Element balance (fire, earth, air, water)
- Modal balance (cardinal, fixed, mutable)
- Complementary or conflicting energies

**4. HOUSE OVERLAYS**
- How Person A's planets fall in Person B's houses
- How Person B's planets fall in Person A's houses
- Key house overlays

**5. RELATIONSHIP NEEDS**
- Emotional needs compatibility (Moon, Venus)
- Communication styles (Mercury)
- Action styles and drive (Mars)
- Values and priorities (Venus, Jupiter)

**6. GROWTH OPPORTUNITIES**
- What each person can learn from the other
- Relationship evolution potential
- Areas for mutual growth

Provide balanced, insightful analysis (500-700 words).`,
    parameters: ['chartA', 'chartB'],
  },

  romantic: {
    name: 'romantic-synastry',
    systemMessage: 'You are a specialized romantic relationship astrologer with deep insight into love dynamics.',
    userPrompt: `Provide a comprehensive romantic compatibility analysis:

CHART A (Person 1):
{chartA}

CHART B (Person 2):
{chartB}

Include:

**1. ROMANTIC CHEMISTRY**
- Sexual compatibility (Mars, Venus, Pluto, 5th/8th houses)
- Physical attraction indicators
- Passion and intensity level
- Long-term vs short-term potential

**2. EMOTIONAL CONNECTION**
- Moon sign compatibility
- Emotional needs alignment
- Emotional safety and security
- How each person nurtures the other

**3. LOVE LANGUAGES**
- Venus sign interpretations for both
- How each person expresses love
- What each person needs to feel loved
- Best ways to show affection

**4. COMMUNICATION IN LOVE**
- Mercury compatibility
- How to resolve conflicts
- Communication styles
- Intellectual connection

**5. COMMITMENT INDICATORS**
- Saturn aspects and commitments
- Long-term potential
- Marriage indicators
- Shared values (Venus, Jupiter)

**6. CHALLENGE AREAS**
- Potential friction points
- Trigger points for each person
- Areas requiring work
- Red flags (if any)

**7. SYNASTRY ASPECT BREAKDOWN**
- Sun-Moon: Core identity connection
- Venus-Mars: Attraction polarity
- Venus-Venus: Love styles
- Mars-Mars: Action and drive compatibility
- Moon-Venus: Emotional-romantic connection
- Saturn-Saturn: Commitment and long-term potential

**8. COMPOSITE CHART INSIGHTS**
- Composite Sun sign
- Composite Moon sign
- Composite Venus and Mars
- Key composite aspects

**9. RELATIONSHIP EVOLUTION**
- Relationship growth trajectory
- Timing of relationship challenges
- Evolution of the partnership
- Karmic connections (if any)

**10. PRACTICAL ADVICE**
- How to strengthen the bond
- Best practices for this couple
- Activities to do together
- Date ideas based on compatibility

Provide deep romantic insights (800-1000 words).`,
    parameters: ['chartA', 'chartB'],
  },

  friendship: {
    name: 'friendship-synastry',
    systemMessage: 'You are an astrologer specializing in platonic relationships and friendships.',
    userPrompt: `Provide a friendship compatibility analysis:

CHART A (Person 1):
{chartA}

CHART B (Person 2):
{chartB}

Include:

**1. FRIENDSHIP FOUNDATION**
- Overall compatibility as friends
- Shared interests and values
- Communication ease
- Trust and loyalty indicators

**2. SOCIAL COMPATIBILITY**
- How they relate in groups
- Social style compatibility
- Shared activities and interests
- Adventure and fun indicators (5th house)

**3. EMOTIONAL SUPPORT**
- How they support each other
- Emotional understanding
- Being there for each other
- Deep friendship potential

**4. INTELLECTUAL CONNECTION**
- Mental compatibility
- Learning from each other
- Conversation quality
- Shared ideas and philosophy

**5. LONGEVITY**
- Long-term friendship potential
- Friendship evolution
- Possible friendship challenges
- Maintaining the bond

**6. BEST FRIENDSHIP ACTIVITIES**
- Activities they'd enjoy together
- Travel compatibility
- Shared projects
- Social dynamics

Provide practical friendship insights (400-500 words).`,
    parameters: ['chartA', 'chartB'],
  },

  business: {
    name: 'business-synastry',
    systemMessage: 'You are an astrologer specializing in business partnerships and professional relationships.',
    userPrompt: `Provide a business partnership compatibility analysis:

CHART A (Person 1):
{chartA}

CHART B (Person 2):
{chartB}

Include:

**1. PARTNERSHIP POTENTIAL**
- Overall business compatibility
- Complementary skills and strengths
- Shared vision and goals
- Partnership sustainability

**2. WORK STYLES**
- How each person approaches work
- Productivity compatibility
- Work ethic alignment
- Decision-making styles

**3. COMMUNICATION IN BUSINESS**
- Business communication styles
- Conflict resolution
- Negotiation dynamics
- Clarity in communication

**4. FINANCIAL COMPATIBILITY**
- Money attitudes (Venus, Jupiter, 2nd/8th houses)
- Risk tolerance
- Financial decision-making
- Shared financial goals

**5. LEADERSHIP & POWER**
- Power dynamics
- Leadership styles
- Authority handling
- Control and delegation

**6. STRENGTHS & WEAKNESSES**
- What each person brings to the partnership
- Complementary skills
- Potential blind spots
- Areas needing support

**7. CHALLENGE AREAS**
- Potential conflicts
- Stress points
- Competitive dynamics
- Trust issues

**8. GROWTH & EXPANSION**
- Business growth potential
- Innovation and creativity
- Adaptability
- Success indicators

**9. PRACTICAL ADVICE**
- Best practices for the partnership
- How to maximize strengths
- Mitigating challenges
- Partnership agreements considerations

Provide actionable business insights (600-800 words).`,
    parameters: ['chartA', 'chartB'],
  },

  family: {
    name: 'family-synastry',
    systemMessage: 'You are an astrologer specializing in family dynamics and intergenerational relationships.',
    userPrompt: `Provide a family relationship compatibility analysis:

CHART A (Family Member 1):
{chartA}

CHART B (Family Member 2):
{chartB}

Include:

**1. FAMILY BOND**
- Overall family compatibility
- Generational connections
- Family patterns and themes
- Karmic family connections

**2. COMMUNICATION**
- How they communicate
- Misunderstanding potential
- Bridge-building opportunities
- Family story dynamics

**3. EMOTIONAL DYNAMICS**
- Emotional needs
- Family emotional patterns
- Support systems
- Healing opportunities

**4. CHALLENGES & TRIGGERS**
- Family conflict areas
- Emotional triggers
- Past wounds
- Generational trauma patterns

**5. HEALING & GROWTH**
- Healing opportunities
- Breaking family patterns
- Mutual growth
- Forgiveness and understanding

**6. ROLES IN FAMILY**
- Family roles each person plays
- Expectations vs reality
- Authentic expression
- Boundary setting

Provide compassionate, healing-focused insights (500-700 words).`,
    parameters: ['chartA', 'chartB'],
  },
};
