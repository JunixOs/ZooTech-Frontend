import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-chart-general',
  imports: [TranslatePipe],
  templateUrl: './reporte-chart-general.html',
  styleUrl: './reporte-chart-general.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteChartGeneral {}
