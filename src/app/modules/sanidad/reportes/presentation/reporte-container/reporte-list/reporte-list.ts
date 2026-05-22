import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'zt-reporte-list',
  imports: [TranslatePipe],
  templateUrl: './reporte-list.html',
  styleUrl: './reporte-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesList {}
