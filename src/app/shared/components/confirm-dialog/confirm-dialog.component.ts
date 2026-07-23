// shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'zt-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  dialogService = inject(ConfirmDialogService);

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dialogService.setInputValue(inputElement.value);
  }
}