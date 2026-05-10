import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'zt-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  open = input(false);
  title = input('');
  size = input<ModalSize>('md');
  showHeader = input(true);
  showCloseButton = input(true);
  closeOnBackdrop = input(true);
  bodyPadding = input(true);

  closed = output<void>();

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
}
