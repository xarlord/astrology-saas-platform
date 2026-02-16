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
    aries: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    taurus: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    cancer: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    leo: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    virgo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    libra: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    scorpio: 'bg-red-900 text-red-100 dark:bg-red-950 dark:text-red-300',
    sagittarius: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    capricorn: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    aquarius: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    pisces: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
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
    <span className={`inline-flex items-center gap-1.5 rounded-full ${colors[sign] || 'bg-gray-100'} ${sizeClasses[size]} ${className}`}>
      <span>{symbols[sign]}</span>
      <span className="capitalize font-medium">{signName}</span>
      {showDegree && degree !== undefined && (
        <span className="text-xs opacity-75">{degree.toFixed(2)}°</span>
      )}
    </span>
  );
}
