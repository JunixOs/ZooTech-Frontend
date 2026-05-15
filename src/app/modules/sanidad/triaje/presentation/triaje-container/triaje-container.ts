import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-container',
  imports: [TranslatePipe],
  templateUrl: './triaje-container.html',
  styleUrl: './triaje-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeContainer {}
