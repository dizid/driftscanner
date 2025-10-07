/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,jsx}'],
  theme: {
    extend: {
      colors: {
        drift: {
          purple: '#7C3AED',
          blue: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};