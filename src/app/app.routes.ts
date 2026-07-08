import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { authClientGuard } from '@core/auth/auth-client.guard';
import { authAdminGuard } from '@core/auth/auth-admin.guard';

// NOTE: Terminar de proteger las rutas
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('@modules/admin/presentation/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [authAdminGuard],
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
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/editar/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-form/vacuno-form.component').then(
            (m) => m.VacunoFormComponent,
          ),
        canActivate: [authClientGuard],
      },
      { path: 'vacuno/editar/:codigo', redirectTo: 'vacunos/editar/:codigo', pathMatch: 'full' },
      { path: 'vacuno/agregar', redirectTo: 'vacunos/agregar', pathMatch: 'full' },
      {
        path: 'vacunos/listado',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-container/vacunos-container.component').then(
            (m) => m.VacunosContainerComponent,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-reportes/vacunos-reportes.component').then(
            (m) => m.VacunosReportesComponent,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes/listado',
        loadComponent: () =>
          import('@modules/vacunos/reportes/presentation/listado-vacuno-container/listado-vacuno-container.component').then(
            (m) => m.ListadoVacunoContainerComponent,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes/registro/:vacunoId',
        loadComponent: () =>
          import('@modules/vacunos/reportes/presentation/registro-vacuno-detail/registro-vacuno-detail.component').then(
            (m) => m.RegistroVacunoDetailComponent,
          ),
        canActivate: [authClientGuard],
      },
      { path: 'vacuno/reportes', redirectTo: 'vacunos/reportes', pathMatch: 'full' },
      { path: 'vacuno/:codigo', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      /* ================================================================
         Leche
         ================================================================ */
      {
        path: 'leche',
        loadChildren: () => import('@modules/leche/leche.routes').then((m) => m.LECHE_ROUTES),
        canActivate: [authClientGuard],
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
        canActivate: [authClientGuard],
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
        canActivate: [authClientGuard],
      },
      /* ================================================================
         Sanidad
         ================================================================ */
      {
        path: 'sanidad',
        loadChildren: () => import('@modules/sanidad/sanidad.routes').then((m) => m.SANIDAD_ROUTES),
        canActivate: [authClientGuard],
      },
      /* ================================================================
         Reproducción / Celo
         ================================================================ */
      {
        path: 'reproduccion/celo',
        loadChildren: () =>
          import('@modules/reproduccion/celo/celo.routes').then((m) => m.CELO_ROUTES),
        canActivate: [authClientGuard],
      },
      {
        path: 'reproduccion/fecundacion',
        loadComponent: () =>
          import('@modules/reproduccion/fecundacion/presentation/fecundacion-container/fecundacion-container.component').then(
            (m) => m.FecundacionContainerComponent,
          ),
        canActivate: [authClientGuard],
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@modules/auth/presentation/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('@shared/ui/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/ui/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
