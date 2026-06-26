const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans:           ['IBMPlexSans_400Regular'],
        'sans-medium':  ['IBMPlexSans_500Medium'],
        'sans-semibold':['IBMPlexSans_600SemiBold'],
        'sans-bold':    ['IBMPlexSans_700Bold'],
        mono:           ['IBMPlexMono_400Regular'],
        'mono-medium':  ['IBMPlexMono_500Medium'],
        'mono-semibold':['IBMPlexMono_600SemiBold'],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
