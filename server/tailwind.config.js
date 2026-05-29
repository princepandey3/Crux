/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink:    '#0D0F14',
        fog:    '#F4F3EF',
        slate:  '#8A8F9E',
        accent: '#4F6EF7',
        pulse:  '#E05C3A',
        glass:  'rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(79,110,247,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,110,247,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.6s ease both',
        'blink':    'blink 1.1s step-end infinite',
        'slide-in': 'slide-in 0.4s ease both',
      },
    },
  },
  plugins: [],
}
