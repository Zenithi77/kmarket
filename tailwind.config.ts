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
        // Brand — classic Korean online-shop orange
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Sale red — discount %, time-deal, ranking badges
        sale: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutral surface tokens — clean white, classic mall style
        surface: {
          DEFAULT: '#ffffff',
          subtle:  '#f9fafb',
          muted:   '#f3f4f6',
          border:  '#e5e7eb',
          divider: '#f1f1f4',
        },
        dark: {
          100: '#1e1e1e',
          200: '#2d2d2d',
          300: '#3d3d3d',
        },
        // Named tokens
        'earth-charcoal': '#18181b',
        'soft-bone': '#FFFFFF',
        'clay-gray': '#E5E7EB',
        'amber-highlight': '#FBBF24',
        'on-surface': '#18181b',
        'on-surface-variant': '#52525b',
        'outline': '#a1a1aa',
        'outline-variant': '#e4e4e7',
        // Neutral gray scale — classic e-commerce, slightly cool
        gray: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#000000',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        'soft':      '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card':      '0 1px 3px rgba(15, 23, 42, 0.05), 0 2px 8px rgba(15, 23, 42, 0.04)',
        'cardHover': '0 10px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',
        'popover':   '0 8px 24px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.04)',
        'brand':     '0 6px 18px rgba(249, 115, 22, 0.30)',
        'sale':      '0 6px 18px rgba(239, 68, 68, 0.28)',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse: { '0%, 100%': { opacity: '0.55', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.15)' } },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.35s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'shimmer':    'shimmer 1.6s linear infinite',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
export default config
