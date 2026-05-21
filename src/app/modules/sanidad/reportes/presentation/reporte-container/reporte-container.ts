import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-container',
  imports: [TranslatePipe],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {}
