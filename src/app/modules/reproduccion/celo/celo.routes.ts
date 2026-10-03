import { Routes } from '@angular/router';

export const CELO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/celo-container/celo-container.component').then(
        (m) => m.CeloContainerComponent,
      ),
  },
  {
    path: 'vacas',
    loadComponent: () =>
      import('./presentation/vacas-celo/vacas-celo.component').then(
        (m) => m.VacasCeloComponent,
      ),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./presentation/reportes-celo/reportes-celo.component').then(
        (m) => m.ReportesCeloComponent,
      ),
  },
  {
    path: 'reportes/general',
    loadComponent: () =>
      import('./presentation/reportes-celo/reportes-celo-general/reportes-celo-general.component').then(
        (m) => m.ReportesCeloGeneralComponent,
      ),
  },
  {
    path: 'reportes/reporte-celo-vacuno',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/reporte-celo-vacuno/reporte-celo-vacuno.component'
      ).then((m) => m.ReporteCeloVacunoComponent),
  },
  {
    path: 'reportes/reporte-celo-vacuno/:codigoVacuno',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/reporte-celo-vacuno-detalle/reporte-celo-vacuno-detalle.component'
      ).then((m) => m.ReporteCeloVacunoDetalleComponent),
  },
  {
    path: 'reportes/comparacion-real-vs-estandar',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/comparacion-real-vs-estandar/comparacion-real-vs-estandar'
      ).then((m) => m.ComparacionRealVsEstandarComponent),
  },
  {
    path: 'reportes/comparacion-por-vacuno',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/comparacion-por-vacuno/comparacion-por-vacuno.component'
      ).then((m) => m.ComparacionPorVacunoComponent),
  },
  {
    path: 'reportes/comparacion-por-vacuno/:codigoVacuno',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/comparacion-por-vacuno-detalle/comparacion-por-vacuno-detalle.component'
      ).then((m) => m.ComparacionPorVacunoDetalleComponent),
  },
];
