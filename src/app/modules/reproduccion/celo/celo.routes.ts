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
      import('./presentation/vacas-celo/vacas-celo.component').then((m) => m.VacasCeloComponent),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./presentation/reportes-celo/reportes-celo.component').then(
        (m) => m.ReportesCeloComponent,
      ),
  },
];
