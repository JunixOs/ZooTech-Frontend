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
      /* ================================================================
         Vacunos
         ================================================================ */
      { path: 'vacuno', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      { path: 'vacunos', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      {
        path: 'vacunos/agregar',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-form/vacuno-form.component').then(
            (m) => m.VacunoFormComponent,
          ),
      },
      {
        path: 'vacunos/editar/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-form/vacuno-form.component').then(
            (m) => m.VacunoFormComponent,
          ),
      },
      { path: 'vacuno/editar/:codigo', redirectTo: 'vacunos/editar/:codigo', pathMatch: 'full' },
      { path: 'vacuno/agregar', redirectTo: 'vacunos/agregar', pathMatch: 'full' },
      {
        path: 'vacunos/listado',
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
        path: 'vacunos/reportes/listado',
        loadComponent: () =>
          import('@modules/vacunos/reportes/presentation/listado-vacuno-container/listado-vacuno-container.component').then(
            (m) => m.ListadoVacunoContainerComponent,
          ),
      },
      {
        path: 'vacunos/reportes/registro/:vacunoId',
        loadComponent: () =>
          import('@modules/vacunos/reportes/presentation/registro-vacuno-detail/registro-vacuno-detail.component').then(
            (m) => m.RegistroVacunoDetailComponent,
          ),
      },
      {
        path: 'vacuno/detalle/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-detail/vacuno-detail').then(
            (m) => m.VacunoDetail,
          ),
      },
      { path: 'vacuno/reportes', redirectTo: 'vacunos/reportes', pathMatch: 'full' },
      {
        path: 'vacuno/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-detail/vacuno-detail').then(
            (m) => m.VacunoDetail,
          ),
      },
      /* ================================================================
         Leche
         ================================================================ */
      {
        path: 'leche',
        loadChildren: () => import('@modules/leche/leche.routes').then((m) => m.LECHE_ROUTES),
      },
      /* ================================================================
         Tenencia
         ================================================================ */
      {
        path: 'tenencia/registro',
        loadComponent: () =>
          import('@modules/tenencia/presentation/tenencia-container/tenencia-container.component').then(
            (m) => m.TenenciaContainerComponent,
          ),
      },
      /* ================================================================
         Dashboard
         ================================================================ */
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@modules/dashboard/presentation/dashboard-container/dashboard-container.component').then(
            (m) => m.DashboardContainerComponent,
          ),
      },
      /* ================================================================
         Sanidad
         ================================================================ */
      {
        path: 'sanidad',
        loadChildren: () => import('@modules/sanidad/sanidad.routes').then((m) => m.SANIDAD_ROUTES),
      },
      /* ================================================================
         Reproducción / Celo
         ================================================================ */
      {
        path: 'reproduccion/celo',
        loadChildren: () =>
          import('@modules/reproduccion/celo/celo.routes').then((m) => m.CELO_ROUTES),
      },
      {
        path: 'reproduccion/fecundacion',
        loadComponent: () =>
          import('@modules/reproduccion/fecundacion/presentation/fecundacion-list/fecundacion-list').then(
            (m) => m.FecundacionList,
          ),
      },
      {
        path: 'reproduccion/fecundacion/registrar',
        loadComponent: () => import('@modules/reproduccion/fecundacion/presentation/fecundacion-form/fecundacion-form').then(
          (m) => m.FecundacionForm),
      },
      {
        path: 'reproduccion/fecundacion/detalle/:id',
        loadComponent: () =>
          import('@modules/reproduccion/fecundacion/presentation/fecundacion-detail/fecundacion-detail').then(
            (m) => m.FecundacionDetail,
          ),
      },
      {
        path: 'reproduccion/fecundacion/estadodefecundacion',
        loadComponent: () =>
          import('@modules/reproduccion/fecundacion/presentation/fecundacion-list/fecundacion-list').then(
            (m) => m.FecundacionList,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
