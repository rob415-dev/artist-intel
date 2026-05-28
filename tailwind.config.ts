import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Page & layout
        'page-bg': '#E8E8EA',
        'app-bg': '#F4F4F6',
        'surface': '#FFFFFF',
        'surface-hover': '#F9F9FA',

        // Borders
        'border-subtle': 'rgba(0,0,0,0.07)',
        'border-strong': 'rgba(0,0,0,0.12)',

        // Text
        'text-primary': '#111111',
        'text-secondary': '#6B6B72',
        'text-tertiary': '#9B9BA4',

        // Accent
        'accent': '#E8442A',
        'accent-light': '#FDF0EE',
        'accent-hover': '#D13820',

        // Status
        'positive': '#1A9E5C',
        'positive-bg': '#EAF7F0',
        'negative': '#9B9BA4',

        // Chart
        'chart-1': '#E8442A',
        'chart-2': '#5B8EE8',
        'chart-3': '#C0C0C8',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['12px', { lineHeight: '18px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'md': ['14px', { lineHeight: '22px' }],
        'lg': ['22px', { lineHeight: '28px' }],
        'xl': ['28px', { lineHeight: '34px' }],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'shell': '0 4px 32px rgba(0,0,0,0.08)',
        'nav-active': '0 1px 4px rgba(0,0,0,0.06)',
        'tooltip': '0 2px 12px rgba(0,0,0,0.12)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
    },
  },
  plugins: [],
}

export default config
