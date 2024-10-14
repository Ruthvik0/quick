/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Ensure you include your React files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')], // Add DaisyUI here
  daisyui: {
    themes: ["light", "synthwave"],
  },
}

