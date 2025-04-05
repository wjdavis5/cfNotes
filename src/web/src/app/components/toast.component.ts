import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts.length > 0">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [ngClass]="'toast-' + toast.type"
        (click)="removeToast(toast.id)"
        (keydown.enter)="removeToast(toast.id)"
        (keydown.space)="removeToast(toast.id)"
        tabindex="0"
        role="alert"
        aria-live="polite"
      >
        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
          <button
            class="toast-close"
            (click)="removeToast(toast.id); $event.stopPropagation()"
            aria-label="Close notification"
          >×</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 300px;
    }

    .toast {
      padding: 10px 16px;
      border-radius: 4px;
      color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: toast-in 0.3s ease-out;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
      outline: none;
    }

    .toast:hover, .toast:focus-visible {
      transform: translateY(-2px);
      outline: 2px solid white;
    }

    .toast-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .toast-message {
      flex: 1;
    }

    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 4px 8px;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .toast-success {
      background-color: #4caf50;
    }

    .toast-info {
      background-color: #2196f3;
    }

    .toast-warning {
      background-color: #ff9800;
    }

    .toast-error {
      background-color: #f44336;
    }

    @keyframes toast-in {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private subscription: Subscription | null = null;

  toasts: Toast[] = [];

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}
