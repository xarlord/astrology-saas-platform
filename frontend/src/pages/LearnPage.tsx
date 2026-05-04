/**
 * Learn Page Component
 * Educational content about astrology: planets, signs, houses, aspects
 */

import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  children: React.ReactNode;
}

function ExpandableCard({ title, subtitle, accentColor, children }: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/15 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <h4 className="font-semibold text-white">{title}</h4>
            {subtitle && (
              <p className="text-sm text-slate-200 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <span className="material-symbols-outlined text-slate-200 flex-shrink-0 text-xl" aria-hidden="true">expand_less</span>
        ) : (
          <span className="material-symbols-outlined text-slate-200 flex-shrink-0 text-xl" aria-hidden="true">expand_more</span>
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-white/[0.08] pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

const planets = [
  { name: 'Sun', symbol: '☉', description: 'Core identity, ego, vitality, and conscious purpose. The Sun represents who you are at your essence and the driving force behind your life direction.' },
  { name: 'Moon', symbol: '☽', description: 'Emotions, instincts, subconscious habits, and inner needs. The Moon governs your emotional responses and what makes you feel secure.' },
  { name: 'Mercury', symbol: '☿', description: 'Communication, thinking patterns, learning style, and intellectual expression. Mercury rules how you process and share information.' },
  { name: 'Venus', symbol: '♀', description: 'Love, beauty, values, and relationships. Venus describes what you find attractive, how you express affection, and your aesthetic sensibilities.' },
  { name: 'Mars', symbol: '♂', description: 'Action, energy, desire, and assertiveness. Mars drives your ambition, competitive spirit, and how you pursue what you want.' },
  { name: 'Jupiter', symbol: '♃', description: 'Growth, expansion, optimism, and wisdom. Jupiter represents abundance, opportunity, and your philosophical or spiritual outlook.' },
  { name: 'Saturn', symbol: '♄', description: 'Discipline, structure, responsibility, and life lessons. Saturn teaches through challenges and builds lasting foundations through effort.' },
  { name: 'Uranus', symbol: '♅', description: 'Innovation, rebellion, sudden change, and individuality. Uranus breaks old patterns and brings revolutionary shifts in consciousness.' },
  { name: 'Neptune', symbol: '♆', description: 'Dreams, illusion, spirituality, and compassion. Neptune blurs boundaries, inspires creativity, and dissolves the ego.' },
  { name: 'Pluto', symbol: '♇', description: 'Transformation, power, regeneration, and the unconscious. Pluto destroys and rebuilds, governing deep psychological change.' },
];

const signs = [
  { name: 'Aries', symbol: '♈', element: 'Fire', trait: 'Bold, ambitious, and competitive. Aries charges forward with courage and a pioneering spirit.' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', trait: 'Patient, reliable, and sensual. Taurus values stability, comfort, and the material pleasures of life.' },
  { name: 'Gemini', symbol: '♊', element: 'Air', trait: 'Curious, adaptable, and communicative. Gemini thrives on variety, learning, and social connection.' },
  { name: 'Cancer', symbol: '♋', element: 'Water', trait: 'Nurturing, intuitive, and protective. Cancer is deeply connected to home, family, and emotional bonds.' },
  { name: 'Leo', symbol: '♌', element: 'Fire', trait: 'Charismatic, generous, and creative. Leo shines with confidence and a natural flair for leadership.' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', trait: 'Analytical, diligent, and service-oriented. Virgo seeks perfection and excels at detailed, methodical work.' },
  { name: 'Libra', symbol: '♎', element: 'Air', trait: 'Diplomatic, harmonious, and aesthetically minded. Libra seeks balance, fairness, and meaningful partnerships.' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', trait: 'Intense, resourceful, and transformative. Scorpio delves fearlessly into the depths of emotion and power.' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', trait: 'Adventurous, philosophical, and optimistic. Sagittarius pursues truth, freedom, and expansive experiences.' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', trait: 'Disciplined, strategic, and ambitious. Capricorn builds enduring structures through perseverance and responsibility.' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', trait: 'Progressive, independent, and humanitarian. Aquarius envisions a better future and champions unconventional ideas.' },
  { name: 'Pisces', symbol: '♓', element: 'Water', trait: 'Empathetic, imaginative, and spiritually attuned. Pisces dissolves boundaries and channels profound creativity.' },
];

const houses = [
  { number: 1, name: 'Self', description: 'Your outward personality, physical appearance, and how you present yourself to the world. The Ascendant shapes first impressions.' },
  { number: 2, name: 'Resources', description: 'Personal finances, material possessions, self-worth, and what you value most. Governs your relationship with money.' },
  { number: 3, name: 'Communication', description: 'Thinking patterns, speech, writing, short trips, siblings, and your immediate environment. How you exchange ideas.' },
  { number: 4, name: 'Home', description: 'Family roots, childhood, domestic life, and emotional foundations. Represents your private inner world and sense of belonging.' },
  { number: 5, name: 'Creativity', description: 'Self-expression, romance, children, pleasure, and creative pursuits. The house of play, passion, and artistic talent.' },
  { number: 6, name: 'Health', description: 'Daily routines, physical well-being, work habits, and service to others. Governs how you maintain your body and mind.' },
  { number: 7, name: 'Partnership', description: 'One-on-one relationships, marriage, business partnerships, and open enemies. Reflects what you seek in others.' },
  { number: 8, name: 'Transformation', description: 'Shared resources, intimacy, psychological depth, death and rebirth. Governs inheritance, taxes, and deep transformation.' },
  { number: 9, name: 'Philosophy', description: 'Higher education, long-distance travel, belief systems, and the search for meaning. Expands your worldview.' },
  { number: 10, name: 'Career', description: 'Public reputation, professional achievements, authority figures, and life direction. The Midheaven shapes your legacy.' },
  { number: 11, name: 'Community', description: 'Friendships, group affiliations, hopes, wishes, and social causes. How you connect with the collective.' },
  { number: 12, name: 'Spirit', description: 'The unconscious, hidden strengths, solitude, spiritual practice, and karmic patterns. The realm of the unseen.' },
];

const aspects = [
  { name: 'Conjunction', angle: '0°', symbol: '☌', nature: 'Neutral/Powerful', description: 'Two planets in the same degree merge their energies. This is the most intense aspect, amplifying both planets significantly. It can be harmonious or challenging depending on the planets involved.' },
  { name: 'Opposition', angle: '180°', symbol: '☍', nature: 'Challenging', description: 'Planets directly across from each other create tension and awareness. Oppositions highlight polarities in your life that need integration and balance.' },
  { name: 'Trine', angle: '120°', symbol: '△', nature: 'Harmonious', description: 'Planets in the same element flow together naturally. Trines represent talents and ease, but can lead to complacency if not actively developed.' },
  { name: 'Square', angle: '90°', symbol: '□', nature: 'Challenging', description: 'Planets at right angles create friction and motivation. Squares drive growth through tension, forcing you to overcome obstacles and build character.' },
  { name: 'Sextile', angle: '60°', symbol: '⚹', nature: 'Harmonious', description: 'Planents two signs apart offer cooperative opportunities. Sextiles are gentler than trines and require conscious effort to unlock their potential.' },
];

const elementColors: Record<string, string> = {
  Fire: '#ef4444',
  Earth: '#84cc16',
  Air: '#3b82f6',
  Water: '#6366f1',
};

export default function LearnPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '22px' }}>menu_book</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Learn Astrology</h1>
            <p className="text-slate-200 mt-1">
              Explore the fundamental building blocks of astrological interpretation
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: The Planets */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ color: '#f59e0b' }}>auto_awesome</span>
          <h3 className="text-xl font-bold text-white">The Planets</h3>
          <span className="text-sm text-slate-200 ml-2">
            The celestial bodies that shape your chart
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {planets.map((planet) => (
            <ExpandableCard
              key={planet.name}
              title={`${planet.symbol} ${planet.name}`}
              accentColor="#f59e0b"
            >
              <p className="text-sm text-slate-200 leading-relaxed">
                {planet.description}
              </p>
            </ExpandableCard>
          ))}
        </div>
      </section>

      {/* Section 2: The Signs */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ color: '#f43f5e' }}>auto_awesome</span>
          <h3 className="text-xl font-bold text-white">The Zodiac Signs</h3>
          <span className="text-sm text-slate-200 ml-2">
            Twelve archetypes of expression
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {signs.map((sign) => (
            <ExpandableCard
              key={sign.name}
              title={`${sign.symbol} ${sign.name}`}
              subtitle={sign.element}
              accentColor={elementColors[sign.element]}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${elementColors[sign.element]}20`,
                    color: elementColors[sign.element],
                  }}
                >
                  {sign.element}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {sign.trait}
              </p>
            </ExpandableCard>
          ))}
        </div>
      </section>

      {/* Section 3: The Houses */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ color: '#10b981' }}>auto_awesome</span>
          <h3 className="text-xl font-bold text-white">The Houses</h3>
          <span className="text-sm text-slate-200 ml-2">
            Twelve domains of life experience
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {houses.map((house) => (
            <ExpandableCard
              key={house.number}
              title={`House ${house.number} - ${house.name}`}
              accentColor="#10b981"
            >
              <p className="text-sm text-slate-200 leading-relaxed">
                {house.description}
              </p>
            </ExpandableCard>
          ))}
        </div>
      </section>

      {/* Section 4: The Aspects */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px', color: '#3b82f6' }}>auto_awesome</span>
          <h3 className="text-xl font-bold text-white">The Aspects</h3>
          <span className="text-sm text-slate-200 ml-2">
            Angular relationships between planets
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aspects.map((aspect) => (
            <ExpandableCard
              key={aspect.name}
              title={`${aspect.symbol} ${aspect.name} (${aspect.angle})`}
              subtitle={aspect.nature}
              accentColor={aspect.nature === 'Harmonious' ? '#22c55e' : aspect.nature === 'Challenging' ? '#ef4444' : '#f59e0b'}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    aspect.nature === 'Harmonious'
                      ? 'bg-green-500/10 text-green-400'
                      : aspect.nature === 'Challenging'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {aspect.nature}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {aspect.description}
              </p>
            </ExpandableCard>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
