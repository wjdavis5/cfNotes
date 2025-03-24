import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

// Theme options to match our CSS classes
export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
  SEPIA = 'sepia-theme',
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selected_theme';
  private readonly DEFAULT_THEME = Theme.LIGHT;

  private themeSubject = new BehaviorSubject<Theme>(this.DEFAULT_THEME);
  currentTheme$ = this.themeSubject.asObservable();

  constructor(private storageService: StorageService) {
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
      this.applyTheme(Theme.DARK);
      this.themeSubject.next(Theme.DARK);
    } else {
      this.applyTheme(this.DEFAULT_THEME);
    }
  }

  /**
   * Apply theme to document root
   */
  private applyTheme(theme: Theme): void {
    // Remove all theme classes from document element
    document.documentElement.classList.remove(
      Theme.LIGHT,
      Theme.DARK,
      Theme.SEPIA
    );

    // Add the selected theme class to document element
    document.documentElement.classList.add(theme);
    
    // Remove all theme classes from body element
    document.body.classList.remove(
      Theme.LIGHT,
      Theme.DARK,
      Theme.SEPIA
    );
    
    // Add the selected theme class to body element
    document.body.classList.add(theme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: Theme): void {
    let color: string;

    switch (theme) {
      case Theme.DARK:
        color = '#1e293b'; // dark-bg
        break;
      case Theme.SEPIA:
        color = '#f8f4e8'; // sepia-bg
        break;
      default:
        color = '#ffffff'; // light-bg
    }

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', color);
  }
}
