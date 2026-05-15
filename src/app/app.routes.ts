import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@modules/auth/presentation/login/login.component').then((m) => m.LoginComponent),
    pathMatch: 'full',
  },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@modules/dashboard/presentation/dashboard-container/dashboard-container.component').then(
            (m) => m.DashboardContainerComponent,
          ),
      },
      {
        path: 'sanidad/triaje',
        loadComponent: () =>
          import('@modules/sanidad/triaje/presentation/triaje-container/triaje-container').then(
            (m) => m.TriajeContainer,
          ),
      },
      {
        path: 'sanidad/reportes',
        loadComponent: () =>
          import('@modules/sanidad/reportes/presentation/reporte-container/reporte-container').then(
            (m) => m.ReporteContainer,
          ),
      },
      {
        path: 'reproduccion/celo',
        loadComponent: () =>
          import('@modules/reproduccion/celo/presentation/celo-container/celo-container.component').then(
            (m) => m.CeloContainerComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
