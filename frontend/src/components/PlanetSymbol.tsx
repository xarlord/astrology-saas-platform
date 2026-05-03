/**
 * UI Components - Planet Symbol
 */

interface PlanetSymbolProps {
  planet: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function PlanetSymbol({ planet, size = 'md', showName = false, className = '' }: PlanetSymbolProps) {
  const symbols: Record<string, string> = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
    meanNode: '☋',
    trueNode: '☊',
  };

  const colors: Record<string, string> = {
    sun: 'text-yellow-500',
    moon: 'text-slate-400',
    mercury: 'text-amber-400',
    venus: 'text-pink-400',
    mars: 'text-red-500',
    jupiter: 'text-orange-500',
    saturn: 'text-slate-400',
    uranus: 'text-cyan-400',
    neptune: 'text-blue-400',
    pluto: 'text-rose-400',
    meanNode: 'text-slate-400',
    trueNode: 'text-slate-400',
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`${symbols[planet] ? '' : 'text-slate-400'} ${sizeClasses[size]} ${colors[planet] || ''}`}>
        {symbols[planet] || planet}
      </span>
      {showName && <span className="capitalize text-sm">{planet}</span>}
    </span>
  );
}
