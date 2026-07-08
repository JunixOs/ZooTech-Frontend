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
    path: '',
    component: Shell,
    children: [
      /* ================================================================
         Admin
         ================================================================ */
      {
        path: 'admin',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
        canActivate: [authAdminGuard],
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
        canActivate: [authAdminGuard],
      },
      {
        path: 'admin/tenants',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-tenants/admin-tenants.component').then(
            (m) => m.AdminTenantsComponent,
          ),
        canActivate: [authAdminGuard],
      },
      {
        path: 'admin/audit',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-audit/admin-audit.component').then(
            (m) => m.AdminAuditComponent,
          ),
        canActivate: [authAdminGuard],
      },
      {
        path: 'admin/parameters',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-parameters/admin-parameters.component').then(
            (m) => m.AdminParametersComponent,
          ),
        canActivate: [authAdminGuard],
      },
      {
        path: 'admin/settings',
        loadComponent: () =>
          import('@modules/admin/presentation/admin-settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
        canActivate: [authAdminGuard],
      },
      /* ================================================================
         Vacunos
         ================================================================ */
      { path: 'vacuno', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      { path: 'vacunos', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      {
        path: 'vacunos/agregar',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-form/vacuno-form').then(
            (m) => m.VacunoForm,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/editar/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-form/vacuno-form').then(
            (m) => m.VacunoForm,
          ),
        canActivate: [authClientGuard],
      },
      { path: 'vacuno/editar/:codigo', redirectTo: 'vacunos/editar/:codigo', pathMatch: 'full' },
      { path: 'vacuno/agregar', redirectTo: 'vacunos/agregar', pathMatch: 'full' },
      {
        path: 'vacunos/listado',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-container/vacunos-container').then(
            (m) => m.VacunosContainer,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacunos-reportes/vacunos-reportes').then(
            (m) => m.VacunosReportes,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes/listado',
        data: { reportMode: 'listado' },
        loadComponent: () =>
          import('@modules/vacunos/presentation/listado-vacuno-container/listado-vacuno-container').then(
            (m) => m.ListadoVacunoContainer,
          ),
      },
      {
        path: 'vacunos/reportes/registro',
        data: { reportMode: 'registro' },
        loadComponent: () =>
          import('@modules/vacunos/presentation/listado-vacuno-container/listado-vacuno-container').then(
            (m) => m.ListadoVacunoContainer,
          ),
        canActivate: [authClientGuard],
      },
      {
        path: 'vacunos/reportes/registro/:vacunoId',
        loadComponent: () =>
          import('@modules/vacunos/presentation/registro-vacuno-detail/registro-vacuno-detail').then(
            (m) => m.RegistroVacunoDetail,
          ),
      },
      {
        path: 'vacuno/detalle/:codigo',
        loadComponent: () =>
          import('@modules/vacunos/presentation/vacuno-detail/vacuno-detail').then(
            (m) => m.VacunoDetail,
          ),
        canActivate: [authClientGuard],
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
        loadChildren: () =>
          import('@modules/reproduccion/fecundacion/fecundacion.routes').then(
            (m) => m.FECUNDACION_ROUTES,
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
