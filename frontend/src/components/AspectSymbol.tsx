/**
 * UI Components - Aspect Symbol
 */
import { ASPECTS, getAspectSymbol, getAspectColorClass, getAspectLabel } from '@/constants/aspects';

interface AspectSymbolProps {
  aspect: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function AspectSymbol({
  aspect,
  size = 'md',
  showName = false,
  className = '',
}: AspectSymbolProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const info = (ASPECTS as Record<string, { symbol: string; label: string; colorClass: string }>)[aspect];
  const symbol = info?.symbol ?? getAspectSymbol(aspect);
  const label = info?.label ?? getAspectLabel(aspect);
  const colorClass = info?.colorClass ?? getAspectColorClass(aspect);

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`${sizeClasses[size]} ${colorClass}`}>
        {symbol}
      </span>
      {showName && <span className="text-sm">{label}</span>}
    </span>
  );
}
