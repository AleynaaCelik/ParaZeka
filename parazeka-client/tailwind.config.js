/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#4CAF50',
          secondary: '#2196F3',
          danger: '#F44336',
          warning: '#FF9800',
          info: '#00BCD4',
        },
      },
    },
    plugins: [],
  }