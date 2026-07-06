import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
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
  download = output<DownloadFormat>();

  showMenu = signal(false);

  toggleMenu(): void {
    this.showMenu.update((v) => !v);
  }

  onSelectFormat(formato: DownloadFormat): void {
    this.showMenu.set(false);
    this.download.emit(formato);
  }
}