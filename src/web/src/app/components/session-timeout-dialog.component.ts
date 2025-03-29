import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-session-timeout-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" class="timeout-dialog-overlay">
      <div class="timeout-dialog">
        <div class="timeout-dialog-header">
          <h2>{{ title }}</h2>
        </div>
        <div class="timeout-dialog-content">
          <p>{{ message }}</p>

          <div *ngIf="showReAuthForm" class="reauth-form">
            <p class="reauth-prompt">Please re-enter your password to continue:</p>
            <input
              type="password"
              [(ngModel)]="password"
              placeholder="Enter your password"
              class="reauth-input"
            />
            <div *ngIf="error" class="error-message">{{ error }}</div>
          </div>
        </div>
        <div class="timeout-dialog-actions">
          <button
            *ngIf="showReAuthForm"
            class="btn btn-primary"
            (click)="onConfirm()"
            [disabled]="!password"
          >
            Authenticate
          </button>
          <button
            *ngIf="!showReAuthForm"
            class="btn btn-primary"
            (click)="onClose()"
          >
            OK
          </button>
          <button
            class="btn btn-secondary"
            (click)="onCancel()"
          >
            {{ showReAuthForm ? 'Cancel' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .timeout-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .timeout-dialog {
      background-color: var(--card-bg-color);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      width: 400px;
      max-width: 90%;
      overflow: hidden;
    }

    .timeout-dialog-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .timeout-dialog-header h2 {
      margin: 0;
      color: var(--text-color);
      font-size: 1.25rem;
    }

    .timeout-dialog-content {
      padding: 16px;
      color: var(--text-color);
    }

    .timeout-dialog-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn:active {
      transform: translateY(1px);
    }

    .btn-primary {
      background-color: var(--accent-color);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--accent-hover-color, #0056b3);
    }

    .btn-primary:disabled {
      background-color: var(--disabled-color, #cccccc);
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--secondary-color);
      color: var(--text-color);
    }

    .btn-secondary:hover {
      background-color: var(--hover-color);
    }

    .reauth-form {
      margin-top: 16px;
    }

    .reauth-prompt {
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .reauth-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: var(--input-bg-color);
      color: var(--text-color);
      margin-bottom: 8px;
    }

    .error-message {
      color: var(--error-color, #dc3545);
      font-size: 0.85rem;
      margin-top: 8px;
    }
  `
})
export class SessionTimeoutDialogComponent {
  @Input() isVisible = false;
  @Input() title = 'Session Timeout';
  @Input() message = 'Your session has timed out due to inactivity.';
  @Input() showReAuthForm = false;

  @Output() authenticate = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  password = '';
  error = '';

  onConfirm(): void {
    if (this.password) {
      this.authenticate.emit(this.password);
    } else {
      this.error = 'Please enter your password';
    }
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  onCancel(): void {
    this.cancel.emit();
    this.reset();
  }

  reset(): void {
    this.password = '';
    this.error = '';
  }

  /**
   * Set error message (can be called from parent component)
   */
  setError(error: string): void {
    this.error = error;
  }
}
