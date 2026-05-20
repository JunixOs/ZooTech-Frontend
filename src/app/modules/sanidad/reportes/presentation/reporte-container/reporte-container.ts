import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";

@Component({
  selector: 'zt-reporte-container',
  imports: [PageHeaderComponent],
  templateUrl: './reporte-container.html',
  styleUrl: './reporte-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {}
