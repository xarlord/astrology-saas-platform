/**
 * Card Component
 *
 * Versatile card component with multiple variants and sections
 * Uses Framer Motion for hover effects
 */

import React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type CardVariant = 'default' | 'glass' | 'elevated';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  glass:
    'bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-white/20 dark:border-gray-700/50',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/30',
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const hoverVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  children,
  className,
  ...props
}) => {
  const isInteractive = hoverable || clickable;

  return (
    <motion.div
      className={clsx(
        'rounded-xl overflow-hidden',
        variantStyles[variant],
        paddingStyles[padding],
        isInteractive && 'cursor-pointer',
        className,
      )}
      variants={isInteractive ? hoverVariants : undefined}
      initial={isInteractive ? 'rest' : undefined}
      whileHover={isInteractive ? 'hover' : undefined}
      whileTap={clickable ? 'tap' : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Card.Header subcomponent
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  bordered = false,
  ...props
}) => (
  <div
    className={clsx(
      'px-4 py-3 sm:px-6 sm:py-4',
      bordered && 'border-b border-gray-200 dark:border-gray-700',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;

// Card.Body subcomponent
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className, ...props }) => (
  <div className={clsx('px-4 py-3 sm:px-6 sm:py-4', className)} {...props}>
    {children}
  </div>
);

Card.Body = CardBody;

// Card.Footer subcomponent
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
  bordered?: boolean;
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  align = 'right',
  bordered = false,
  ...props
}) => (
  <div
    className={clsx(
      'px-4 py-3 sm:px-6 sm:py-4',
      bordered && 'border-t border-gray-200 dark:border-gray-700',
      align === 'left' && 'flex justify-start',
      align === 'center' && 'flex justify-center',
      align === 'right' && 'flex justify-end gap-3',
      align === 'between' && 'flex justify-between items-center',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Footer = CardFooter;

export default Card;
