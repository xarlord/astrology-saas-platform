/**
 * ElementMeter Component
 * Displays the elemental distribution (Fire/Earth/Air/Water) of a chart
 */

export interface ElementCount {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ElementMeterProps {
  elements: ElementCount;
  total: number;
  showPercentages?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const ELEMENT_INFO = {
  fire: {
    name: 'Fire',
    symbol: '🔥',
    color: '#EF4444',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    description: 'Passion, energy, initiative',
  },
  earth: {
    name: 'Earth',
    symbol: '🌍',
    color: '#10B981',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    description: 'Stability, practicality, material world',
  },
  air: {
    name: 'Air',
    symbol: '💨',
    color: '#3B82F6',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    description: 'Intellect, communication, relationships',
  },
  water: {
    name: 'Water',
    symbol: '💧',
    color: '#6366F1',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    description: 'Emotions, intuition, spirituality',
  },
} as const;

export function ElementMeter({
  elements,
  total,
  showPercentages = true,
  orientation = 'horizontal',
}: ElementMeterProps) {
  const isVertical = orientation === 'vertical';

  const getElementPercentage = (count: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-4`}
      role="region"
      aria-label="Elemental distribution"
    >
      {Object.entries(ELEMENT_INFO).map(([key, info]) => {
        const elementKey = key as keyof ElementCount;
        const count = elements[elementKey];
        const percentage = getElementPercentage(count);

        return (
          <div
            key={key}
            className="flex-1"
            role="listitem"
            aria-label={`${info.name}: ${count} planets (${percentage}%)`}
          >
            {/* Element Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={`${info.name} element`}>
                  {info.symbol}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{info.name}</span>
              </div>
              {showPercentages && (
                <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: info.color,
                }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${info.name} element percentage`}
              />
            </div>

            {/* Planet Count */}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
              {count} {count === 1 ? 'planet' : 'planets'}
            </div>

            {/* Signs (shown on hover/focus) */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {info.signs.join(' • ')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact Element Meter for inline display
 */
export function ElementMeterCompact({
  elements,
  total,
}: {
  elements: ElementCount;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label="Element distribution">
      {Object.entries(ELEMENT_INFO).map(([key, info]) => {
        const elementKey = key as keyof ElementCount;
        const count = elements[elementKey];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div
            key={key}
            className="flex items-center"
            title={`${info.name}: ${count} (${percentage}%)`}
          >
            <span
              className="text-lg"
              style={{ opacity: percentage > 0 ? 1 : 0.3 }}
              aria-label={`${info.name}: ${percentage}%`}
            >
              {info.symbol}
            </span>
            {percentage > 0 && (
              <span className="text-xs ml-0.5 text-gray-600 dark:text-gray-400">{percentage}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Calculate element distribution from planet positions
 */
// eslint-disable-next-line react-refresh/only-export-components
export function calculateElementDistribution(planets: { sign: string }[]): ElementCount {
  const elements: ElementCount = { fire: 0, earth: 0, air: 0, water: 0 };

  planets.forEach((planet) => {
    const sign = planet.sign.toLowerCase();
    if (['aries', 'leo', 'sagittarius'].includes(sign)) {
      elements.fire++;
    } else if (['taurus', 'virgo', 'capricorn'].includes(sign)) {
      elements.earth++;
    } else if (['gemini', 'libra', 'aquarius'].includes(sign)) {
      elements.air++;
    } else if (['cancer', 'scorpio', 'pisces'].includes(sign)) {
      elements.water++;
    }
  });

  return elements;
}

export default ElementMeter;
