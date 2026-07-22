import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingDownloadService {
  private readonly _isLoading = signal(false);
  private readonly _message = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly message = this._message.asReadonly();

  show(messageKey?: string): void {
    if (messageKey) {
      this._message.set(messageKey);
    } else {
      this._message.set(null);
    }
    this._isLoading.set(true);
  }

  hide(): void {
    this._isLoading.set(false);
    this._message.set(null);
  }
}
