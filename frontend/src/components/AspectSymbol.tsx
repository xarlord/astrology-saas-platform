/**
 * UI Components - Aspect Symbol
 */

interface AspectSymbolProps {
  aspect: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function AspectSymbol({ aspect, size = 'md', showName = false, className = '' }: AspectSymbolProps) {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚻',
    semiSextile: '⚼',
  };

  const colors: Record<string, string> = {
    conjunction: 'text-red-500',
    opposition: 'text-red-500',
    trine: 'text-green-500',
    square: 'text-orange-500',
    sextile: 'text-blue-400',
    quincunx: 'text-purple-500',
    semiSextile: 'text-blue-300',
  };

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const aspectNames: Record<string, string> = {
    conjunction: 'Conjunction',
    opposition: 'Opposition',
    trine: 'Trine',
    square: 'Square',
    sextile: 'Sextile',
    quincunx: 'Quincunx',
    semiSextile: 'Semi-Sextile',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`${sizeClasses[size]} ${colors[aspect] || ''}`}>
        {symbols[aspect] || aspect}
      </span>
      {showName && <span className="text-sm">{aspectNames[aspect]}</span>}
    </span>
  );
}
