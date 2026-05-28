import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<ToastMessage | null>(null);

  success(message: string) {
    this.show({ message, type: 'success' });
  }

  error(message: string) {
    this.show({ message, type: 'error' });
  }

  warning(message: string) {
    this.show({ message, type: 'warning' });
  }

  private show(toast: ToastMessage) {
    this.toast.set(toast);
    setTimeout(() => this.toast.set(null), 3000);
  }
}