import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionTimeoutDialogComponent } from './components/session-timeout-dialog.component';
import { CryptoService, SecureMode } from './services/crypto.service';
import { AuthService } from './services/auth.service';
import { EnvironmentService } from './services/environment.service';
import { ToastComponent } from './components/toast.component';

@Component({
  standalone: true,
  imports: [RouterOutlet, SessionTimeoutDialogComponent, ToastComponent],
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>

    <!-- Session timeout dialog -->
    <app-session-timeout-dialog
      [isVisible]="showTimeoutDialog"
      [title]="dialogTitle"
      [message]="dialogMessage"
      [showReAuthForm]="showReAuthForm"
      (authenticate)="handleReAuthentication($event)"
      (close)="closeDialog()"
      (cancel)="handleCancel()"
    ></app-session-timeout-dialog>

    <!-- Toast notifications -->
    <app-toast></app-toast>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'cfNote';

  // Services
  private cryptoService = inject(CryptoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private environmentService = inject(EnvironmentService);

  // Dialog state
  showTimeoutDialog = false;
  dialogTitle = 'Session Timeout';
  dialogMessage = 'Your session has timed out due to inactivity.';
  showReAuthForm = false;

  // Store the route that was attempted when re-auth was needed
  private pendingRoute: string | null = null;

  // Flag to track whether we should perform cleanup on page exit
  private shouldCleanupOnExit = false;

  ngOnInit(): void {
    // Listen for session timeout events
    window.addEventListener('session-timeout', this.handleSessionTimeout);

    // Set up cleanup on exit when user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.shouldCleanupOnExit = isAuthenticated;
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('session-timeout', this.handleSessionTimeout);
  }

  /**
   * Handle session timeout events
   */
  @HostListener('window:session-timeout')
  handleSessionTimeout(): void {
    this.showTimeoutDialog = true;
    this.dialogTitle = 'Session Timeout';
    this.dialogMessage = 'Your session has timed out due to inactivity. Please log in again to continue.';
    this.showReAuthForm = false;
  }

  /**
   * Handle page unload event (when user navigates away or closes the tab)
   * This will be called when the user is about to leave the page
   * We can use this to clear sensitive data
   */
  @HostListener('window:beforeunload')
  handleBeforeUnload(): void {
    if (this.shouldCleanupOnExit) {
      this.performCleanup();
    }
  }

  /**
   * Handle page unload event (when user navigates away or closes the tab)
   * This is a fallback for beforeunload and might not always execute due to browser limitations
   */
  @HostListener('window:unload')
  handleUnload(): void {
    if (this.shouldCleanupOnExit) {
      this.performCleanup();
    }
  }

  /**
   * Perform security cleanup when user leaves the page
   */
  private performCleanup(): void {
    // Only log in development for debugging
    if (!this.environmentService.isProduction()) {
      console.log('Performing cleanup on page exit');
    }

    // Clear sensitive data
    this.cryptoService.clearPassword();

    // Attempt to log out the user
    // This may not complete fully if the page is being unloaded
    // But it will start the process and clear local state
    this.authService.logout();

    // For browsers that support it, we can use the Navigator sendBeacon API
    // to send a non-blocking request that will be processed even after page unload
    if (navigator.sendBeacon) {
      const logoutEndpoint = `${this.environmentService.getApiBaseUrl()}/api/auth/logout`;
      const user = this.authService.getCurrentUser();

      if (user) {
        const logoutData = { emailHash: user.emailHash };
        navigator.sendBeacon(logoutEndpoint, JSON.stringify(logoutData));
      }
    }
  }

  /**
   * Handle requests for re-authentication
   * @param route Optional route that was attempted
   */
  showReAuthDialog(route?: string): void {
    if (route) {
      this.pendingRoute = route;
    }

    this.showTimeoutDialog = true;
    this.dialogTitle = 'Authentication Required';
    this.dialogMessage = 'For your security, please re-enter your password to continue.';
    this.showReAuthForm = true;
  }

  /**
   * Handle re-authentication with password
   */
  handleReAuthentication(password: string): void {
    // Set the password in crypto service
    this.cryptoService.setPassword(password);

    // Close the dialog
    this.showTimeoutDialog = false;

    // Navigate to pending route if one was stored
    if (this.pendingRoute) {
      this.router.navigateByUrl(this.pendingRoute);
      this.pendingRoute = null;
    }
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.showTimeoutDialog = false;
  }

  /**
   * Handle cancel button
   */
  handleCancel(): void {
    // If re-auth form was shown, just close the dialog
    if (this.showReAuthForm) {
      this.showTimeoutDialog = false;
      this.pendingRoute = null;
    } else {
      // If timeout dialog, log out
      this.authService.logout();
      this.cryptoService.clearPassword();
      this.router.navigate(['/auth']);
      this.showTimeoutDialog = false;
    }
  }
}
