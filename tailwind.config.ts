import type { Config } from 'tailwindcss';

/**
 * ClipAnalisis design system — OURO · PRETO · BRANCO.
 * Gold is treated as METAL (highlight + shadow), never as flat yellow.
 * Tokens mirror the CSS variables declared in src/styles/tokens.css so both
 * Tailwind utilities and raw CSS stay in sync.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        white: 'var(--white)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        gold: {
          DEFAULT: 'var(--gold)',
          hi: 'var(--gold-hi)',
          lo: 'var(--gold-lo)',
        },
        danger: 'var(--danger)',
        // App section — violet dark
        app: {
          'bg-primary':   'var(--app-bg-primary)',
          'bg-secondary': 'var(--app-bg-secondary)',
          'bg-card':      'var(--app-bg-card)',
          'bg-hover':     'var(--app-bg-hover)',
          'border-subtle':  'var(--app-border-subtle)',
          'border-default': 'var(--app-border-default)',
          'border-strong':  'var(--app-border-strong)',
          accent:        'var(--app-accent)',
          'accent-hover': 'var(--app-accent-hover)',
          'accent-subtle':'var(--app-accent-subtle)',
          'text-primary':   'var(--app-text-primary)',
          'text-secondary': 'var(--app-text-secondary)',
          'text-muted':     'var(--app-text-muted)',
          success: 'var(--app-success)',
          warning: 'var(--app-warning)',
          error:   'var(--app-error)',
          info:    'var(--app-info)',
        },
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // App section fonts
        grotesk: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xzk: '12px',
        'xzk-lg': '14px',
      },
      boxShadow: {
        'gold-glow': '0 0 0 1px rgba(212,175,55,0.25), 0 8px 40px -12px rgba(212,175,55,0.30)',
        'gold-strong': '0 0 0 1px rgba(212,175,55,0.45), 0 18px 60px -16px rgba(212,175,55,0.45)',
        lift: '0 30px 60px -20px rgba(0,0,0,0.75)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      keyframes: {
        sheen: {
          '0%': { backgroundPosition: '-150% 0' },
          '100%': { backgroundPosition: '250% 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-120%)' },
          '100%': { transform: 'translateY(120%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        sheen: 'sheen 6s ease-in-out infinite',
        scan: 'scan 4.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        ticker: 'ticker 32s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
