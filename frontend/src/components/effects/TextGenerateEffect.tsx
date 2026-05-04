import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface TextGenerateEffectProps {
  text: string;
  duration?: number;
  className?: string;
}

export function TextGenerateEffect({
  text,
  duration = 50,
  className,
}: TextGenerateEffectProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    if (visibleCount >= words.length) return;
    const id = setTimeout(() => setVisibleCount((c) => c + 1), duration);
    return () => clearTimeout(id);
  }, [visibleCount, words.length, duration]);

  return (
    <span className={className}>
      <AnimatePresence>
        {words.slice(0, visibleCount).map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            style={{ display: 'inline' }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
