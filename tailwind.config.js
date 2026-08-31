/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        tech: ['Sora', 'sans-serif'],
      },
      colors: {
        cyan: {
          neon: '#00f0ff',
        },
        pink: {
          neon: '#ff2a85',
        },
      },
    },
  },
  plugins: [],
}