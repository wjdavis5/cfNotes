import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EnvironmentService } from '../services/environment.service';

/**
 * API URL Interceptor
 *
 * Rewrites API requests to use the Cloudflare Worker URL in production
 * and local development server in development
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept API requests
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  // Get environment service
  const environmentService = inject(EnvironmentService);

  // Get base API URL from environment service (without trailing slash)
  const apiBaseUrl = environmentService.getApiBaseUrl().replace(/\/$/, '');

  // Create the new URL by replacing the /api prefix with the full API base URL
  const apiPath = req.url.substring(4); // Remove '/api' prefix
  const newUrl = `${apiBaseUrl}${apiPath.startsWith('/') ? '' : '/'}${apiPath}`;

  // Clone the request with the new URL
  const apiReq = req.clone({
    url: newUrl
  });

  // Log the URL transformation in development
  if (!environmentService.isProduction()) {
    console.debug(`API request transform: ${req.url} -> ${apiReq.url}`);
  }

  return next(apiReq);
};
