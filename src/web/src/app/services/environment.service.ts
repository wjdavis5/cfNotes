import { Injectable } from '@angular/core';

/**
 * Environment configuration service
 *
 * Provides environment-specific configuration values
 * and handles detection of production vs development environment
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  // Cloudflare production API URL
  private readonly PROD_API_URL = 'https://cfnote-api.wjd5.workers.dev';

  // Development API URL (for local development)
  private readonly DEV_API_URL = 'http://127.0.0.1:8787';

  /**
   * Check if app is running in production
   */
  isProduction(): boolean {
    // In production builds, Angular sets production mode
    // We can also check for cloudflare pages domain
    return window.location.hostname.includes('pages.dev') ||
           !window.location.hostname.includes('localhost');
  }

  /**
   * Get the API base URL
   */
  getApiBaseUrl(): string {
    return this.isProduction() ? this.PROD_API_URL : this.DEV_API_URL;
  }
}
