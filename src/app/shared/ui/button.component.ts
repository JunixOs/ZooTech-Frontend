import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'zt-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="'btn btn-' + variant" [disabled]="loading">
      <ng-content></ng-content>
      <span *ngIf="loading">...</span>
    </button>
  `,
  styles: [`
    .btn { padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #64748b; color: white; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() loading = false;
}
