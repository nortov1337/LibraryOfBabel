/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Theme tokens. Values live in CSS variables (see src/index.css) so
        // every theme is defined in exactly one place.
        app: {
          bg: 'var(--bg)',
          header: 'var(--header-bg)',
          solid: 'var(--surface-solid)',
          surface: 'var(--surface)',
          'surface-2': 'var(--surface-2)',
          'surface-hover': 'var(--surface-hover)',
          text: 'var(--text)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
          accent: 'var(--accent)',
          'accent-soft': 'var(--accent-soft)',
          'accent-soft-strong': 'var(--accent-soft-strong)',
          'accent-contrast': 'var(--accent-contrast)',
          success: 'var(--success)',
          'success-soft': 'var(--success-soft)',
          danger: 'var(--danger)',
          'danger-soft': 'var(--danger-soft)',
          warning: 'var(--warning)',
          'warning-soft': 'var(--warning-soft)',
          overlay: 'var(--overlay)',
        },
        // Kept for any legacy usage; new code should use `app`.
        gold: {
          50: '#faf6ec',
          100: '#f3ead0',
          200: '#e7d5a3',
          300: '#d9bc72',
          400: '#cba64d',
          500: '#c9a86a',
          600: '#a9833c',
          700: '#86642f',
          800: '#6b4f2a',
          900: '#594226',
        },
        ink: {
          950: '#08080a',
          900: '#0c0c0f',
          850: '#111116',
          800: '#16161c',
          700: '#20202a',
          600: '#2b2b38',
          500: '#3a3a4a',
        },
      },
      boxShadow: {
        soft: 'var(--shadow)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-highlight': {
          '0%': { boxShadow: '0 0 0 0 var(--accent-ring)' },
          '100%': { boxShadow: '0 0 0 6px transparent' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.18s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-highlight': 'pulse-highlight 0.6s ease-out 1',
      },
    },
  },
  plugins: [],
};
