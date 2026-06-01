import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
<<<<<<< Updated upstream
=======
import { authChildGuard } from '@core/auth/auth.guard';
>>>>>>> Stashed changes

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@modules/auth/presentation/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
<<<<<<< Updated upstream
    component: Shell,
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./modules/dashboard/presentation/dashboard-container/dashboard-container.component')
          .then(m => m.DashboardContainerComponent) 
      },
      { 
      path: 'sanidad/triaje', 
      loadComponent: () => import('./modules/sanidad/presentation/triaje-container/triaje-container')
        .then(m => m.TriajeContainer) 
    },
          { 
      path: 'sanidad/reportes', 
      loadComponent: () => import('./modules/sanidad/presentation/reporte-container/reporte-container')
        .then(m => m.ReporteContainer) 
      },
      {
        path: 'vacunos',
        loadComponent: () => import('./modules/vacuno/presentation/vacuno-container/vacuno-container')
          .then(m => m.VacunoContainerComponent),
      },
    ]
=======
    redirectTo: '/dashboard',
    pathMatch: 'full',
>>>>>>> Stashed changes
  },
  {
    path: '',
    component: Shell,
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'vacunos',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-container/vacunos-container.component').then(
            (m) => m.VacunosContainerComponent,
          ),
      },
      {
        path: 'vacunos/listado',
        redirectTo: '/vacunos',
        pathMatch: 'full',
      },
      {
        path: 'vacunos/agregar',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-container/vacunos-container.component').then(
            (m) => m.VacunosContainerComponent,
          ),
      },
      {
        path: 'vacunos/reportes',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-reportes/vacunos-reportes.component').then(
            (m) => m.VacunosReportesComponent,
          ),
      },
      {
        path: 'leche/registro',
        loadComponent: () =>
          import('@modules/leche/presentation/leche-container/leche-container.component').then(
            (m) => m.LecheContainerComponent,
          ),
      },
      {
        path: 'tenencia/registro',
        loadComponent: () =>
          import('@modules/tenencia/presentation/tenencia-container/tenencia-container.component').then(
            (m) => m.TenenciaContainerComponent,
          ),
      },
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
        path: 'reproduccion/celo',
        loadComponent: () =>
          import('@modules/reproduccion/celo/presentation/celo-container/celo-container.component').then(
            (m) => m.CeloContainerComponent,
          ),
      },
      {
        path: 'reproduccion/celo/vacas',
        loadComponent: () =>
          import('@modules/reproduccion/celo/presentation/celo-container/celo-container.component').then(
            (m) => m.CeloContainerComponent,
          ),
      },
      {
        path: 'reproduccion/celo/reportes',
        loadComponent: () =>
          import('@modules/reproduccion/celo/presentation/celo-container/celo-container.component').then(
            (m) => m.CeloContainerComponent,
          ),
      },
      {
        path: 'reproduccion/fecundacion',
        loadComponent: () =>
          import('@modules/reproduccion/fecundacion/presentation/fecundacion-container/fecundacion-container.component').then(
            (m) => m.FecundacionContainerComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
