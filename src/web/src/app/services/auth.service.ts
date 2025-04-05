import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, lastValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';

// Importing from shared libraries will be set up properly later with Nx
// For now using placeholder interfaces
interface User {
  emailHash: string;
  authHash: string;
}

interface AuthResponse {
  status: string;
  authenticated: boolean;
  isNewUser: boolean;
}

// This will be replaced with proper crypto imports
async function generateUserHash(email: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${email.toLowerCase()}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);

  private readonly AUTH_KEY = 'auth_data';
  private readonly API_URL = '/api/auth';

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Current user data
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check for existing authentication on startup
    this.checkExistingAuth();
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      this.toastService.info('Logging in...');

      // Generate hashes for email and auth
      const emailHash = await generateUserHash(email, '');
      const authHash = await generateUserHash(email, password);

      // Create user object
      const user: User = { emailHash, authHash };

      // Authenticate with API
      return this.authenticate(user);
    } catch (error) {
      console.error('Login error:', error);
      this.toastService.error('Login failed');
      return false;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.toastService.info('Logging out...');

    // Clear auth data
    this.storageService.remove(this.AUTH_KEY);

    // Update state
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    this.toastService.success('Logged out successfully');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get authentication status
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check for existing authentication
   */
  private checkExistingAuth(): void {
    const userData = this.storageService.get<User>(this.AUTH_KEY);

    if (userData) {
      this.currentUserSubject.next(userData);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Authenticate with the API
   */
  private async authenticate(user: User): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponse>(this.API_URL, user).pipe(
          catchError(error => {
            console.error('Authentication error:', error);
            this.toastService.error('Authentication failed');
            return of({ status: 'error', authenticated: false, isNewUser: false });
          })
        )
      );

      if (response.authenticated) {
        // Store user data
        this.storageService.set(this.AUTH_KEY, user);

        // Update state
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        this.toastService.success(response.isNewUser ? 'Account created successfully' : 'Logged in successfully');
        return true;
      }

      this.toastService.error('Authentication failed');
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      this.toastService.error('Authentication failed');
      return false;
    }
  }
}
