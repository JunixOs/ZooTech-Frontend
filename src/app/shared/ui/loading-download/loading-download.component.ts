import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDownloadService } from '../../services/loading-download.service';

@Component({
  selector: 'zt-loading-download',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './loading-download.component.html',
  styleUrl: './loading-download.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDownloadComponent {
  protected readonly service = inject(LoadingDownloadService);
}
