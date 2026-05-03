/**
 * UI Components - Zodiac Sign Badge
 */

interface ZodiacBadgeProps {
  sign: string;
  size?: 'sm' | 'md' | 'lg';
  showDegree?: boolean;
  degree?: number;
  className?: string;
}

export function ZodiacBadge({ sign, size = 'md', showDegree = false, degree, className = '' }: ZodiacBadgeProps) {
  const colors: Record<string, string> = {
    aries: 'bg-red-500/20 text-red-400',
    taurus: 'bg-green-500/20 text-green-400',
    gemini: 'bg-blue-500/20 text-blue-400',
    cancer: 'bg-indigo-500/20 text-indigo-300',
    leo: 'bg-amber-500/20 text-amber-400',
    virgo: 'bg-emerald-500/20 text-emerald-400',
    libra: 'bg-pink-500/20 text-pink-400',
    scorpio: 'bg-red-500/20 text-red-400',
    sagittarius: 'bg-orange-500/20 text-orange-400',
    capricorn: 'bg-white/15 text-slate-200',
    aquarius: 'bg-cyan-500/20 text-cyan-400',
    pisces: 'bg-purple-500/20 text-purple-400',
  };

  const symbols: Record<string, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${colors[sign] || 'bg-white/15 text-slate-200'} ${sizeClasses[size]} ${className}`}>
      <span>{symbols[sign]}</span>
      <span className="capitalize font-medium">{signName}</span>
      {showDegree && degree !== undefined && (
        <span className="text-xs opacity-75">{degree.toFixed(2)}°</span>
      )}
    </span>
  );
}
