import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { EnvironmentService } from '../services/environment.service';

/**
 * CSRF Interceptor
 *
 * Adds CSRF protection to API requests by adding an anti-forgery token
 * in both a custom header and a double-submit cookie pattern
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add CSRF tokens to API requests with methods that modify data
  if (!req.url.startsWith('/api') || req.method === 'GET') {
    return next(req);
  }

  // Get environment service
  const environmentService = inject(EnvironmentService);

  // Generate or retrieve a CSRF token
  const csrfToken = getCsrfToken();

  // Clone the request with the CSRF token in a custom header
  const csrfReq = req.clone({
    setHeaders: {
      'X-CSRF-Token': csrfToken
    },
    // For cookie-based CSRF protection, also send the token as part of the body for APIs that support it
    body: addCsrfToBody(req)
  });

  // Log in development mode
  if (!environmentService.isProduction()) {
    console.debug(`Added CSRF token to ${req.method} request: ${req.url}`);
  }

  return next(csrfReq);
};

/**
 * Get a CSRF token - either a stored one or generate a new one
 */
function getCsrfToken(): string {
  // Check if we have a token in sessionStorage
  const existingToken = sessionStorage.getItem('csrf_token');
  if (existingToken) {
    return existingToken;
  }

  // Generate a new random token
  const newToken = generateRandomToken();

  // Store in sessionStorage
  sessionStorage.setItem('csrf_token', newToken);

  // Also store the token in a cookie for double-submit verification
  document.cookie = `XSRF-TOKEN=${newToken}; path=/; SameSite=Strict; Secure`;

  return newToken;
}

/**
 * Generate a cryptographically secure random token
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32); // 256 bits of randomness
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Add CSRF token to the request body for APIs that support it
 * This enables double-submit cookie pattern for CSRF protection
 */
function addCsrfToBody(request: HttpRequest<any>): any {
  // Only add to JSON requests
  if (request.body &&
      request.headers.get('Content-Type')?.includes('application/json')) {
    const csrfToken = getCsrfToken();

    // Add or update the csrf_token field in the request body
    return {
      ...request.body,
      csrf_token: csrfToken
    };
  }

  // For non-JSON requests, return the original body
  return request.body;
}
