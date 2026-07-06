import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';
import { ReporteFiltroService } from '@modules/sanidad/infrastructure/services/filtro.service';

@Component({
  selector: 'zt-reporte-container',
  standalone: true,
  imports: [ReportLayoutComponent, RouterOutlet, PageHeaderComponent],
  templateUrl: './reporte-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  private readonly router = inject(Router);
  private readonly filtroService = inject(ReporteFiltroService);

  loading = signal(false);
  hasChildRoute = signal(false);
  selectedReport = signal<string | null>(null);

  reports = signal<ReportConfig[]>([

    //GENERAL
    {
      title: 'sanidad.cards.reporteListadoTriajeGeneral.title',
      description: 'sanidad.cards.reporteListadoTriajeGeneral.description',
      icon: 'fa-solid fa-list',
      route: '/sanidad/reportes/listadoGeneral',
    },
        //GRAFICO
    {
      title: 'sanidad.cards.graficoTriajeGeneral.title',
      description: 'sanidad.cards.graficoTriajeGeneral.description',
      icon: 'fa-solid fa-chart-gantt',
      route: '/sanidad/reportes/graficoListadoGeneral',
    },


    //INDIVIDUAL
    {
      title: 'sanidad.cards.reporteListadoTriajeVacuno.title',
      description: 'sanidad.cards.reporteListadoTriajeVacuno.description',
      icon: 'fa-solid fa-cow',
      route: '/sanidad/reportes/listadoVacuno', 
    },

    //GRAFICO
    {
      title: 'sanidad.cards.graficoTriajeVacuno.title',
      description: 'sanidad.cards.graficoTriajeVacuno.description',
      icon: 'fa-solid fa-chart-line',
      route: '/sanidad/reportes/graficoListadoVacuno/1',
    },
  ]);

  constructor() {
    this.hasChildRoute.set(this.router.url !== '/sanidad/reportes');        
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.hasChildRoute.set(this.router.url !== '/sanidad/reportes')
        }
    });
  }

  onRangeChange(range: DateRange): void {
    if (range.start === null && range.end === null) {
      this.filtroService.resetDefault();
      return;
    }

    if (range.start && range.end) {
      this.filtroService.actualizarRango(
        this.toDateOnlyString(range.start),
        this.toDateOnlyString(range.end),
      );
    }
  }

  private toDateOnlyString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}