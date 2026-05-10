import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/auth/presentation/login/login.component').then((m) => m.LoginComponent),
    pathMatch: 'full',
  },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('@modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'sanidad/triaje',
        loadComponent: () =>
          import('./modules/sanidad/presentation/triaje-container/triaje-container').then(
            (m) => m.TriajeContainer,
          ),
      },
      {
        path: 'sanidad/reportes',
        loadComponent: () =>
          import('./modules/sanidad/presentation/reporte-container/reporte-container').then(
            (m) => m.ReporteContainer,
          ),
      },
      {
        path: 'milkproductions',
        loadChildren: () =>
          import('@modules/milkproductions/milkproductions.routes').then((m) => m.MILK_PRODUCTIONS_ROUTES),
        loadComponent: () =>
          import('./modules/dashboard/presentation/dashboard-container/dashboard-container.component').then(
            (m) => m.DashboardContainerComponent,
          ),
      },
      
    ],
  },
  { path: '**', redirectTo: '' },
];
