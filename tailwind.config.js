/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'seat-available': '#e5e7eb',
        'seat-booked-male': '#3b82f6',
        'seat-booked-female': '#ec4899',
        'seat-selected': '#10b981',
      },
    },
  },
  plugins: [],
}
