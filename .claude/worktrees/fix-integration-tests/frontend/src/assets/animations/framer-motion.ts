/**
 * Framer Motion Animation Variants
 *
 * Reusable animation presets for Framer Motion
 * All animations optimized for 60fps performance
 */

import { Variants, Transition } from 'framer-motion';

// ===========================================
// TRANSITION PRESETS
// ===========================================

export const transitions: Record<string, Transition> = {
  // Fast transitions (150ms)
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },

  // Normal transitions (300ms)
  normal: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },

  // Slow transitions (500ms)
  slow: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },

  // Smooth spring
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },

  // Bouncy spring
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },

  // Gentle spring
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 40,
  },
};

// ===========================================
// FADE VARIANTS
// ===========================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ===========================================
// SLIDE VARIANTS
// ===========================================

export const slideUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const slideDown: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const slideLeft: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const slideRight: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

// ===========================================
// SCALE VARIANTS
// ===========================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleOut: Variants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
};

export const scaleAndRotate: Variants = {
  initial: { opacity: 0, scale: 0, rotate: -180 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0, rotate: 180 },
};

// ===========================================
// STAGGER VARIANTS
// ===========================================

export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerFadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const staggerFadeIn = {
  ...staggerContainer,
  children: fadeIn,
};

export const staggerSlideIn = {
  ...staggerContainer,
  children: fadeInUp,
};

// ===========================================
// MODAL VARIANTS
// ===========================================

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export const modalFromBottom: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
};

// ===========================================
// DROPDOWN VARIANTS
// ===========================================

export const dropdownMenu: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

export const dropdownItem: Variants = {
  initial: { x: -10, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -10, opacity: 0 },
};

// ===========================================
// ACCORDION VARIANTS
// ===========================================

export const accordion: Variants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
};

export const accordionIcon: Variants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

// ===========================================
// TAB VARIANTS
// ===========================================

export const tabContent: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const tabIndicator: Variants = {
  initial: { x: 0, width: 0 },
  animate: ((width: number, x: number) => ({
    x,
    width,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  })) as unknown as Variants['animate'],
};

// ===========================================
// LIST VARIANTS
// ===========================================

export const listContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ===========================================
// CARD VARIANTS
// ===========================================

export const cardHover: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const cardFlip: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

// ===========================================
// BUTTON VARIANTS
// ===========================================

export const buttonTap: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

export const buttonShine: Variants = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
};

// ===========================================
// LOADING VARIANTS
// ===========================================

export const spinner: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
    },
  },
};

export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

export const dotPulse: Variants = {
  initial: { scale: 0.8, opacity: 0.5 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
    },
  },
};

// ===========================================
// ASTROLOGY-SPECIFIC VARIANTS
// ===========================================

export const planetOrbit: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 60,
      ease: 'linear',
    },
  },
};

export const planetPulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'easeInOut',
    },
  },
};

export const zodiacGlow: Variants = {
  initial: { boxShadow: '0 0 0px rgba(107, 61, 225, 0)' },
  animate: {
    boxShadow: [
      '0 0 0px rgba(107, 61, 225, 0)',
      '0 0 20px rgba(107, 61, 225, 0.3)',
      '0 0 0px rgba(107, 61, 225, 0)',
    ],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'easeInOut',
    },
  },
};

export const moonPhase: Variants = {
  new: { rotate: 0, scale: 0.9 },
  waxing: { rotate: 90, scale: 1 },
  full: { rotate: 180, scale: 1.1 },
  waning: { rotate: 270, scale: 1 },
};

export const chartWheel: Variants = {
  initial: { rotate: -180, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
};

// ===========================================
// PAGE TRANSITION VARIANTS
// ===========================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slidePage: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

// ===========================================
// NOTIFICATION VARIANTS
// ===========================================

export const notificationSlide: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
};

export const notificationFade: Variants = {
  initial: { opacity: 0, scale: 0.9, y: -20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -20 },
};

// ===========================================
// TOOLTIP VARIANTS
// ===========================================

export const tooltip: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 10 },
};

// ===========================================
// SKELETON LOADING VARIANTS
// ===========================================

export const skeleton: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

// ===========================================
// DRAWING ANIMATION VARIANTS
// ===========================================

export const drawPath: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, ease: 'easeInOut' },
      opacity: { duration: 0.1 },
    },
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.1 },
    },
  },
};

// ===========================================
// 3D EFFECT VARIANTS
// ===========================================

export const rotate3D: Variants = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: {
    rotateX: 10,
    rotateY: 10,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

export const flipCard: Variants = {
  initial: { rotateY: 0 },
  animate: { rotateY: 180 },
  exit: { rotateY: 0 },
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Create stagger variants with custom delay
 */
export const createStagger = (delay = 0.1): Variants => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: delay / 2,
      staggerDirection: -1,
    },
  },
});

/**
 * Create fade in direction variant
 */
export const createFadeInDirection = (direction: 'up' | 'down' | 'left' | 'right', distance = 20): Variants => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;

  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: -value },
  };
};

/**
 * Create scale variant
 */
export const createScale = (initialScale = 0.9): Variants => ({
  initial: { opacity: 0, scale: initialScale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: initialScale },
});

// ===========================================
// EXPORT ALL VARIANTS
// ===========================================

export const variants = {
  // Fade
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,

  // Slide
  slideUp,
  slideDown,
  slideLeft,
  slideRight,

  // Scale
  scaleIn,
  scaleOut,
  scaleAndRotate,

  // Stagger
  staggerContainer,
  staggerFadeInUp,
  staggerFadeIn,
  staggerSlideIn,

  // Components
  modalOverlay,
  modalContent,
  modalFromBottom,
  dropdownMenu,
  dropdownItem,
  accordion,
  accordionIcon,
  tabContent,
  tabIndicator,
  listContainer,
  listItem,

  // Interactive
  cardHover,
  cardFlip,
  buttonTap,
  buttonShine,

  // Loading
  spinner,
  pulse,
  shimmer,
  dotPulse,
  skeleton,

  // Astrology
  planetOrbit,
  planetPulse,
  zodiacGlow,
  moonPhase,
  chartWheel,

  // Pages
  pageTransition,
  slidePage,

  // Feedback
  notificationSlide,
  notificationFade,
  tooltip,

  // Drawing
  drawPath,

  // 3D
  rotate3D,
  flipCard,

  // Utilities
  createStagger,
  createFadeInDirection,
  createScale,
};

export default variants;
