import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'zt-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogService.isOpen()) {
      <div class="modal-overlay" (click)="dialogService.onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          @if (dialogService.options()?.title) {
            <h3>{{ dialogService.options()?.title }}</h3>
          }
          <p>{{ dialogService.options()?.message }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="dialogService.onCancel()">
              {{ dialogService.options()?.cancelText ?? 'Cancelar' }}
            </button>
            <button class="btn-danger" (click)="dialogService.onConfirm()">
              {{ dialogService.options()?.confirmText ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: var(--color-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--color-surface);
      color: var(--color-text-main);
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border);
      max-width: 400px;
      width: 90%;
    }

    .modal-content h3 {
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--color-text-main);
    }

    .modal-content p {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-6);
    }

    .modal-actions button {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border: 1px solid var(--color-border);
    }

    .btn-cancel {
      background: var(--color-surface);
      color: var(--color-text-main);
    }

    .btn-cancel:hover {
      background: var(--color-surface-muted);
    }

    .btn-danger {
      background: var(--color-danger);
      color: white;
      border-color: var(--color-danger);
    }

    .btn-danger:hover {
      opacity: 0.9;
    }
  `],
})
export class ConfirmDialogComponent {
  dialogService = inject(ConfirmDialogService);
}