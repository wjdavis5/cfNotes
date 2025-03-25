import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthFormComponent, AuthFormData } from '../components/auth-form.component';
import { AuthService } from '../services/auth.service';
import { CryptoService } from '../services/crypto.service';
import { ThemeSelectorComponent } from '../components/theme-selector.component';
import { ThemeService } from '../services/theme.service';
import { Theme } from '../models/theme.model';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [CommonModule, AuthFormComponent, ThemeSelectorComponent],
  template: `
    <div class="page-container">
      <!-- Theme toggle in corner -->
      <div class="theme-selector-container">
        <app-theme-selector
          [currentTheme]="currentTheme"
          (themeChange)="onThemeChange($event)"
        ></app-theme-selector>
      </div>

      <!-- Main content area with centered card -->
      <div class="content-container">
        <div class="brand-container">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
              <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
            </svg>
            <h1 class="logo-text">cfNote</h1>
          </div>
          <p class="brand-tagline">Secure cloud notes with end-to-end encryption</p>
        </div>

        <div class="form-container">
          <app-auth-form
            [loading]="loading"
            [error]="error"
            (formSubmit)="onFormSubmit($event)"
          ></app-auth-form>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <p>cfNote - Your notes are secure and private</p>
      </footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }

    .page-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
      background: linear-gradient(135deg, var(--bg-color) 0%, var(--secondary-color) 100%);
      padding: 0;
      margin: 0;
      transition: background 0.3s ease;
      color: var(--text-color);
    }

    .theme-selector-container {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 10;
    }

    .content-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      padding: 40px 20px;
    }

    .brand-container {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      color: var(--accent-color);
      margin-right: 10px;
    }

    .logo-text {
      font-size: 36px;
      font-weight: 700;
      color: var(--text-color);
      margin: 0;
    }

    .brand-tagline {
      font-size: 16px;
      color: var(--text-muted-color);
      margin: 0;
    }

    .form-container {
      width: 100%;
      max-width: 450px;
      margin: 0 auto;
    }

    .footer {
      text-align: center;
      padding: 16px;
      color: var(--text-muted-color);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .content-container {
        padding: 30px 15px;
      }

      .logo-text {
        font-size: 32px;
      }

      .logo-icon {
        width: 32px;
        height: 32px;
      }
    }
  `
})
export class AuthContainerComponent {
  private authService = inject(AuthService);
  private cryptoService = inject(CryptoService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;
  currentTheme = Theme.LIGHT;

  constructor() {
    // Initialize theme
    this.themeService.initTheme();
    this.currentTheme = this.themeService.getCurrentTheme();

    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  /**
   * Handle form submission
   */
  async onFormSubmit(formData: AuthFormData): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const success = await this.authService.login(formData.email, formData.password);

      if (success) {
        // Set password in crypto service for encryption/decryption
        this.cryptoService.setPassword(formData.password);

        // Navigate to notes page
        this.router.navigate(['/notes']);
      } else {
        this.error = 'Authentication failed. Please try again.';
      }
    } catch (error) {
      console.error('Authentication error:', error);
      this.error = 'An error occurred during authentication.';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Handle theme change
   */
  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
