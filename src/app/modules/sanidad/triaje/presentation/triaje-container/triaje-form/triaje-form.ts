import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-triaje-form',
  imports: [TranslatePipe],
  templateUrl: './triaje-form.html',
  styleUrl: './triaje-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriajeForm {}
