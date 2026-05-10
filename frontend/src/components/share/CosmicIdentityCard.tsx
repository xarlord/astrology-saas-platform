/**
 * CosmicIdentityCard Component
 *
 * Beautiful animated card showing Big Three (Sun/Moon/Rising) with
 * deterministic cosmic fingerprint pattern, designed for sharing.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CosmicIdentityCardProps {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  userName: string;
  onShare?: () => void;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#FF6B35',
  Earth: '#4CAF50',
  Air: '#64B5F6',
  Water: '#7C4DFF',
};

const SIGN_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3,
  Leo: 4, Virgo: 5, Libra: 6, Scorpio: 7,
  Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

/** Generate deterministic SVG path from sign combination */
function generateFingerprintPath(sun: string, moon: string, rising: string): string {
  const s = SIGN_INDEX[sun] ?? 0;
  const m = SIGN_INDEX[moon] ?? 0;
  const r = SIGN_INDEX[rising] ?? 0;

  const seed = s * 144 + m * 12 + r;
  const points: string[] = [];
  const cx = 150;
  const cy = 100;

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const baseR = 50 + (i * seed) % 40;
    const wobble = Math.sin(seed * (i + 1) * 0.1) * 15;
    const radius = baseR + wobble;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  points.push('Z');

  // Inner pattern
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r1 = 20 + (seed * (i + 3)) % 15;
    const r2 = 35 + (seed * (i + 7)) % 20;
    points.push(`M ${(cx + r1 * Math.cos(angle)).toFixed(1)} ${(cy + r1 * Math.sin(angle)).toFixed(1)}`);
    points.push(`L ${(cx + r2 * Math.cos(angle)).toFixed(1)} ${(cy + r2 * Math.sin(angle)).toFixed(1)}`);
  }

  return points.join(' ');
}

const CosmicIdentityCard: React.FC<CosmicIdentityCardProps> = ({
  sunSign,
  moonSign,
  risingSign,
  userName,
  onShare,
}) => {
  const fingerprintPath = useMemo(
    () => generateFingerprintPath(sunSign, moonSign, risingSign),
    [sunSign, moonSign, risingSign],
  );

  const signs = [
    { label: 'Sun', sign: sunSign, symbol: ZODIAC_SYMBOLS[sunSign] ?? '?' },
    { label: 'Moon', sign: moonSign, symbol: ZODIAC_SYMBOLS[moonSign] ?? '?' },
    { label: 'Rising', sign: risingSign, symbol: ZODIAC_SYMBOLS[risingSign] ?? '?' },
  ];

  const dominantElement = useMemo(() => {
    const counts: Record<string, number> = {};
    [sunSign, moonSign, risingSign].forEach((sign) => {
      const el = ELEMENT_MAP[sign] ?? 'Fire';
      counts[el] = (counts[el] ?? 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Fire';
  }, [sunSign, moonSign, risingSign]);

  const bgGradient = useMemo(() => {
    const colors: Record<string, string> = {
      Fire: 'from-red-900/80 via-orange-900/60 to-yellow-900/80',
      Earth: 'from-green-900/80 via-emerald-900/60 to-teal-900/80',
      Air: 'from-blue-900/80 via-sky-900/60 to-cyan-900/80',
      Water: 'from-indigo-900/80 via-purple-900/60 to-violet-900/80',
    };
    return colors[dominantElement] ?? colors.Fire;
  }, [dominantElement]);

  return (
    <motion.div
      data-testid="cosmic-identity-card"
      className={`relative w-[360px] h-[480px] rounded-2xl overflow-hidden bg-gradient-to-br ${bgGradient} border border-white/10 shadow-2xl`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Cosmic Fingerprint Background */}
      <div className="absolute inset-0 opacity-10" data-testid="cosmic-fingerprint">
        <svg viewBox="0 0 300 200" className="w-full h-full">
          <motion.path
            d={fingerprintPath}
            fill="none"
            stroke="white"
            strokeWidth={0.8}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">Cosmic Identity</p>
          <h2 className="text-2xl font-bold text-white">{userName}</h2>
        </div>

        {/* Big Three Cards */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {signs.map(({ label, sign, symbol }) => {
            const element = ELEMENT_MAP[sign] ?? 'Fire';
            const color = ELEMENT_COLORS[element] ?? '#888';
            return (
              <motion.div
                key={label}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <span className="text-3xl" style={{ color }}>
                  {symbol}
                </span>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
                  <p className="text-lg font-semibold text-white">{sign}</p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {element}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer with Share */}
        <div className="text-center mt-4">
          <button
            data-testid="share-button"
            onClick={onShare}
            className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10"
          >
            ↗ Share My Cosmic ID
          </button>
          <p className="text-[10px] text-white/30 mt-2">astroverse.app</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CosmicIdentityCard;
