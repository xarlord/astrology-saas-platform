import { useMemo } from 'react';

interface MeteorEffectProps {
  count?: number;
  minDuration?: number;
  maxDuration?: number;
}

interface Meteor {
  id: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
  length: number;
  angle: number;
}

const generateMeteors = (count: number, min: number, max: number): Meteor[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 80}%`,
    duration: min + Math.random() * (max - min),
    delay: Math.random() * 6,
    length: 80 + Math.random() * 160,
    angle: 200 + Math.random() * 40,
  }));

const keyframes = `
@keyframes meteor-fall {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  5% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(80vh) translateX(-40vw); opacity: 0; }
}`;

export function MeteorEffect({
  count = 20,
  minDuration = 2,
  maxDuration = 5,
}: MeteorEffectProps) {
  const meteors = useMemo(
    () => generateMeteors(count, minDuration, maxDuration),
    [count, minDuration, maxDuration],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style>{keyframes}</style>
      {meteors.map(({ id, left, top, duration, delay, length, angle }) => (
        <span
          key={id}
          className="absolute block rounded-full"
          style={{
            left,
            top,
            width: 2,
            height: length,
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(168,85,247,0.3), transparent)',
            transform: `rotate(${angle}deg)`,
            animation: `meteor-fall ${duration}s ${delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}
