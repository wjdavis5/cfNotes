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
  // Cloudflare production API URLs (without trailing slash)
  private readonly PROD_API_URLS = [
    'https://cfnote-api.wjd5.workers.dev',  // Primary API endpoint (dedicated API domain)
    'https://cfnote.wjd.io'                 // Alternative API endpoint (same domain as frontend)
  ];

  // Development API URL (without trailing slash)
  private readonly DEV_API_URL = 'http://localhost:8787';

  /**
   * Check if app is running in production
   */
  isProduction(): boolean {
    // In production builds, Angular sets production mode
    // We can also check for cloudflare pages domain
    return window.location.hostname.includes('pages.dev') ||
           window.location.hostname.includes('wjd.io') ||
           !window.location.hostname.includes('localhost');
  }

  /**
   * Get the API base URL
   */
  getApiBaseUrl(): string {
    if (this.isProduction()) {
      // Determine which production API to use based on hostname
      if (window.location.hostname.includes('wjd.io')) {
        return this.PROD_API_URLS[1];  // Use the wjd.io API endpoint
      }
      return this.PROD_API_URLS[0];    // Use the primary API endpoint
    }

    // For development
    return this.DEV_API_URL;
  }

  /**
   * Debug info for API configuration
   */
  logApiInfo(): void {
    console.log('Environment:', this.isProduction() ? 'Production' : 'Development');
    console.log('API URL:', this.getApiBaseUrl());
    console.log('Hostname:', window.location.hostname);
  }
}
