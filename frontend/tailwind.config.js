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
        ts: {
          bg: 'var(--ts-bg)',
          card: 'var(--ts-card)',
          'card-border': 'var(--ts-card-border)',
          sidebar: 'var(--ts-sidebar)',
          header: 'var(--ts-header)',
          primary: 'var(--ts-primary)',
          'primary-glow': 'var(--ts-primary-glow)',
          secondary: 'var(--ts-secondary)',
          accent: 'var(--ts-accent)',
          text: 'var(--ts-text)',
          muted: 'var(--ts-muted)',
          danger: 'var(--ts-danger)',
          warning: 'var(--ts-warning)',
          success: 'var(--ts-success)',
          info: 'var(--ts-info)',
          cyan: '#00f0ff',
          neonGreen: '#00ff9d',
          magenta: '#ff007f',
          amber: '#f59e0b',
          iceBlue: '#38bdf8'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 2px var(--ts-primary))' },
          '100%': { filter: 'drop-shadow(0 0 12px var(--ts-primary-glow))' },
        }
      }
    },
  },
  plugins: [],
}
