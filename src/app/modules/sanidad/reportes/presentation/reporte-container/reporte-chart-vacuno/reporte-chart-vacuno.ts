import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-chart-vacuno',
  imports: [TranslatePipe],
  templateUrl: './reporte-chart-vacuno.html',
  styleUrl: './reporte-chart-vacuno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesChartVacuno {}
