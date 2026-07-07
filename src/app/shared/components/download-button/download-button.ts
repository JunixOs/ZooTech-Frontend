import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type DownloadFormat = 'excel' | 'pdf';

@Component({
  selector: 'zt-download-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './download-button.html',
  styleUrl: './download-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadButtonComponent {
  disabled = input<boolean>(false);
  download = output<DownloadFormat>();

  showMenu = signal(false);

  toggleMenu(): void {
    if (this.disabled()) return;
    this.showMenu.update((v) => !v);
  }

  onSelectFormat(formato: DownloadFormat): void {
    if (this.disabled()) return;
    this.showMenu.set(false);
    this.download.emit(formato);
  }
}