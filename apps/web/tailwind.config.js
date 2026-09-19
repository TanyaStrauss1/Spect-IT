/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0e7490',
          dark: '#155e75',
          light: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          DEFAULT: '#0891b2',
          light: '#06b6d4',
        },
      },
      boxShadow: {
        'clinical': '0 4px 12px -2px rgba(8, 145, 178, 0.12)',
        'clinical-lg': '0 12px 32px -8px rgba(8, 145, 178, 0.16)',
      },
      borderRadius: {
        'clinical': '0.75rem',
        'clinical-lg': '1rem',
      },
    },
  },
  plugins: [],
}

