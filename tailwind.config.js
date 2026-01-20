/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html"],
  theme: {
    extend: {
      colors: {
        travertino: '#E8E0D5',
        terracotta: '#C4703D',
        bronzo: '#8B6914',
        notte: '#1a1a2e',
        oliva: '#4A5043',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
