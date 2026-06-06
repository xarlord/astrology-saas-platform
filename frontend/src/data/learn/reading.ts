import type { ReadingLesson } from './types';

export const readingLessons: ReadingLesson[] = [
  {
    id: 'reading-what-is-chart',
    title: 'What Is a Birth Chart?',
    subtitle: 'Your cosmic fingerprint',
    accentColor: '#6366f1',
    difficulty: 'beginner',
    content: `A birth chart (also called a natal chart) is a snapshot of the sky at the exact moment and location you were born. It shows where every planet was in the zodiac, which signs were on each house cusp, and how all these points relate to each other through aspects.

Think of it like a map. If life is a journey, your birth chart is the map that shows the terrain — the mountains you'll climb, the rivers you'll cross, and the beautiful viewpoints along the way. It doesn't dictate your choices, but it shows you what you're working with.

Every birth chart is unique. Even twins born a few minutes apart have different charts because the Ascendant (rising sign) changes roughly one degree every four minutes, shifting the entire house system.

A birth chart contains three essential layers:
• **Planets** — the "what" (what energies are active)
• **Signs** — the "how" (how those energies express themselves)
• **Houses** — the "where" (which areas of life are most affected)

When you put them all together, you get a complete sentence: "My Mars (drive/action) is in Aries (boldly/initiation) in the 10th house (career/public life)." This tells you the person is likely a bold, competitive professional who takes initiative in their career.`,
    practicalExample: 'A birth chart reading typically starts with the "Big Three": Sun (core identity), Moon (emotional self), and Ascendant (how you appear to others). For example: "Sun in Pisces, Moon in Virgo, Scorpio Rising" paints a picture of someone who is dreamy and compassionate at their core (Pisces Sun), processes emotions through analysis and service (Virgo Moon), and appears intense and mysterious to others (Scorpio Rising).',
    keyTakeaway: 'Your birth chart is a tool for self-understanding, not a fortune-telling device. It reveals your potential, patterns, and growth edges — but what you do with that knowledge is always up to you.',
  },
  {
    id: 'reading-big-three',
    title: 'The Big Three: Sun, Moon & Rising',
    subtitle: 'The foundation of every chart reading',
    accentColor: '#f59e0b',
    difficulty: 'beginner',
    content: `Before diving deep into the full chart, start with the three most important placements. They give you about 60-70% of the person's overall personality:

**The Sun — Your Core Identity**
Your Sun sign is the essence of who you are — your conscious self, life purpose, and creative potential. It's the "I am" of your chart. If your chart were a play, the Sun would be the lead actor.

**The Moon — Your Emotional Self**
Your Moon sign reveals your inner world — how you process feelings, what you need to feel safe, and your instinctive reactions. The Moon is the private self that only close family and friends see. It's the director behind the scenes.

**The Ascendant (Rising Sign) — Your Persona**
Your Rising sign is the mask you wear — how you appear to others, your physical presence, and your approach to life. It's determined by your exact birth time and sets up the entire house system. The Rising sign is the stage on which the play of your life unfolds.

**How They Work Together:**
The Rising sign determines how you enter a room and approach new situations. The Sun is who you are when you're comfortable. The Moon is who you are at 3 AM. Understanding the relationship between these three tells you more about a person than any other single factor in the chart.`,
    practicalExample: 'Someone with Aries Rising, Sun in Taurus, and Moon in Pisces would: appear bold, direct, and energetic to new people (Aries Rising); actually be grounded, patient, and value-driven at their core (Taurus Sun); and be deeply emotional, intuitive, and sometimes escapist in their private world (Pisces Moon). The contrast between the fiery Rising, earthy Sun, and watery Moon makes for a complex, fascinating personality.',
    keyTakeaway: 'Always start a chart reading with the Big Three. They give you the skeleton of the personality. Everything else adds muscle, skin, and soul to that skeleton.',
  },
  {
    id: 'reading-planet-sign-house',
    title: 'Reading Planet + Sign + House',
    subtitle: 'The sentence structure of astrology',
    accentColor: '#10b981',
    difficulty: 'beginner',
    content: `Every placement in a birth chart is a complete sentence. Here's the grammar:

**Planet = WHAT** (the energy or function)
**Sign = HOW** (the style or flavor)
**House = WHERE** (the life area)

Let's break this down with examples:

**Example 1: Venus in Scorpio in the 7th House**
• Venus (WHAT) = love, relationships, values, pleasure
• Scorpio (HOW) = intensely, deeply, with passion and a desire for transformation
• 7th House (WHERE) = partnerships, marriage, one-on-one relationships

Full reading: "This person loves deeply and intensely in their committed partnerships. They value authenticity and emotional truth in relationships. They may attract transformative, intense partnerships that change who they are."

**Example 2: Mars in Gemini in the 3rd House**
• Mars (WHAT) = action, drive, assertiveness
• Gemini (HOW) = verbally, quickly, with variety and wit
• 3rd House (WHERE) = communication, learning, siblings, local community

Full reading: "This person takes action through words and ideas. They're quick-witted, argumentative, and may have a talent for writing or public speaking. They may also have a competitive relationship with siblings."

**Example 3: Saturn in Capricorn in the 10th House**
• Saturn (WHAT) = discipline, structure, responsibility, maturity
• Capricorn (HOW) = ambitiously, persistently, with long-term vision
• 10th House (WHERE) = career, public life, authority, reputation

Full reading: "This person is a natural authority in their career. They build their professional life slowly and methodically, earning respect through hard work and discipline. They may achieve significant career success, but it will come later in life — after they've paid their dues."

**Practice Tip:** Pick any planet in your chart and write out the sentence: "[Planet] expresses [Sign quality] in the area of [House topic]." This single exercise teaches you the core mechanics of astrology.`,
    practicalExample: 'If you encounter Jupiter in Leo in the 5th House, read it as: "This person finds expansion, luck, and growth (Jupiter) through creative self-expression, joy, and play (Leo) in the areas of romance, children, and artistic pursuits (5th House)." They may be a natural performer, a joyful parent, or someone whose creative projects bring them abundance.',
    keyTakeaway: 'Planet + Sign + House is the fundamental sentence of astrology. Master this formula and you can read any placement in any chart.',
  },
  {
    id: 'reading-aspects-story',
    title: 'How Aspects Tell the Story',
    subtitle: 'The relationships between your planets',
    accentColor: '#3b82f6',
    difficulty: 'intermediate',
    content: `If planets are the characters in your chart's story, aspects are the relationships between those characters. They tell you whether your inner team cooperates, argues, or barely knows each other.

**Conjunctions (0°) — The Inseparable Duo**
Planets in conjunction operate as one unit. Sun conjunct Venus? The person's identity and aesthetic sense are merged. They ARE beauty and charm.

**Squares (90°) — The Productive Tension**
Squares create friction that drives growth. Mars square Saturn? The person's drive for action conflicts with their fear of failure. This tension makes them incredibly persistent and disciplined — if they learn to work with it.

**Oppositions (180°) — The Pendulum**
Oppositions swing between extremes. Moon opposite Saturn? The person alternates between needing emotional closeness and needing to be "strong and alone." Integration is the goal.

**Trines (120°) — The Natural Gift**
Trines show effortless talent. Mercury trine Jupiter? The person thinks big, communicates optimistically, and learns easily. They may take this gift for granted.

**How to Read Aspect Patterns:**
1. Start with the tightest aspects (smallest orb) — they're the strongest
2. Look at what planets are involved — this tells you WHAT functions interact
3. Note the houses involved — this tells you WHERE the interaction plays out
4. Consider whether it's harmonious (trine/sextile) or challenging (square/opposition)

**The Aspect Story:**
A chart with many squares and oppositions belongs to someone dynamic, driven, and sometimes stressed. A chart with many trines belongs to someone talented, easygoing, and sometimes complacent. The most successful people usually have a mix of both — trines give the gift, squares give the drive.`,
    practicalExample: 'Consider someone with Sun trine Jupiter (natural confidence and luck) AND Sun square Pluto (power struggles and transformation). The trine gives them optimism and opportunities. The square forces them to confront their shadow and develop real depth. Together, they create someone who is both fortunate AND resilient — a powerful combination.',
    keyTakeaway: 'Aspects are the STORY of your chart. Planets tell you what energies you have; aspects tell you how those energies interact. Focus on the five major aspects first (conjunction, sextile, square, trine, opposition) before exploring minor ones.',
  },
  {
    id: 'reading-patterns',
    title: 'Spotting Chart Patterns',
    subtitle: 'Seeing the forest, not just the trees',
    accentColor: '#8b5cf6',
    difficulty: 'intermediate',
    content: `Once you can read individual placements and aspects, the next level is seeing the overall PATTERN of the chart. These patterns reveal the person's fundamental approach to life.

**Element Balance:**
Count how many planets are in Fire, Earth, Air, and Water signs.
• Fire-dominant: Action-oriented, impulsive, inspirational
• Earth-dominant: Practical, grounded, materialistic
• Air-dominant: Intellectual, social, communicative
• Water-dominant: Emotional, intuitive, empathic

Missing elements are just as important as dominant ones. A chart with no Water may struggle to access emotions. A chart with no Earth may struggle with practical matters.

**Modality Balance:**
Count Cardinal, Fixed, and Mutable planets.
• Cardinal-heavy: Initiates, starts things, competitive
• Fixed-heavy: Persistent, stubborn, finishes what they start
• Mutable-heavy: Adaptable, versatile, sometimes scattered

**Hemisphere Emphasis:**
• Most planets above the horizon (7th-12th houses): Extroverted, public life matters most
• Most planets below the horizon (1st-6th houses): Introverted, private life matters most
• Most planets on the left (1st-6th houses): Self-determined, independent
• Most planets on the right (7th-12th houses): Relationship-oriented, responsive

**Stelliums:**
Three or more planets in the same sign or house create a stellium — an intense concentration of energy. A 4th house stellium means home and family dominate the person's life. A stellium in Scorpio means the person embodies Scorpionic intensity across many life areas.

**Chart Shape Patterns:**
• **Bowl** (all planets in one half): Focused, specialized
• **Bucket** (bowl with one planet opposite): The lone planet is the "handle" — the person's primary outlet
• **Splash** (planets spread evenly): Versatile, diversified, many interests
• **Locomotive** (planets in 2/3 of the chart): Driven, ambitious, the empty area shows what they're working toward`,
    practicalExample: 'A chart with a stellium of Sun, Mercury, Venus, and Mars in Virgo in the 6th house belongs to someone whose ENTIRE identity is wrapped up in service, health, and daily work. They may be an exceptional doctor, nutritionist, or craftsperson. The key to reading this chart is understanding that the Virgo 6th house energy IS the person, not just one part of them.',
    keyTakeaway: 'Before diving into details, zoom out and see the chart\'s overall shape, element balance, and house emphasis. This "helicopter view" tells you the person\'s fundamental life approach before you read a single placement.',
  },
  {
    id: 'reading-your-first',
    title: 'Reading Your First Chart: A Step-by-Step Guide',
    subtitle: 'Putting it all together',
    accentColor: '#ec4899',
    difficulty: 'intermediate',
    content: `Here's a practical step-by-step method for reading any birth chart:

**Step 1: The Big Three (2 minutes)**
Note the Sun sign, Moon sign, and Rising sign. Write one sentence for each:
• "Their core identity is [Sun Sign] — they express themselves through [key trait]."
• "Their emotional nature is [Moon Sign] — they need [key need] to feel secure."
• "They appear [Rising Sign] to others — their first impression is [key trait]."

**Step 2: Chart Shape & Balance (1 minute)**
Glance at the overall chart. Are planets clustered? Spread out? Dominant element? Note your first impression.

**Step 3: The Angular Houses (2 minutes)**
Look at planets in the 1st, 4th, 7th, and 10th houses. These are the most visible and impactful placements. Any planet in these houses is a major part of the personality.

**Step 4: Key Aspects (3 minutes)**
Find the tightest aspects (smallest orbs). Look for aspects involving the Sun, Moon, and chart ruler. These are the most defining dynamics in the chart.

**Step 5: The Chart Ruler (1 minute)**
Find the ruling planet of the Rising sign. Where is it? This planet ties the whole chart together and reveals the person's overall life approach.

**Step 6: Synthesize (5 minutes)**
Now look for themes. Do multiple placements point to the same life area? Are there repeating patterns? The chart is like a puzzle — each piece adds to the picture.

**Step 7: Tell the Story (ongoing)**
Put it all together in a narrative. Don't just list placements — tell the person's story. What are their strengths? Their growth edges? Their deepest needs? What makes them unique?

**Common Beginner Mistakes:**
• Trying to read every single placement at once — start with the big picture
• Ignoring the house system — houses are where the chart becomes personal
• Focusing only on "good" or "bad" — every placement has healthy and challenging expressions
• Forgetting that the WHOLE chart matters — no single placement defines a person`,
    practicalExample: 'Here\'s a quick reading for a hypothetical chart: Sun in Leo, Moon in Capricorn, Gemini Rising. "You come across as chatty, curious, and quick-witted (Gemini Rising). At your core, you\'re warm, creative, and want to shine (Leo Sun). But privately, you\'re ambitious, disciplined, and take your responsibilities seriously (Moon in Capricorn). Your chart ruler is Mercury — let\'s look at where it is... Mercury in Virgo in the 4th house. So your communication style is analytical and precise, and it\'s deeply connected to your home and family. You might be the organized one who keeps the family connected."',
    keyTakeaway: 'Chart reading is a SKILL that improves with practice. Start with the Big Three, add layers gradually, and always tell a story — not a list. The best astrologers are not the ones who memorize the most keywords, but the ones who can weave all the threads into a meaningful narrative.',
  },
];
