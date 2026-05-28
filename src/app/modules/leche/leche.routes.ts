import { Routes } from '@angular/router';

export const LECHE_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./presentation/leche-container/leche-container').then((m) => m.LecheContainer),
  },
  {
    path: 'reporte',
    loadChildren: () =>
      import('./presentation/leche-report/leche-report').then((m) => m.LECHE_REPORT_ROUTES),
  },
];
