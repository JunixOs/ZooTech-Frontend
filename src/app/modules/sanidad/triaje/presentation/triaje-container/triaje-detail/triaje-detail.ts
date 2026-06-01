import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-detail',
  imports: [TranslatePipe],
  templateUrl: './triaje-detail.html',
  styleUrl: './triaje-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeDetail {}
