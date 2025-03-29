import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CryptoService, SecureMode } from '../services/crypto.service';
import { AppComponent } from '../app.component';

/**
 * Guard that ensures the user has a valid password for encryption/decryption
 * If in memory-only secure mode and no password is set, will trigger re-authentication
 */
export const reAuthGuard: CanActivateFn = (route, state) => {
  const cryptoService = inject(CryptoService);
  const router = inject(Router);

  // Check if re-authentication is needed
  if (cryptoService.needsReAuthentication()) {
    // Get app component reference to show re-auth dialog
    // This is a bit hacky, but works for our purposes
    const appRef = inject(AppComponent);

    // Show re-auth dialog, passing the attempted URL
    appRef.showReAuthDialog(state.url);

    // Block navigation until re-authenticated
    return false;
  }

  // No re-auth needed, allow navigation
  return true;
};
