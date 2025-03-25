/**
 * Theme options to match our CSS classes
 */
export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
  SEPIA = 'sepia-theme',
}

/**
 * Theme color definitions with semantic naming
 */
export interface ThemeColors {
  // Base colors
  background: string;
  text: string;
  accent: string;
  secondary: string;
  hover: string;

  // UI Elements
  cardBackground: string;
  inputBackground: string;
  border: string;
  focusRing: string;

  // Component-specific colors
  headerBackground: string;
  sidebarBackground: string;
}

/**
 * Color palettes for each theme
 */
export const THEME_COLORS: Record<Theme, ThemeColors> = {
  [Theme.LIGHT]: {
    background: '#ffffff',
    text: '#333333',
    accent: '#3b82f6',
    secondary: '#f3f4f6',
    hover: '#e5e7eb',
    cardBackground: '#ffffff',
    inputBackground: '#ffffff',
    border: '#e5e7eb',
    focusRing: '#3b82f6',
    headerBackground: '#f9fafb',
    sidebarBackground: '#f3f4f6',
  },
  [Theme.DARK]: {
    background: '#1e293b',
    text: '#f3f4f6',
    accent: '#60a5fa',
    secondary: '#334155',
    hover: '#475569',
    cardBackground: '#334155',
    inputBackground: '#1e293b',
    border: '#475569',
    focusRing: '#60a5fa',
    headerBackground: '#0f172a',
    sidebarBackground: '#1e293b',
  },
  [Theme.SEPIA]: {
    background: '#f8f4e8',
    text: '#4b3621',
    accent: '#8b5a2b',
    secondary: '#f2ead7',
    hover: '#e8dcbc',
    cardBackground: '#f8f4e8',
    inputBackground: '#f8f4e8',
    border: '#d3c7a2',
    focusRing: '#8b5a2b',
    headerBackground: '#f2ead7',
    sidebarBackground: '#f2ead7',
  },
};

/**
 * Maps theme colors to CSS variable names
 */
export const THEME_CSS_VARS = {
  background: '--bg-color',
  text: '--text-color',
  accent: '--accent-color',
  secondary: '--secondary-color',
  hover: '--hover-color',
  cardBackground: '--card-bg-color',
  inputBackground: '--input-bg-color',
  border: '--border-color',
  focusRing: '--focus-ring-color',
  headerBackground: '--header-bg-color',
  sidebarBackground: '--sidebar-bg-color',
};

/**
 * CSS Color Scheme value for each theme
 */
export const THEME_COLOR_SCHEME: Record<Theme, 'light' | 'dark'> = {
  [Theme.LIGHT]: 'light',
  [Theme.DARK]: 'dark',
  [Theme.SEPIA]: 'light',
};
