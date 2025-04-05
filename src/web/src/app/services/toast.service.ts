import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private lastId = 0;

  // Toast timeout in milliseconds
  private defaultDuration = 3000;

  /**
   * Get observable of current toasts
   */
  get toasts$(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }

  /**
   * Show a success toast message
   */
  success(message: string, duration: number = this.defaultDuration): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an info toast message
   */
  info(message: string, duration: number = this.defaultDuration): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a warning toast message
   */
  warning(message: string, duration: number = this.defaultDuration): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an error toast message
   */
  error(message: string, duration: number = this.defaultDuration): void {
    this.show(message, 'error', duration);
  }

  /**
   * Remove a toast by ID
   */
  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }

  /**
   * Show a toast with specified type
   */
  private show(message: string, type: 'success' | 'info' | 'warning' | 'error', duration: number): void {
    const id = ++this.lastId;

    const toast: Toast = {
      id,
      message,
      type
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }
}
