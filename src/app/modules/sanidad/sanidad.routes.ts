import { pattern } from '@angular/forms/signals';
import { Routes } from '@angular/router';

export const SANIDAD_ROUTES: Routes = [
  {
    path: 'triaje',
    loadComponent: () =>
      import('./triaje/presentation/triaje-container/triaje-container').then(
        (m) => m.TriajeContainer,
      ),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./reportes/presentation/reporte-container/reporte-container').then(
        (m) => m.ReporteContainer,
      ),
      children:[
        {
          path: 'listadoGeneral',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-general/reporte-listado-general').then(
              (m) => m.ReporteListadoGeneral,
            )
        },

        //PATH GRAFICO GENERAL
        {
          path: 'graficoListadoGeneral',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-grafico-general/reporte-listado-grafico-general').then(
              (m) => m.ReporteGraficoListadoGeneral,
            )
        },



        {
          path: 'listadoVacuno',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-vacuno/reporte-listado-vacuno').then(
              (m) => m.ReporteListadoVacuno,
            )
        },

        {
          path: 'listadoVacuno/:id',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-triaje-por-vacuno/reporte-triaje-por-vacuno').then(
              (m) => m.ReporteTriajePorVacuno,
            )
        },

        //PATH GRAFICO INDIVIDUAL
        {
          path: 'graficoListadoVacuno',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-vacuno/reporte-listado-vacuno').then(
              (m) => m.ReporteListadoVacuno,
            )
        },
        {
          path: 'alimentacionList',
          loadComponent: () =>
            import('./reportes/presentation/reporte-container/reporte-listado-vacuno/reporte-listado-vacuno').then(
              (m) => m.ReporteListadoVacuno,
            )
        },
      ]
  },
];
