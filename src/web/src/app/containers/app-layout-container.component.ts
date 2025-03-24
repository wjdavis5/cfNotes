import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeSelectorComponent, Theme } from '../components/theme-selector.component';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout-container',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeSelectorComponent],
  template: `
    <div class="min-h-screen flex flex-col" [ngClass]="currentTheme">
      <!-- Header -->
      <header class="p-4 shadow-sm border-b"
              [ngClass]="{
                'bg-light-bg text-light-text border-light-secondary': currentTheme === Theme.LIGHT,
                'bg-dark-bg text-dark-text border-dark-secondary': currentTheme === Theme.DARK,
                'bg-sepia-bg text-sepia-text border-sepia-secondary': currentTheme === Theme.SEPIA
              }">
        <div class="container mx-auto flex justify-between items-center">
          

          <div class="flex items-center space-x-4">
            <app-theme-selector
              [currentTheme]="currentTheme"
              (themeChange)="onThemeChange($event)"
            ></app-theme-selector>

            <button
              *ngIf="isAuthenticated"
              class="text-sm px-3 py-1.5 rounded border transition-colors"
              [ngClass]="{
                'border-light-secondary hover:bg-light-secondary': currentTheme === Theme.LIGHT,
                'border-dark-secondary hover:bg-dark-secondary': currentTheme === Theme.DARK,
                'border-sepia-secondary hover:bg-sepia-secondary': currentTheme === Theme.SEPIA
              }"
              (click)="logout()"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 container mx-auto p-4"
            [ngClass]="{
              'bg-light-bg text-light-text': currentTheme === Theme.LIGHT,
              'bg-dark-bg text-dark-text': currentTheme === Theme.DARK,
              'bg-sepia-bg text-sepia-text': currentTheme === Theme.SEPIA
            }">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="py-3 text-center text-sm border-t"
              [ngClass]="{
                'border-light-secondary text-light-text/60': currentTheme === Theme.LIGHT,
                'border-dark-secondary text-dark-text/60': currentTheme === Theme.DARK,
                'border-sepia-secondary text-sepia-text/60': currentTheme === Theme.SEPIA
              }">
        
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `
})
export class AppLayoutContainerComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  currentTheme = Theme.LIGHT;
  isAuthenticated = false;
  Theme = Theme; // Make enum available in template

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
