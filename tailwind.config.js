/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe7ff',
          200: '#bcd0ff',
          300: '#8eaeff',
          400: '#5a82ff',
          500: '#3560f5',
          600: '#2347db',
          700: '#1c38b0',
          800: '#1b318c',
          900: '#1b2d70',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
          300: '#cbd5e1',
          100: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
};