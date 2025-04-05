/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3674B5',
          light: '#578FCA', 
          dark: '#2A5B8F',
          50: '#EBF2FA',
          100: '#D7E5F5',
          200: '#AFCBEB',
          300: '#87B1E0',
          400: '#5F98D6',
          500: '#3674B5',
          600: '#2E5F92',
          700: '#254B74',
          800: '#1C3855',
          900: '#122537',
          950: '#091219',
        },
        secondary: {
          DEFAULT: '#A1E3F9',
          50: '#FFFFFF',
          100: '#F9FDFF',
          200: '#E2F7FD',
          300: '#CBF1FC',
          400: '#B3EAFA',
          500: '#A1E3F9',
          600: '#6CD4F6',
          700: '#36C4F3',
          800: '#0DA7D9',
          900: '#0A7FA5',
        },
        accent: {
          DEFAULT: '#D1F8EF',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#EBFDF9',
          500: '#D1F8EF',
          600: '#A7F2E3',
          700: '#7CECD7',
          800: '#52E6CA',
          900: '#27E0BE',
        },
        background: {
          light: '#F8FAFC',
          dark: '#3D3D3D',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'custom-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
} 