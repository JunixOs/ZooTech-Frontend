import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-leche-container',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './leche-container.component.html',
  styleUrl: './leche-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecheContainerComponent {}
