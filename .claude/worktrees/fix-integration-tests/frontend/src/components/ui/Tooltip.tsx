/**
 * Tooltip Component
 *
 * Tooltip with multiple positions, delay show/hide, and theme support
 * Follows WAI-ARIA tooltip pattern
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'dark' | 'light';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  theme?: TooltipTheme;
  delayShow?: number;
  delayHide?: number;
  disabled?: boolean;
  className?: string;
  maxWidth?: number | string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const themeStyles: Record<TooltipTheme, string> = {
  dark: 'bg-gray-900 dark:bg-gray-700 text-white',
  light: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-700',
};

const animationVariants = {
  top: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  bottom: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  left: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  right: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  theme = 'dark',
  delayShow = 200,
  delayHide = 0,
  disabled = false,
  className,
  maxWidth = 250,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const showTooltip = useCallback(() => {
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);
  }, [clearTimeouts, delayShow]);

  const hideTooltip = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  }, [clearTimeouts, delayHide]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  if (disabled || !content) {
    return children;
  }

  // Get the arrow style based on position and theme
  const getArrowStyle = () => {
    const baseStyle = {
      top: theme === 'dark' ? 'border-t-gray-900 dark:border-t-gray-700' : 'border-t-white dark:border-t-gray-800',
      bottom: theme === 'dark' ? 'border-b-gray-900 dark:border-b-gray-700' : 'border-b-white dark:border-b-gray-800',
      left: theme === 'dark' ? 'border-l-gray-900 dark:border-l-gray-700' : 'border-l-white dark:border-l-gray-800',
      right: theme === 'dark' ? 'border-r-gray-900 dark:border-r-gray-700' : 'border-r-white dark:border-r-gray-800',
    };

    const transformStyle = {
      top: 'top-full left-1/2 -translate-x-1/2',
      bottom: 'bottom-full left-1/2 -translate-x-1/2',
      left: 'left-full top-1/2 -translate-y-1/2',
      right: 'right-full top-1/2 -translate-y-1/2',
    };

    const borderStyle = {
      top: 'border-l-transparent border-r-transparent border-b-transparent',
      bottom: 'border-l-transparent border-r-transparent border-t-transparent',
      left: 'border-t-transparent border-b-transparent border-r-transparent',
      right: 'border-t-transparent border-b-transparent border-l-transparent',
    };

    return clsx(baseStyle[position], transformStyle[position], borderStyle[position]);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={clsx(
              'absolute z-50 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap',
              'pointer-events-none',
              positionStyles[position],
              themeStyles[theme],
              className
            )}
            style={{ maxWidth }}
            initial={animationVariants[position].initial}
            animate={animationVariants[position].animate}
            exit={animationVariants[position].exit}
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <span
              className={clsx(
                'absolute w-0 h-0 border-[6px]',
                getArrowStyle()
              )}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
