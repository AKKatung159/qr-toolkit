/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8A3D',
          light: '#FFD8BD',
          pastel: '#FFEBDD',
        },
        dark: {
          DEFAULT: '#171717',
          gray: '#2A2A2A',
        },
        accent: {
          green: '#DDF5E5',
          blue: '#DDEEFF',
          purple: '#E9DFFF',
          yellow: '#FFF1B8',
          pink: '#FFE0EC',
        },
        bg: '#FFF9F5',
        line: '#F2E6DB',
        danger: {
          DEFAULT: '#FF6B6B',
          text: '#C23B3B',
        },
        muted: '#737373',
      },
      // Named so they never collide with Tailwind's font-weight utilities.
      fontFamily: {
        body: ['Outfit_400Regular'],
        'body-medium': ['Outfit_500Medium'],
        'body-semibold': ['Outfit_600SemiBold'],
        title: ['Outfit_700Bold'],
        display: ['Outfit_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
