/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        lora: ['Lora', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#8B4513', // Wood Brown
          light: '#A0522D',
          dark: '#5E2F0D',
        },
        secondary: {
          DEFAULT: '#F5F5DC', // Cream
          light: '#FFFFF0',
          dark: '#E5E5C3',
        },
        accent: {
          DEFAULT: '#2E8B57', // Forest Green
          light: '#3CB371',
          dark: '#1E5631',
        },
        neutral: {
          DEFAULT: '#36454F', // Charcoal Gray
          light: '#708090',
          dark: '#1A2530',
        },
      },
    },
  },
  plugins: [],
};