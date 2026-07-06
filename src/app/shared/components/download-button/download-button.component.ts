import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-download-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadButtonComponent {
  labelKey = input<string>('shared.actions.download');

  clicked = output<void>();
}
