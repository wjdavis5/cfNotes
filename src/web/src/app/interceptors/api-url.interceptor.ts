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
  // Only intercept requests to /api
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  // Get environment service
  const environmentService = inject(EnvironmentService);

  // Get API URL from environment service
  const apiUrl = environmentService.getApiBaseUrl();

  // Create a new URL by replacing /api with the actual API URL
  const apiReq = req.clone({
    url: req.url.replace('/api', apiUrl)
  });

  // Log the URL transformation in development
  if (!environmentService.isProduction()) {
    console.debug(`API request: ${req.url} -> ${apiReq.url}`);
  }

  return next(apiReq);
};
