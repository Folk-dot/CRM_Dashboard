/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f7f2',
          100: '#b3e6d5',
          400: '#3dbf8f',
          500: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
        },
      },
    },
  },
  plugins: [],
};
