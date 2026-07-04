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
    path: 'reportes/comparacion-real-vs-estandar',
    loadComponent: () =>
      import(
        './presentation/reportes-celo/comparacion-real-vs-estandar/comparacion-real-vs-estandar'
      ).then((m) => m.ComparacionRealVsEstandarComponent)
  },
];
