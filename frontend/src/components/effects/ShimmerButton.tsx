import { motion } from 'motion/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function ShimmerButton({ children, className = '', ...props }: ShimmerButtonProps) {
  return (
    <button
      className={`relative overflow-hidden bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
