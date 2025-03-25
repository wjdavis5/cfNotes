import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface for auth form data
export interface AuthFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-form.component.html',
  styles: `
    .auth-form {
      background: var(--card-bg-color);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 25px -5px var(--card-shadow-color);
      width: 100%;
      max-width: 100%;
      transition: all 0.3s ease;
    }

    .form-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--text-color);
      text-align: center;
    }

    .form-subtitle {
      font-size: 16px;
      margin: 0 0 32px 0;
      color: var(--text-muted-color);
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
    }

    .input-container {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: var(--accent-color);
      opacity: 0.7;
    }

    input {
      width: 100%;
      padding: 14px 14px 14px 44px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--input-bg-color);
      color: var(--text-color);
      font-size: 16px;
      transition: all 0.2s ease;
    }

    input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.15);
    }

    input::placeholder {
      color: var(--text-muted-color);
    }

    .input-help {
      font-size: 12px;
      color: var(--text-muted-color);
      margin: 8px 0 0 0;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(var(--error-color-rgb), 0.1);
      color: var(--error-color);
      font-size: 14px;
    }

    .error-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .submit-button {
      background: var(--accent-color);
      color: white;
      font-size: 16px;
      font-weight: 600;
      padding: 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s ease;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(110%);
      box-shadow: 0 4px 8px var(--card-shadow-color);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 14px;
      color: var(--text-muted-color);
    }
  `
})
export class AuthFormComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter<AuthFormData>();

  email = '';
  password = '';

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.formSubmit.emit({
      email: this.email,
      password: this.password
    });
  }
}
