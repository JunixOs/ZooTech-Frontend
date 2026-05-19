import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-list',
  imports: [TranslatePipe],
  templateUrl: './reporte-list.html',
  styleUrl: './reporte-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesList {}
