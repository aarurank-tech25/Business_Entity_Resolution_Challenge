/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Lavender Core Palette
        lavender: {
          25: '#FDFCFE',
          50: '#F7F4FE',
          100: '#EFE8FE',
          150: '#E6DCFD',
          200: '#D9C8FC',
          300: '#C0A6F9',
          400: '#A37EF5',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        brand: {
          50: '#F7F4FE',
          100: '#EFE8FE',
          200: '#DDD2FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        twilight: {
          700: '#322550',
          800: '#22183A',
          900: '#171028',
          950: '#0E091C',
        },
        match: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        nomatch: {
          50: '#FAF8FC',
          100: '#F3EEF9',
          500: '#7C7389',
          600: '#5E546C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(109, 40, 217, 0.05), 0 1px 2px -1px rgba(109, 40, 217, 0.04)',
        'card-hover': '0 10px 20px -3px rgba(109, 40, 217, 0.09), 0 4px 6px -4px rgba(109, 40, 217, 0.04)',
        'lavender-glow': '0 0 25px rgba(139, 92, 246, 0.18)',
        'elevation': '0 20px 25px -5px rgba(30, 16, 50, 0.08), 0 8px 10px -6px rgba(30, 16, 50, 0.04)',
      }
    },
  },
  plugins: [],
}
