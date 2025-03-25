/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./web/src/**/*.{html,ts}",
    "./web/components/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Define CSS variable-based color scheme
      textColor: {
        skin: {
          base: 'var(--text-color)',
          muted: 'var(--text-muted-color)',
          accent: 'var(--accent-color)',
        },
      },
      backgroundColor: {
        skin: {
          base: 'var(--bg-color)',
          card: 'var(--card-bg-color)',
          input: 'var(--input-bg-color)',
          header: 'var(--header-bg-color)',
          sidebar: 'var(--sidebar-bg-color)',
          accent: 'var(--accent-color)',
          secondary: 'var(--secondary-color)',
          hover: 'var(--hover-color)',
        },
      },
      borderColor: {
        skin: {
          base: 'var(--border-color)',
          accent: 'var(--accent-color)',
        },
      },
      ringColor: {
        skin: {
          base: 'var(--focus-ring-color)',
        },
      },
      gradientColorStops: {
        skin: {
          base: 'var(--bg-color)',
          accent: 'var(--accent-color)',
        },
      },
      boxShadowColor: {
        skin: {
          base: 'var(--card-shadow-color)',
        },
      },
      // Legacy theme colors (kept for backward compatibility)
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
  plugins: [],
}
