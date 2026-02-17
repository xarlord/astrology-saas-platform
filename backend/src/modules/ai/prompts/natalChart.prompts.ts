/**
 * Natal Chart AI Prompts
 * Comprehensive prompts for natal chart interpretation
 */

import { PromptTemplate } from './index';

export const NATAL_CHART_PROMPTS: Record<string, PromptTemplate> = {
  basic: {
    name: 'basic-natal',
    systemMessage: 'You are an expert astrologer providing clear, insightful, and empowering natal chart interpretations.',
    userPrompt: `Provide a comprehensive interpretation for this natal chart:

CHART DATA:
{chartData}

Your interpretation should include:
1. Core Identity (Sun Sign)
2. Emotional Nature (Moon Sign)
3. Communication Style (Mercury Sign)
4. Love & Values (Venus Sign)
5. Action & Drive (Mars Sign)
6. Expansion & Growth (Jupiter Sign)
7. Challenges & Lessons (Saturn Sign)

For each placement, provide:
- Key traits and characteristics
- Strengths and potentials
- Challenges and growth opportunities
- Practical advice

Keep interpretations specific, nuanced, and empowering. Avoid generic statements.`,
    parameters: ['chartData'],
  },

  detailed: {
    name: 'detailed-natal',
    systemMessage: 'You are a master astrologer with deep knowledge of psychological, evolutionary, and traditional astrology.',
    userPrompt: `Provide an in-depth interpretation for this natal chart, considering both traditional and modern approaches:

CHART DATA:
{chartData}

Include the following sections:

**1. CORE TRIAD (Sun, Moon, Rising)**
- Psychological profile
- Emotional needs
- Life direction and purpose

**2. PERSONAL PLANETS**
- Mercury: Communication, learning style, mental focus
- Venus: Love language, values, aesthetic preferences
- Mars: Action style, drive, sexual expression
- Jupiter: Expansion areas, philosophy, luck
- Saturn: Karmic lessons, fears, mastery areas

**3. OUTER PLANETS (Generational Themes)**
- Uranus: Innovation, rebellion, uniqueness
- Neptune: Spirituality, dreams, illusions
- Pluto: Transformation, power, shadow work

**4. HOUSE PLACEMENTS**
- Focus areas of life
- Planetary strengths by house
- Empty houses and their meaning

**5. MAJOR ASPECTS**
- Dominant aspect patterns (Grand Trine, T-Square, etc.)
- Key aspects to Sun, Moon, and Ascendant
- Elemental and modal balances

**6. LIFE THEME SYNTHESIS**
- Overall life narrative
- Integration of various placements
- Evolutionary path and growth trajectory

For each section, provide:
- Deep psychological insights
- Practical applications
- Growth opportunities
- Affirmations or mantras

Maintain an empowering tone while acknowledging challenges. Use both traditional and modern interpretive approaches.`,
    parameters: ['chartData'],
  },

  focused: {
    name: 'focused-natal',
    systemMessage: 'You are a practical astrologer providing actionable insights for daily life.',
    userPrompt: `Provide a focused, practical interpretation for this natal chart:

CHART DATA:
{chartData}

Focus on these areas:

**1. CAREER & VOCATION**
- Best career paths based on Sun, Moon, Midheaven, and 6th/10th houses
- Work style and ideal work environment
- Financial attitudes (Venus, Jupiter, 2nd/8th houses)

**2. RELATIONSHIPS**
- Relationship needs (Venus, Moon, 7th house)
- Communication in partnerships (Mercury, 3rd house)
- Ideal partner characteristics

**3. PERSONAL GROWTH**
- Key challenges (Saturn, South Node)
- Growth opportunities (Jupiter, North Node)
- Emotional healing path (Moon, Pluto, 4th/8th houses)

**4. STRENGTHS & TALENTS**
- Natural abilities and gifts
- Areas of mastery
- How to leverage these in daily life

Provide specific, actionable advice for each area. Include concrete suggestions for implementation.`,
    parameters: ['chartData'],
  },

  predictive: {
    name: 'predictive-natal',
    systemMessage: 'You are an evolutionary astrologer focused on soul growth and life cycles.',
    userPrompt: `Provide an evolutionary interpretation of this natal chart:

CHART DATA:
{chartData}

Focus on:

**1. SOUL'S INTENTION (North Node)**
- Life purpose and direction
- Qualities to develop
- Areas of growth

**2. PAST PATTERNS (South Node)**
- Karmic baggage and old patterns
- What to release
- Past life themes

**3. PLUTO'S JOURNEY**
- Soul's evolutionary intent
- Transformation themes
- Power dynamics and shadow work

**4. SATURN'S LESSONS**
- Current karmic tests
- Areas of mastery required
- Timing of major life lessons

**5. LIFETIME THEMES**
- Major life cycles and turning points
- Evolutionary trajectory
- Integration of shadow and light

Provide deep insights into the soul's journey while offering practical guidance for navigating current challenges.`,
    parameters: ['chartData'],
  },
};
