/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        card: 'var(--color-card)',
        'card-border': 'var(--color-card-border)',
        'card-hover': 'var(--color-card-hover)',
        gold: 'var(--color-primary)',
        'gold-light': 'var(--color-primary-light)',
        'gold-dark': 'var(--color-primary-dark)',
        orange: 'var(--color-secondary)',
        'orange-light': 'var(--color-secondary-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'alert-bg': 'var(--color-alert-bg)',
        'alert-border': 'var(--color-alert-border)',
        'success-bg': 'var(--color-success-bg)',
        'success-border': 'var(--color-success-border)',
        'error-bg': 'var(--color-error-bg)',
        'error-border': 'var(--color-error-border)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
      },
      boxShadow: {
        DEFAULT: '0 4px 24px rgba(0,0,0,0.3)',
        glow: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
        'glow-strong': 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
