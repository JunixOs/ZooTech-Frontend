import { Routes } from '@angular/router';

export const LECHE_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./presentation/leche-container/leche-container').then((m) => m.LecheContainer),
  },
  {
    path: 'reporte',
    loadComponent: () =>
      import('./presentation/leche-report/leche-report').then((m) => m.LecheReport),
  },
  {
    path: 'reporte/produccion-diaria',
    loadComponent: () =>
      import(
        './presentation/leche-report-daily/produccion-diaria-report'
      ).then((m) => m.ProduccionDiariaReport),
  },
  {
    path: 'reporte/produccion-vs-standard',
    loadComponent: () =>
      import(
        './presentation/leche-report-comparison/comparacion-produccion-report'
      ).then((m) => m.ComparacionProduccionReport),
  },
];
