import { Injectable, computed, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  readonly message: string;
  readonly type: ToastType;
  readonly visible: boolean;
}

const DEFAULT_DURATION_MS = 3000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly state = signal<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly toast = computed(() => this.state());

  show(message: string, type: ToastType = 'success', durationMs = DEFAULT_DURATION_MS): void {
    this.clearTimer();
    this.state.set({ message, type, visible: true });
    this.hideTimer = setTimeout(() => this.hide(), durationMs);
  }

  success(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'info', durationMs);
  }

  warning(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show(message, 'warning', durationMs);
  }

  hide(): void {
    this.clearTimer();
    this.state.update((current) => ({ ...current, visible: false }));
  }

  private clearTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
