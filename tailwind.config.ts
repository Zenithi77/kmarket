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
        // Brand — Allbirds-style near-black CTA (no colored brand accent)
        primary: {
          50:  '#f6f5f3',
          100: '#eeece8',
          200: '#d9d6cf',
          300: '#b3afa5',
          400: '#7d7972',
          500: '#4a4744',
          600: '#212121',
          700: '#171717',
          800: '#0f0f0f',
          900: '#080808',
          950: '#000000',
        },
        // Sale red — used for discount %, time-deal, ranking badges
        sale: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          500: '#ba1a1a',
          600: '#93000a',
          700: '#93000a',
        },
        // Neutral surface tokens — warm putty/oatmeal, Allbirds-style
        surface: {
          DEFAULT: '#f4f2ee',
          subtle:  '#ece9e2',
          muted:   '#e3e0d8',
          border:  '#d8d4c9',
          divider: '#e3e0d8',
        },
        dark: {
          100: '#1A1A1A',
          200: '#2d2d2d',
          300: '#3d3d3d',
        },
        // Named tokens
        'earth-charcoal': '#212121',
        'soft-bone': '#ECE9E2',
        'clay-gray': '#D8D4C9',
        'amber-highlight': '#FFB347',
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#5c584f',
        'outline': '#8a867b',
        'outline-variant': '#d8d4c9',
        // Warm putty neutral scale replacing Tailwind's default cool gray
        gray: {
          50:  '#f6f5f3',
          100: '#ece9e2',
          200: '#e3e0d8',
          300: '#d8d4c9',
          400: '#b3afa5',
          500: '#8a867b',
          600: '#5c584f',
          700: '#443f37',
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
        'brand':     '0 4px 14px rgba(0, 0, 0, 0.18)',
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
