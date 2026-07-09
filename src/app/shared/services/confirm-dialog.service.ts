// shared/services/confirm-dialog.service.ts
import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
  inputPlaceholder?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private _isOpen = signal(false);
  private _options = signal<ConfirmDialogOptions | null>(null);
  private _inputValue = signal('');
  private resolveFn: ((value: { confirmed: boolean; value?: string }) => void) | null = null;

  isOpen = this._isOpen.asReadonly();
  options = this._options.asReadonly();
  inputValue = this._inputValue.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<{ confirmed: boolean; value?: string }> {
    this._options.set(options);
    this._inputValue.set('');
    this._isOpen.set(true);


    return new Promise<{ confirmed: boolean; value?: string }>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  setInputValue(value: string): void {
    this._inputValue.set(value);
  }

  onConfirm(): void {
    this.resolveFn?.({ confirmed: true, value: this._inputValue() });
    this.close();
  }

  onCancel(): void {
    this.resolveFn?.({ confirmed: false });
    this.close();
  }

  private close(): void {
    this._isOpen.set(false);
    this._options.set(null);
    this._inputValue.set('');
    this.resolveFn = null;
  }
}