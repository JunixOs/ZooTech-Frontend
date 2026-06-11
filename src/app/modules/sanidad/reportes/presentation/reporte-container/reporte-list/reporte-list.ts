import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";

@Component({
  selector: 'zt-reporte-list',
  imports: [PageHeaderComponent],
  templateUrl: './reporte-list.html',
  styleUrl: './reporte-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesList {}
