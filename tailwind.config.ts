import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0F1C',
          elevated: '#0F1522',
        },
        surface: {
          DEFAULT: '#121826',
          hover: '#1A2233',
          muted: '#0E1420',
        },
        border: {
          DEFAULT: '#1F2A3C',
          subtle: '#151D2B',
          strong: '#2B3952',
        },
        fg: {
          DEFAULT: '#F4F6FB',
          muted: '#9CA7BE',
          subtle: '#5F6B82',
        },
        brand: {
          DEFAULT: '#F97316',
          hover: '#FB923C',
          muted: '#7C2D12',
        },
        success: '#22C55E',
        danger: '#EF4444',
        info: '#3B82F6',
        highlight: '#FACC15',
        zone: {
          ucl: '#3B82F6',
          uel: '#F59E0B',
          uec: '#22C55E',
          relegate: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 6px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(249,115,22,0.35), 0 0 18px -2px rgba(249,115,22,0.35)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
