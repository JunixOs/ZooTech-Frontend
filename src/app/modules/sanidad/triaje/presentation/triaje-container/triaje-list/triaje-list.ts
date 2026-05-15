import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-list',
  imports: [TranslatePipe],
  templateUrl: './triaje-list.html',
  styleUrl: './triaje-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeList {}
