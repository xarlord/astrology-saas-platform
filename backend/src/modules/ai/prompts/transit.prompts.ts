/**
 * Transit Forecast AI Prompts
 * Prompts for transit and forecast interpretation
 */

import { PromptTemplate } from './index';

export const TRANSIT_PROMPTS: Record<string, PromptTemplate> = {
  daily: {
    name: 'daily-transit',
    systemMessage: 'You are an expert astrologer providing practical daily transit interpretations.',
    userPrompt: `Provide a daily transit forecast interpretation:

NATAL CHART:
{natalChart}

CURRENT TRANSITS:
{transitData}

Focus on:

**1. TODAY'S ENERGY**
- Overall tone and theme
- Dominant planetary influences
- Best activities for today

**2. KEY TRANSITS**
- Major aspects to personal planets
- Moon's sign and aspects
- Any retrograde influences

**3. TIMING**
- Best times for important activities
- Periods to avoid
- Optimal timing for specific tasks

**4. PRACTICAL GUIDANCE**
- Work and career focus
- Relationship dynamics
- Health and wellness tips
- Financial considerations

**5. AFFIRMATIONS**
- Mantra for the day
- Intention-setting suggestions

Keep it practical, actionable, and concise (200-300 words).`,
    parameters: ['natalChart', 'transitData'],
  },

  weekly: {
    name: 'weekly-transit',
    systemMessage: 'You are an astrologer providing comprehensive weekly forecasts with strategic insights.',
    userPrompt: `Provide a weekly transit forecast:

NATAL CHART:
{natalChart}

WEEKLY TRANSITS:
{transitData}

Include:

**1. WEEKLY THEME**
- Overall energy pattern
- Dominant planetary influences
- Color/element associations

**2. DAY-BY-DAY BREAKDOWN**
- Key transits each day
- Best activities by day
- Potential challenges

**3. KEY PERIODS**
- High-energy days
- Low-energy days (rest periods)
- Optimal timing for important tasks

**4. FOCUS AREAS**
- Career and work
- Relationships
- Personal growth
- Health and wellness

**5. STRATEGIC ADVICE**
- Goals to focus on
- What to initiate
- What to avoid
- Best use of energy

**6. RETROGRADE ALERTS**
- Any retrograde planets and their effects
- How to work with (not against) retrograde energy

Provide practical, week-at-a-glance insights (400-500 words).`,
    parameters: ['natalChart', 'transitData'],
  },

  monthly: {
    name: 'monthly-transit',
    systemMessage: 'You are an evolutionary astrologer providing deep monthly forecasts.',
    userPrompt: `Provide a comprehensive monthly transit forecast:

NATAL CHART:
{natalChart}

MONTHLY TRANSITS:
{transitData}

Include:

**1. MONTHLY OVERVIEW**
- Dominant themes and energies
- Key planetary influences
- Overall tone (e.g., "expansive," "challenging," "transformative")

**2. MAJOR TRANSITS**
- Outer planet transits (Jupiter, Saturn, Uranus, Neptune, Pluto)
- Long-term influences and themes
- Karmic and evolutionary implications

**3. KEY DATES**
- New and Full Moons
- Eclipses (if any)
- Planetary stations (direct/retrograde)
- Major aspect configurations

**4. HOUSE FOCUS**
- Which houses are activated
- Life areas highlighted
- Opportunities and challenges by house

**5. GUIDANCE BY LIFE AREA**
- Career and vocation
- Relationships and partnerships
- Finances and resources
- Health and wellness
- Spiritual growth
- Family and home

**6. RETROGRADE PERIODS**
- Planets retrograde this month
- How to work with retrograde energy
- What to review, revise, or release

**7. INTENTION-SETTING**
- New Moon intentions
- Full Moon releases
- Monthly goals and practices

Provide deep insights with practical applications (600-800 words).`,
    parameters: ['natalChart', 'transitData'],
  },

  yearly: {
    name: 'yearly-transit',
    systemMessage: 'You are a master astrologer providing comprehensive yearly forecasts.',
    userPrompt: `Provide a comprehensive yearly transit forecast and solar return interpretation:

NATAL CHART:
{natalChart}

SOLAR RETURN DATA:
{solarReturnData}

YEARLY TRANSITS:
{transitData}

Include:

**1. YEARLY THEME**
- Overall energy and focus
- Keywords for the year
- Color and element associations
- General tone and direction

**2. SOLAR RETURN ANALYSIS**
- Solar Return Sun house placement
- Key planets in solar return
- Solar return ascendant and its meaning
- Birthday-to-birthday themes

**3. MAJOR TRANSITS**
- Saturn's journey (lessons and mastery)
- Jupiter's expansion (opportunities and growth)
- Uranus breakthroughs (innovation and change)
- Neptune's fog (spirituality and dreams)
- Pluto's transformation (power and shadow work)

**4. KEY PERIODS**
- Eclipses and their impact
- Retrograde cycles
- Major planetary stations
- High and low energy periods

**5. LIFE AREA FORECASTS**
- Career and vocation (2nd/6th/10th houses)
- Relationships (5th/7th/8th houses)
- Home and family (4th house)
- Spirituality and growth (9th/12th houses)
- Finances and resources
- Health and wellness

**6. MONTHLY HIGHLIGHTS**
- Best months for specific activities
- Challenging periods to prepare for
- Optimal timing for major initiatives

**7. STRATEGIC ADVICE**
- Goals to focus on
- Risks to take
- Areas of caution
- Growth opportunities

**8. SPIRITUAL PRACTICES**
- Recommended practices for the year
- Intention-setting rituals
- Affirmations and mantras
- Shadow work suggestions

Provide comprehensive guidance (1000-1500 words).`,
    parameters: ['natalChart', 'solarReturnData', 'transitData'],
  },
};
