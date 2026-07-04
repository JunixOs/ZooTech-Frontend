import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig } from '@shared/models/report-config.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header';

@Component({
  selector: 'zt-reporte-container',
  standalone: true,
  imports: [ReportLayoutComponent, RouterOutlet, PageHeaderComponent],
  templateUrl: './reporte-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
  private readonly router = inject(Router);

  loading = signal(false);
  hasChildRoute = signal(false);
  selectedReport = signal<string | null>(null);

  reports = signal<ReportConfig[]>([

    //GENERAL
    {
      title: 'sanidad.cards.reporteListadoTriajeGeneral.title',
      description: 'sanidad.cards.reporteListadoGeneralTriaje.description',
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
}
