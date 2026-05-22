/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#DBEAFE',
          text: '#1E40AF',
          dark: '#3B82F6',
        },
        success: {
          DEFAULT: '#16A34A',
          subtle: '#DCFCE7',
          dark: '#22C55E',
          'dark-subtle': '#14532D',
        },
        warning: {
          DEFAULT: '#D97706',
          subtle: '#FEF3C7',
          dark: '#F59E0B',
          'dark-subtle': '#451A03',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FEE2E2',
          dark: '#EF4444',
          'dark-subtle': '#450A0A',
        },
      },
    },
  },
  plugins: [],
};
