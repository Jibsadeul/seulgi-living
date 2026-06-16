/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        main: {
          100: '#EF7722',
          70: '#F4A065',
          50: '#F7BB91',
          30: '#FBD7BD',
          10: '#FEF2E9',
        },
        surface: {
          default: '#FFFFFF',
          card: '#F8F9FF',
          confirm: '#979593',
        },
        point: {
          100: '#BA1A1A',
          50: '#DD8D8D',
        },
        tag: {
          pink: '#FFE2E5',
          blue: '#DCE9FF',
          green: '#E1F5EE',
          orange: '#FFF0E6',
          yellow: '#FAEEDA',
          grey: '#F0F0F0',
        },
        tagText: {
          pink: '#ED3241',
          blue: '#2563EB',
          green: '#085041',
          orange: '#EF7722',
          yellow: '#633806',
          grey: '#555555',
        },
        gray: {
          5: '#F8F8F8',
          10: '#F0F0F0',
          20: '#E4E4E4',
          30: '#D8D8D8',
          40: '#C6C6C6',
          50: '#8E8E8E',
          60: '#717171',
          70: '#555555',
          80: '#2D2D2D',
          90: '#1D1D1D',
        },
      },
    },
  },
  plugins: [],
};
