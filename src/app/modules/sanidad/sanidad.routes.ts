import { Routes } from '@angular/router';

export const SANIDAD_ROUTES: Routes = [
  {
    path: 'triaje',
    loadComponent: () =>
      import('./presentation/triaje-container/triaje-container').then((m) => m.TriajeContainer),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./presentation/reporte-container/reporte-container').then((m) => m.ReporteContainer),
  },
];
