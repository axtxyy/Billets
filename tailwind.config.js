/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // custom palette
        warmwhite: '#F5F0EB',
        beige: '#D9C9B8',
        softgray: '#A8A3A0',
        charcoal: '#1A1A1A',
        royalgold: '#C9A84C',
        bronze: '#A0785A',
        deepnavy: '#0B1D3A',
      },
    },
  },
  plugins: [],
}