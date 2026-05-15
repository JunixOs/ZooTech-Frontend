import { Routes } from '@angular/router';

export const SANIDAD_ROUTES: Routes = [
  {
    path: 'triaje',
    loadComponent: () =>
      import('./triaje/presentation/triaje-container/triaje-container').then((m) => m.TriajeContainer),
  },
];