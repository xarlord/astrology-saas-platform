/**
 * Avatar Component
 *
 * User avatar with image or initials fallback, size variants,
 * and status indicator
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  shape?: 'circle' | 'square';
  className?: string;
  onClick?: () => void;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusStyles: Record<AvatarStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizeStyles: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 ring-1',
  sm: 'w-2 h-2 ring-2',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3 h-3 ring-2',
  xl: 'w-4 h-4 ring-2',
};

// Color mapping for initials background based on name
const getColorFromString = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  shape = 'circle',
  className,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const showInitials = !src || imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  const containerClasses = clsx(
    'relative inline-flex items-center justify-center',
    sizeStyles[size],
    shape === 'circle' ? 'rounded-full' : 'rounded-lg',
    onClick && 'cursor-pointer',
    className,
  );

  const avatarContent = (
    <>
      {showInitials ? (
        <span
          className={clsx(
            'w-full h-full flex items-center justify-center font-medium text-white',
            shape === 'circle' ? 'rounded-full' : 'rounded-lg',
            name ? getColorFromString(name) : 'bg-gray-400',
          )}
          aria-hidden="true"
        >
          {name ? getInitials(name) : '?'}
        </span>
      ) : (
        <img
          src={src}
          alt={alt ?? name ?? 'Avatar'}
          onError={handleImageError}
          className={clsx(
            'w-full h-full object-cover',
            shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          )}
        />
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-white dark:ring-gray-900',
            statusStyles[status],
            statusSizeStyles[size],
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </>
  );

  const ariaLabel = alt ?? name ?? 'Avatar';

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={containerClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={ariaLabel}
      >
        {avatarContent}
      </motion.button>
    );
  }

  return (
    <div className={containerClasses} aria-label={ariaLabel}>
      {avatarContent}
    </div>
  );
};

// Avatar Group for displaying multiple avatars
export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  size = 'md',
  className,
}) => {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlapStyles: Record<AvatarSize, string> = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
  };

  return (
    <div className={clsx('flex items-center', className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={clsx(
            index > 0 && overlapStyles[size],
            'ring-2 ring-white dark:ring-gray-900 rounded-full',
          )}
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ size?: AvatarSize }>, { size })
            : child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={clsx(
            overlapStyles[size],
            'ring-2 ring-white dark:ring-gray-900 rounded-full',
            'flex items-center justify-center bg-gray-200 dark:bg-gray-700',
            sizeStyles[size],
            'rounded-full text-gray-600 dark:text-gray-300 font-medium',
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
