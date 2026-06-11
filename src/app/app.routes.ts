import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: 'vacunos/listado',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-container/vacunos-container.component').then(
            (m) => m.VacunosContainerComponent,
          ),
      },
      {
        path: 'leche',
        loadChildren: () => import('@modules/leche/leche.routes').then((m) => m.LECHE_ROUTES),
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
        path: 'sanidad',
        loadChildren: () =>
          import('@modules/sanidad/sanidad.routes').then((m) => m.SANIDAD_ROUTES),
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
          import(
            '@modules/reproduccion/celo/presentation/vacas-celo/vacas-celo.component'
          ).then((m) => m.VacasCeloComponent),
      },
      {
        path: 'reproduccion/celo/reportes',
        loadComponent: () =>
          import(
            '@modules/reproduccion/celo/presentation/reportes-celo/reportes-celo.component'
          ).then((m) => m.ReportesCeloComponent),
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