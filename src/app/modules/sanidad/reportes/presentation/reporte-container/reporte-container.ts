import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ReportLayoutComponent } from '@shared/components/report-layout/report-layout.component';
import { ReportConfig, DateRange } from '@shared/models/report-config.model';
import { map } from 'rxjs';
import { PageHeaderComponent } from "@shared/components/page-header/page-header";

@Component({
  selector: 'app-reporte-container',
  standalone: true,
  imports: [ReportLayoutComponent, RouterOutlet, PageHeaderComponent],
  templateUrl: './reporte-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteContainer {
    loading = signal(false)
    private readonly router = inject(Router);
    hasChildRoute = signal(false);

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
      route: '/sanidad/reportes/graficoListadoVacuno',
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
}/*
  onDateRangeChange(range: DateRange) {}
  onSearch(term: string) {}
*/
 