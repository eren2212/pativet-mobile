/** @type {import('tailwindcss').Config} */
import COLORS  from './src/theme/color';

module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: COLORS.primary,
        secondary: COLORS.secondary,
        tertiary: COLORS.tertiary,
        quaternary: COLORS.quaternary,
        background: COLORS.background,
        cute: COLORS.cute,
        card: COLORS.card,
        tint: COLORS.tint,
        success: COLORS.success,
        error: COLORS.error,
        linear1: COLORS.linear1,
        linear2: COLORS.linear2,
        radial1: COLORS.radial1,
        radial2: COLORS.radial2,
      },
      fontFamily: {
        "ozel": ["Domine-Bold"],
        "ozel-regular": ["Domine-Regular"],
        "ozel-medium": ["Domine-Medium"],
        "ozel-semi-bold": ["Domine-SemiBold"],
      },
    },
  },
  plugins: [],
};
