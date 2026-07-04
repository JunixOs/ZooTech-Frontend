import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-reporte-listado-grafico-vacuno',
  imports: [PageHeaderComponent],
  template: `
    <zt-page-header
      title="sanidad.cards.graficoTriajeVacuno.title"
      breadcrumbParent="sanidad.reportes.title"
      breadcrumbParentRoute="/sanidad/reportes"
      breadcrumbCurrent="sanidad.cards.graficoTriajeVacuno.title"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteListadoGraficoVacuno {}
