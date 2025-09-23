import PrimeUI from 'tailwindcss-primeui';

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js,vue,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        primary: "#282828",
        secondary: "#284715",
        accent: "#43900C",
        shade: "#CECECE"
      }
    }
  },
  plugins: [PrimeUI]
}
