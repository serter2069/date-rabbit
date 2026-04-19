/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#C52660",
        accent: "#E95C20",
        background: "#FBF9FA",
        surface: "#FFFFFF",
        text: "#201317",
        "text-secondary": "#81656E",
        border: "#F0E6EA",
      },
      fontFamily: {
        display: ["PlusJakartaSans-Bold", "system-ui"],
        body: ["PlusJakartaSans-Regular", "system-ui"],
      },
    },
  },
  plugins: [],
};
