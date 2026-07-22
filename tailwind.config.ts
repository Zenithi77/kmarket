import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — warm ember/terracotta accent on white
        primary: {
          50:  '#fdf1ea',
          100: '#fbe1d0',
          200: '#f5c3a1',
          300: '#eda06e',
          400: '#e07c40',
          500: '#c85a25',
          600: '#a8441a',
          700: '#83350f',
          800: '#5f260b',
          900: '#3d1707',
          950: '#200b03',
        },
        // Sale red — used for discount %, time-deal, ranking badges
        sale: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          500: '#ba1a1a',
          600: '#93000a',
          700: '#93000a',
        },
        // Neutral surface tokens — clean white with warm-tinted neutrals
        surface: {
          DEFAULT: '#ffffff',
          subtle:  '#faf9f7',
          muted:   '#f2f0ec',
          border:  '#e7e3da',
          divider: '#efece5',
        },
        dark: {
          100: '#1A1A1A',
          200: '#2d2d2d',
          300: '#3d3d3d',
        },
        // Named tokens
        'earth-charcoal': '#1A1A1A',
        'soft-bone': '#FFFFFF',
        'clay-gray': '#E7E3DA',
        'amber-highlight': '#FFB347',
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#6b665c',
        'outline': '#9a9488',
        'outline-variant': '#e7e3da',
        // Warm neutral scale replacing Tailwind's default cool gray
        gray: {
          50:  '#faf9f7',
          100: '#f2f0ec',
          200: '#e7e3da',
          300: '#d8d3c7',
          400: '#b3aea1',
          500: '#9a9488',
          600: '#6b665c',
          700: '#4d493f',
          800: '#2d2a25',
          900: '#1b1a17',
          950: '#000000',
        },
      },
      fontFamily: {
        // Allbirds uses a single grotesque sans (Geograph) everywhere — no separate
        // display face or monospace, so display/mono alias back to the same stack.
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        'soft':      '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card':      '0 1px 3px rgba(15, 23, 42, 0.05), 0 2px 8px rgba(15, 23, 42, 0.04)',
        'cardHover': '0 10px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
        'popover':   '0 8px 24px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.04)',
        'brand':     '0 4px 14px rgba(168, 68, 26, 0.25)',
        'sale':      '0 4px 14px rgba(186, 26, 26, 0.20)',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.35s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'shimmer':    'shimmer 1.6s linear infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
export default config
