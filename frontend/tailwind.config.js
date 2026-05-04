/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cosmic: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          'card-solid': 'var(--color-bg-card-solid)',
          hover: 'var(--color-bg-hover)',
          active: 'var(--color-bg-active)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          surface: '#151725',
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366F1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#6b3de1',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B5CF6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        lavender: '#A78BFA',
        'cosmic-blue': '#2563EB',
        gold: '#F5A623',
        'surface-dark': '#151725',
        'surface-light': '#1e2136',
        // Zodiac colors
        zodiac: {
          fire: '#EF4444',
          earth: '#10B981',
          air: '#3B82F6',
          water: '#6366F1',
        },
        // Planet colors
        planet: {
          sun: '#FFD700',
          moon: '#C0C0C0',
          mercury: '#8B4513',
          venus: '#FF69B4',
          mars: '#FF0000',
          jupiter: '#FFA500',
          saturn: '#696969',
          uranus: '#40E0D0',
          neptune: '#4169E1',
          pluto: '#8B0000',
        },
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideUpMobile: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        progress: {
          from: { strokeDasharray: '0 100' },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-up-mobile': 'slideUpMobile 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'progress': 'progress 1s ease-out forwards',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      zIndex: {
        topnav: 30,
        overlay: 40,
        sidebar: 50,
        modal: 60,
        toast: 70,
        'sw-banner': 80,
        'skip-link': 100,
      },
    },
  },
  plugins: [],
  // Custom utilities for accessibility
  corePlugins: {
    preflight: true,
  },
};
