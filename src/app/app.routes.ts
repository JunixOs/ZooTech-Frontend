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
        loadChildren: () =>
          import('@modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        canActivate: [authAdminGuard],
      },
      /* ================================================================
         Vacunos
         ================================================================ */
      { path: 'vacuno', redirectTo: 'vacunos/listado', pathMatch: 'full' },
      { path: 'vacuno/editar/:codigo', redirectTo: 'vacunos/editar/:codigo', pathMatch: 'full' },
      { path: 'vacuno/agregar', redirectTo: 'vacunos/agregar', pathMatch: 'full' },
      { path: 'vacuno/reportes', redirectTo: 'vacunos/reportes', pathMatch: 'full' },
      { path: 'vacuno/detalle/:codigo', redirectTo: 'vacunos/detalle/:codigo', pathMatch: 'full' },
      { path: 'vacuno/:codigo', redirectTo: 'vacunos/:codigo', pathMatch: 'full' },
      {
        path: 'vacunos',
        loadChildren: () => import('@modules/vacunos/vacunos.routes').then((m) => m.VACUNOS_ROUTES),
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
