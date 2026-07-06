import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DownloadButtonComponent } from '@shared/components/download-button/download-button.component';

@Component({
  selector: 'zt-download-menu',
  standalone: true,
  imports: [TranslatePipe, DownloadButtonComponent],
  templateUrl: './download-menu.component.html',
  styleUrl: './download-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadMenuComponent {
  readonly open = signal(false);

  readonly downloadExcel = output<void>();
  readonly downloadPdf = output<void>();

  toggle(): void {
    this.open.update((value) => !value);
  }

  onDownloadExcel(): void {
    this.downloadExcel.emit();
    this.open.set(false);
  }

  onDownloadPdf(): void {
    this.downloadPdf.emit();
    this.open.set(false);
  }
}
