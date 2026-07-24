import { Routes } from '@angular/router';
import { authClientGuard } from '@core/auth/auth-client.guard';

export const VACUNOS_ROUTES: Routes = [
  { path: '', redirectTo: 'listado', pathMatch: 'full' },
  {
    path: 'agregar',
    loadComponent: () =>
      import('./presentation/vacuno-form/vacuno-form').then((m) => m.VacunoForm),
    canActivate: [authClientGuard],
  },
  {
    path: 'editar/:codigo',
    loadComponent: () =>
      import('./presentation/vacuno-form/vacuno-form').then((m) => m.VacunoForm),
    canActivate: [authClientGuard],
  },
  {
    path: 'listado',
    loadComponent: () =>
      import('./presentation/vacunos-container/vacunos-container').then((m) => m.VacunosContainer),
    canActivate: [authClientGuard],
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./presentation/vacunos-reportes/vacunos-reportes').then((m) => m.VacunosReportes),
    canActivate: [authClientGuard],
  },
  {
    path: 'reportes/listado',
    data: { reportMode: 'listado' },
    loadComponent: () =>
      import('./presentation/listado-vacuno-container/listado-vacuno-container').then(
        (m) => m.ListadoVacunoContainer,
      ),
  },
  {
    path: 'reportes/registro',
    data: { reportMode: 'registro' },
    loadComponent: () =>
      import('./presentation/listado-vacuno-container/listado-vacuno-container').then(
        (m) => m.ListadoVacunoContainer,
      ),
    canActivate: [authClientGuard],
  },
  {
    path: 'reportes/registro/:vacunoId',
    loadComponent: () =>
      import('./presentation/registro-vacuno-detail/registro-vacuno-detail').then(
        (m) => m.RegistroVacunoDetail,
      ),
  },
  {
    path: 'detalle/:codigo',
    loadComponent: () =>
      import('./presentation/vacuno-detail/vacuno-detail').then((m) => m.VacunoDetail),
    canActivate: [authClientGuard],
  },
  {
    path: ':codigo',
    loadComponent: () =>
      import('./presentation/vacuno-detail/vacuno-detail').then((m) => m.VacunoDetail),
  },
];
