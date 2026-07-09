// shared/services/confirm-dialog.service.ts
import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private _isOpen = signal(false);
  private _options = signal<ConfirmDialogOptions | null>(null);
  private resolveFn: ((value: boolean) => void) | null = null;

  isOpen = this._isOpen.asReadonly();
  options = this._options.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    this._options.set(options);
    this._isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  onConfirm(): void {
    this.resolveFn?.(true);
    this.close();
  }

  onCancel(): void {
    this.resolveFn?.(false);
    this.close();
  }

  private close(): void {
    this._isOpen.set(false);
    this._options.set(null);
    this.resolveFn = null;
  }
}