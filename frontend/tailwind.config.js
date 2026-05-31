import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        muted: 'var(--color-muted)',
        mono: 'var(--color-mono)',
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-500)',
        },
        health: {
          good: 'var(--color-healthy)',
          healthy: 'var(--color-healthy)',
          warning: 'var(--color-warning)',
          critical: 'var(--color-critical)',
          info: 'var(--color-info)',
        },
      },
      fontFamily: {
        head: ['var(--font-display)'],
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        h2: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        small: ['0.8125rem', { lineHeight: '1.25rem' }],
        'mono-lg': ['1rem', { lineHeight: '1.5rem' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        xxl: 'var(--radius-xxl)',
        pill: 'var(--radius-pill)',
        panel: 'var(--radius-lg)',
      },
      boxShadow: {
        panel: 'var(--glass-shadow)',
      },
    },
  },
  plugins: [typography],
}
