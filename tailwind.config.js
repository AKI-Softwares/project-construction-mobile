const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg1: '#0F1520',
        bg2: '#162030',
        bg3: '#1E2C40',
        bg4: '#263348',
        // Accent
        amber: '#E8920C',
        'amber-l': '#F5A623',
        // Status
        ok: '#22C55E',
        nc: '#EF4444',
        prog: '#EAB308',
        pend: '#475569',
        // Texto
        t1: '#EDF0F5',
        t2: '#7D8FA3',
        t3: '#344456',
        // Border padrão
        border: '#263348',
      },
      fontFamily: {
        sans: ['IBMPlexSans_400Regular'],
        'sans-medium': ['IBMPlexSans_500Medium'],
        'sans-semibold': ['IBMPlexSans_600SemiBold'],
        'sans-bold': ['IBMPlexSans_700Bold'],
        mono: ['IBMPlexMono_400Regular'],
        'mono-medium': ['IBMPlexMono_500Medium'],
        'mono-semibold': ['IBMPlexMono_600SemiBold'],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
