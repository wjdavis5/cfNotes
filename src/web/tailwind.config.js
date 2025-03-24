/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme
        'light-bg': '#ffffff',
        'light-text': '#333333',
        'light-accent': '#3b82f6',
        'light-secondary': '#f3f4f6',
        'light-hover': '#e5e7eb',

        // Dark theme
        'dark-bg': '#1e293b',
        'dark-text': '#f3f4f6',
        'dark-accent': '#60a5fa',
        'dark-secondary': '#334155',
        'dark-hover': '#475569',

        // Sepia theme
        'sepia-bg': '#f8f4e8',
        'sepia-text': '#4b3621',
        'sepia-accent': '#8b5a2b',
        'sepia-secondary': '#f2ead7',
        'sepia-hover': '#e8dcbc',
      },
    },
  },
  plugins: [
    // Add custom variant for sepia theme
    function({ addVariant }) {
      addVariant('sepia', '.sepia-theme &');
    },
  ],
}

