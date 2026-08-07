/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nordic: {
          50: '#f4f7f6',
          100: '#e5ece9',
          200: '#cbdbd3',
          300: '#a3c2b4',
          400: '#75a390',
          500: '#518571',
          600: '#3e6b5a',
          700: '#335649',
          800: '#2c463c',
          900: '#1b2e27',
          950: '#0d1a15'
        },
        pine: {
          DEFAULT: '#10b981',
          dark: '#047857',
          light: '#34d399'
        }
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
