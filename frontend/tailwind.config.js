/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sport-dark": "#0f172a",
        "sport-card": "#1e293b",
        "sport-primary": "#3b82f6",
        "sport-accent": "#10b981",
      },
    },
  },
  plugins: [],
};
