import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { Theme, THEME_COLORS, THEME_CSS_VARS, THEME_COLOR_SCHEME, ThemeColors } from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selected_theme';
  private readonly DEFAULT_THEME = Theme.LIGHT;
  private renderer: Renderer2;

  private themeSubject = new BehaviorSubject<Theme>(this.DEFAULT_THEME);
  currentTheme$ = this.themeSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private rendererFactory: RendererFactory2
  ) {
    // Create renderer to safely manipulate DOM
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadSavedTheme();
  }

  /**
   * Initialize the theme
   */
  initTheme(): void {
    this.applyTheme(this.themeSubject.value);
  }

  /**
   * Set active theme
   */
  setTheme(theme: Theme): void {
    this.storageService.set(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Get color value for current theme by semantic name
   */
  getThemeColor(colorKey: keyof ThemeColors): string {
    const currentTheme = this.themeSubject.value;
    return THEME_COLORS[currentTheme][colorKey];
  }

  /**
   * Check if current theme is dark mode
   */
  isDarkMode(): boolean {
    return this.themeSubject.value === Theme.DARK;
  }

  /**
   * Cycle to next theme in sequence
   */
  cycleTheme(): void {
    const currentTheme = this.themeSubject.value;
    let nextTheme: Theme;

    switch (currentTheme) {
      case Theme.LIGHT:
        nextTheme = Theme.DARK;
        break;
      case Theme.DARK:
        nextTheme = Theme.SEPIA;
        break;
      default:
        nextTheme = Theme.LIGHT;
    }

    this.setTheme(nextTheme);
  }

  /**
   * Load previously saved theme
   */
  private loadSavedTheme(): void {
    const savedTheme = this.storageService.get<Theme>(this.THEME_KEY);

    if (savedTheme && Object.values(Theme).includes(savedTheme)) {
      this.themeSubject.next(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      // Check for system preference if no saved theme
      this.checkSystemPreference();
    }
  }

  /**
   * Check system color scheme preference
   */
  private checkSystemPreference(): void {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme(Theme.DARK);
    } else {
      this.setTheme(this.DEFAULT_THEME);
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return; // Guard for SSR

    // Set CSS variables based on theme colors
    this.setCSSVariables(theme);

    // Set color scheme
    this.renderer.setAttribute(document.documentElement, 'color-scheme', THEME_COLOR_SCHEME[theme]);

    // Apply theme class to document element
    this.applyThemeClass(document.documentElement, theme);

    // Apply theme class to body element
    this.applyThemeClass(document.body, theme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Apply theme class to an element, removing other theme classes
   */
  private applyThemeClass(element: HTMLElement, theme: Theme): void {
    // Remove all theme classes
    Object.values(Theme).forEach(themeClass => {
      this.renderer.removeClass(element, themeClass);
    });

    // Add selected theme class
    this.renderer.addClass(element, theme);
  }

  /**
   * Set CSS variables based on theme colors
   */
  private setCSSVariables(theme: Theme): void {
    const themeColors = THEME_COLORS[theme];
    const root = document.documentElement;

    // Apply each color as a CSS variable
    Object.entries(themeColors).forEach(([colorKey, colorValue]) => {
      const varName = THEME_CSS_VARS[colorKey as keyof ThemeColors];
      this.renderer.setStyle(root, varName, colorValue);
    });
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: Theme): void {
    const backgroundColor = THEME_COLORS[theme].background;
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', backgroundColor);
  }
}
