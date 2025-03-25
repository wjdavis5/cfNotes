import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeSelectorComponent } from '../components/theme-selector.component';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { Theme } from '../models/theme.model';

@Component({
  selector: 'app-layout-container',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSelectorComponent],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="container mx-auto flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <app-theme-selector
              [currentTheme]="currentTheme"
              (themeChange)="onThemeChange($event)"
            ></app-theme-selector>

            <button
              *ngIf="isAuthenticated"
              class="logout-button"
              (click)="logout()"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">

      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    .app-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--header-bg-color);
      box-shadow: 0 2px 4px var(--card-shadow-color);
    }

    .logout-button {
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      border: 1px solid var(--border-color);
      background-color: transparent;
      color: var(--text-color);
      transition: background-color 0.2s;
    }

    .logout-button:hover {
      background-color: var(--hover-color);
    }

    .app-main {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .app-footer {
      padding: 0.75rem 0;
      text-align: center;
      font-size: 0.875rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted-color);
    }
  `
})
export class AppLayoutContainerComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  currentTheme = Theme.LIGHT;
  isAuthenticated = false;

  ngOnInit(): void {
    // Initialize theme
    this.themeService.initTheme();
    this.currentTheme = this.themeService.getCurrentTheme();

    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Subscribe to auth changes
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  /**
   * Handle theme change
   */
  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout();
  }
}
