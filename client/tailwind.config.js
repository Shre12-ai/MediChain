/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FAF8F5',
          DEFAULT: '#F4F1EA',
          dark: '#EBE7DC',
          aged: '#E2DDCF',
          border: '#D3CCC0',
        },
        ink: {
          forest: '#1B3B22',
          forestDark: '#122917',
          forestLight: '#2C5936',
          rust: '#8A2C20',
          rustDark: '#661F16',
          charcoal: '#262624',
          muted: '#6B6860',
          gold: '#C29B38',
        },
      },
      fontFamily: {
        serif: ['"Libre Caslon Text"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'ledger': '2px 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'stamp': '0 0 0 3px rgba(27, 59, 34, 0.25)',
        'stamp-rust': '0 0 0 3px rgba(138, 44, 32, 0.25)',
      },
    },
  },
  plugins: [],
}
