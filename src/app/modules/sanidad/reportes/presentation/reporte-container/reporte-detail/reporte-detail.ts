import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-detail',
  imports: [TranslatePipe],
  templateUrl: './reporte-detail.html',
  styleUrl: './reporte-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesDetail {}
