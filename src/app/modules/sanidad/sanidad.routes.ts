import { Routes } from '@angular/router';

export const SANIDAD_ROUTES: Routes = [
  {
    path: 'triaje',
    loadComponent: () =>
      import('./presentation/triaje-container/triaje-container').then(
        (m) => m.TriajeContainer,
      ),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./presentation/triaje-report/reporte-container').then(
        (m) => m.ReporteContainer,
      ),
      children:[
        {
          path: 'listadoGeneral',
          loadComponent: () =>
            import('./presentation/triaje-report/reporte-listado-general/reporte-listado-general').then(
              (m) => m.ReporteListadoGeneral,
            )
        },

        //PATH GRAFICO GENERAL
        {
          path: 'graficoListadoGeneral',
          loadComponent: () =>
            import('./presentation/triaje-report/reporte-listado-grafico-general/reporte-listado-grafico-general').then(
              (m) => m.ReporteGraficoListadoGeneral,
            )
        },

        {
          path: 'listadoVacuno',
          loadComponent: () =>
            import('./presentation/triaje-report/reporte-listado-vacuno/reporte-listado-vacuno').then(
              (m) => m.ReporteListadoVacuno,
            )
        },

        {
          path: 'listadoVacuno/:id',
          loadComponent: () =>
            import('./presentation/triaje-report/reporte-triaje-por-vacuno/reporte-triaje-por-vacuno').then(
              (m) => m.ReporteTriajePorVacuno,
            )
        },

       //PATH GRAFICO INDIVIDUAL
        {
          path: 'graficoListadoVacuno/:id',
          loadComponent: () =>
            import('./presentation/triaje-report/reporte-listado-grafico-vacuno/reporte-listado-grafico-vacuno').then(
              (m) => m.ReporteListadoGraficoVacuno,
            )
        },
      ]
  },
];

