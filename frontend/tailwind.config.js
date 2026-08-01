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
        cyber: {
          dark: '#0a0d14',
          card: '#111622',
          cardBorder: '#1e293b',
          accent: '#00f0ff',
          neonGreen: '#00ff9d',
          neonPurple: '#a855f7',
          neonRed: '#ff2a6d',
          neonYellow: '#ffc800',
          text: '#94a3b8',
          textHover: '#f8fafc'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'cyber-glow': '0 0 15px rgba(0, 240, 255, 0.25)',
        'neon-red': '0 0 15px rgba(255, 42, 109, 0.3)',
        'neon-green': '0 0 15px rgba(0, 255, 157, 0.3)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.3)',
      }
    },
  },
  plugins: [],
}
