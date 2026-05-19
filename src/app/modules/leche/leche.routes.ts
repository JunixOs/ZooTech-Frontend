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
      import('./presentation/leche-container/leche-container').then((m) => m.LecheContainer),
  },
];
